import { Save, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, ApiError, withDemoFallback } from "../../../core/http/httpClient";
import { mapAlerts, mapInventoryItems } from "../../../core/http/mappers";
import { Badge, InlineFeedback, ModulePanel, PageHeader, Progress, StatCard } from "../../../shared/ui/primitives";
import { demoAlertas, demoInventario } from "../../../data/demo";
import type { Alerta, InventarioItem } from "../../../types";

const emptyMovement = {
  tipo: "entrada",
  cantidad: "1",
  motivo: "Ajuste operativo",
  referencia: "WEB-001"
};

export function InventarioPage() {
  const [items, setItems] = useState<InventarioItem[]>(demoInventario);
  const [alerts, setAlerts] = useState<Alerta[]>(demoAlertas);
  const [selectedId, setSelectedId] = useState<string>(demoInventario[0]?.id ?? "");
  const [itemForm, setItemForm] = useState<InventarioItem | null>(demoInventario[0] ?? null);
  const [movement, setMovement] = useState(emptyMovement);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSnapshot() {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await withDemoFallback(async () => {
        const [itemsRaw, alertsRaw] = await Promise.all([api.inventario(), api.alertas()]);
        return {
          items: mapInventoryItems(itemsRaw),
          alerts: mapAlerts(alertsRaw)
        };
      }, async () => ({ items: demoInventario, alerts: demoAlertas }));

      setItems(snapshot.items);
      setAlerts(snapshot.alerts);
      const picked = snapshot.items.find((item) => item.id === selectedId) ?? snapshot.items[0] ?? null;
      setSelectedId(picked?.id ?? "");
      setItemForm(picked);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cargar inventario.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSnapshot();
  }, []);

  useEffect(() => {
    const selected = items.find((item) => item.id === selectedId) ?? null;
    setItemForm(selected);
  }, [items, selectedId]);

  const metrics = useMemo(() => ({
    items: items.length,
    reorder: items.filter((item) => item.stockActual <= item.puntoReorden).length,
    alerts: alerts.filter((alert) => !alert.leida).length
  }), [alerts, items]);

  async function saveItem() {
    if (!itemForm) return;
    setSaving(true);
    setError(null);
    try {
      try {
        await api.actualizarItemInventario(itemForm.id, {
          nombre: itemForm.nombre,
          descripcion: itemForm.descripcion,
          unidadMedida: itemForm.unidadMedida,
          stockMinimo: itemForm.stockMinimo,
          stockMaximo: itemForm.stockMaximo,
          puntoReorden: itemForm.puntoReorden,
          costoUnitario: itemForm.costoUnitario,
          proveedorPreferidoId: itemForm.proveedorPreferidoId || null,
          tiempoEntregaProveedorDias: itemForm.tiempoEntregaProveedorDias ?? 1,
          clasificacionAbc: itemForm.clasificacionAbc,
          activo: itemForm.activo ?? true
        });
        await loadSnapshot();
      } catch (reason) {
        if (reason instanceof ApiError) throw reason;
        setItems((current) => current.map((item) => item.id === itemForm.id ? itemForm : item));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo actualizar el item.");
    } finally {
      setSaving(false);
    }
  }

  async function saveMovement() {
    if (!itemForm) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        itemInventarioId: itemForm.id,
        cantidad: Number(movement.cantidad),
        motivo: movement.motivo,
        referencia: movement.referencia
      };
      try {
        if (movement.tipo === "entrada") {
          await api.registrarEntradaInventario(payload);
        } else {
          await api.registrarSalidaInventario(payload);
        }
        await loadSnapshot();
      } catch (reason) {
        if (reason instanceof ApiError) throw reason;
        const delta = movement.tipo === "entrada" ? Number(movement.cantidad) : Number(movement.cantidad) * -1;
        setItems((current) => current.map((item) => item.id === itemForm.id ? {
          ...item,
          stockActual: Math.max(0, item.stockActual + delta),
          estadoStock: item.stockActual + delta <= item.puntoReorden ? "CRITICO" : "DISPONIBLE"
        } : item));
      }
      setMovement((current) => ({ ...current, cantidad: "1" }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo registrar el movimiento.");
    } finally {
      setSaving(false);
    }
  }

  async function attendAlert(id: string) {
    setSaving(true);
    setError(null);
    try {
      try {
        await api.atenderAlerta(id);
        await loadSnapshot();
      } catch (reason) {
        if (reason instanceof ApiError) throw reason;
        setAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, leida: true } : alert));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo atender la alerta.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Inventario" eyebrow="Stock, movimientos y alertas para evitar quiebres de insumos" image="/images/inventory-shelves.png" action={<button className="btn-primary rounded-2xl" onClick={loadSnapshot}>Actualizar stock</button>} />
      <InlineFeedback loading={loading || saving} error={error} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Items activos" value={String(metrics.items)} />
        <StatCard label="Bajo reorden" value={String(metrics.reorder)} tone="maize" />
        <StatCard label="Alertas abiertas" value={String(metrics.alerts)} tone="tomato" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <ModulePanel title="Stock operativo" port="Existencias actuales" description="Aquí ves el nivel real de cada insumo y su impacto sobre la disponibilidad de la carta.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr><th className="p-4">Item</th><th>ABC</th><th>Stock</th><th>Reorden</th><th>Costo</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const percent = (item.stockActual / item.stockMaximo) * 100;
                  const low = item.stockActual <= item.puntoReorden;
                  return (
                    <tr key={item.id} className={`cursor-pointer border-t border-stone-100 ${selectedId === item.id ? "bg-herb/5" : ""}`} onClick={() => setSelectedId(item.id)}>
                      <td className="p-4"><b>{item.nombre}</b><p className="text-stone-500">{item.descripcion}</p></td>
                      <td><Badge tone={item.clasificacionAbc === "ALTA" ? "green" : item.clasificacionAbc === "MEDIA" ? "yellow" : "neutral"}>{item.clasificacionAbc}</Badge></td>
                      <td className="w-64"><Progress value={percent} /><p className="mt-1 text-xs">{item.stockActual} / {item.stockMaximo} {item.unidadMedida}</p></td>
                      <td>{item.puntoReorden}</td>
                      <td>BOB {item.costoUnitario}</td>
                      <td><Badge tone={low ? "red" : "green"}>{item.estadoStock || (low ? "CRITICO" : "OK")}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ModulePanel>

        <div className="space-y-6">
          <ModulePanel title="Editar parámetros" port="Reglas de reposición" description="Ajusta umbrales para prevenir faltantes y mantener la operación estable.">
            {itemForm ? (
              <div className="space-y-3">
                <label><span className="mb-1 block text-sm font-bold">Nombre</span><input className="input" value={itemForm.nombre} onChange={(event) => setItemForm({ ...itemForm, nombre: event.target.value })} /></label>
                <label><span className="mb-1 block text-sm font-bold">Descripcion</span><input className="input" value={itemForm.descripcion} onChange={(event) => setItemForm({ ...itemForm, descripcion: event.target.value })} /></label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label><span className="mb-1 block text-sm font-bold">Stock minimo</span><input className="input" type="number" value={itemForm.stockMinimo} onChange={(event) => setItemForm({ ...itemForm, stockMinimo: Number(event.target.value) })} /></label>
                  <label><span className="mb-1 block text-sm font-bold">Stock maximo</span><input className="input" type="number" value={itemForm.stockMaximo} onChange={(event) => setItemForm({ ...itemForm, stockMaximo: Number(event.target.value) })} /></label>
                  <label><span className="mb-1 block text-sm font-bold">Punto reorden</span><input className="input" type="number" value={itemForm.puntoReorden} onChange={(event) => setItemForm({ ...itemForm, puntoReorden: Number(event.target.value) })} /></label>
                  <label><span className="mb-1 block text-sm font-bold">Costo unitario</span><input className="input" type="number" step="0.01" value={itemForm.costoUnitario} onChange={(event) => setItemForm({ ...itemForm, costoUnitario: Number(event.target.value) })} /></label>
                </div>
                <button className="btn-primary w-full rounded-2xl" onClick={saveItem}><Save size={16} /> Guardar parametros</button>
              </div>
            ) : <p className="text-sm text-stone-500">Selecciona un item para editarlo.</p>}
          </ModulePanel>

          <ModulePanel title="Movimientos de stock" port="Entradas y salidas" description="Registra movimientos para que el stock real quede reflejado al instante.">
            {itemForm ? (
              <div className="space-y-3">
                <label><span className="mb-1 block text-sm font-bold">Tipo</span><select className="input" value={movement.tipo} onChange={(event) => setMovement((current) => ({ ...current, tipo: event.target.value }))}><option value="entrada">Entrada</option><option value="salida">Salida</option></select></label>
                <label><span className="mb-1 block text-sm font-bold">Cantidad</span><input className="input" type="number" min="0.01" step="0.01" value={movement.cantidad} onChange={(event) => setMovement((current) => ({ ...current, cantidad: event.target.value }))} /></label>
                <label><span className="mb-1 block text-sm font-bold">Motivo</span><input className="input" value={movement.motivo} onChange={(event) => setMovement((current) => ({ ...current, motivo: event.target.value }))} /></label>
                <label><span className="mb-1 block text-sm font-bold">Referencia</span><input className="input" value={movement.referencia} onChange={(event) => setMovement((current) => ({ ...current, referencia: event.target.value }))} /></label>
                <button className="btn-primary w-full rounded-2xl" onClick={saveMovement}>Registrar movimiento</button>
              </div>
            ) : null}
          </ModulePanel>
        </div>
      </div>

      <ModulePanel title="Alertas de stock" port="Atención prioritaria" description="Identifica riesgos de faltante antes de que afecten la venta o la producción.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-2xl border border-stone-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{alert.titulo}</p>
                  <p className="mt-1 text-sm text-stone-500">{alert.descripcion}</p>
                </div>
                <Badge tone={alert.severidad === "CRITICA" ? "red" : alert.severidad === "ADVERTENCIA" ? "yellow" : "blue"}>{alert.severidad}</Badge>
              </div>
              <button className="btn-secondary mt-4 rounded-2xl" onClick={() => attendAlert(alert.id)}><TriangleAlert size={16} /> Marcar atendida</button>
            </div>
          ))}
        </div>
      </ModulePanel>
    </div>
  );
}
