import { ClipboardCheck, ClipboardList, Plus, Save, Tags, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, ApiError, withDemoFallback } from "../../../core/http/httpClient";
import { mapAlerts, mapInventoryItems } from "../../../core/http/mappers";
import { Badge, InlineFeedback, ModulePanel, PageHeader, Progress, StatCard } from "../../../shared/ui/primitives";
import { demoAlertas, demoInventario } from "../../../data/demo";
import type { Alerta, CategoriaInventario, ConteoFisico, DetalleConteo, InventarioItem, LoteInventario } from "../../../types";

const emptyMovement = { tipo: "entrada", cantidad: "1", motivo: "Ajuste operativo", referencia: "WEB-001" };

type RestockRequest = {
  id: string;
  itemId: string;
  itemNombre: string;
  prioridad: "SUGERENCIA" | "MANUAL";
  cantidad: number;
  proveedor: string;
  notas: string;
  createdAt: string;
};

export function InventarioPage() {
  const [items, setItems] = useState<InventarioItem[]>(demoInventario);
  const [alerts, setAlerts] = useState<Alerta[]>(demoAlertas);
  const [categorias, setCategorias] = useState<CategoriaInventario[]>([]);
  const [lotes, setLotes] = useState<LoteInventario[]>([]);
  const [conteos, setConteos] = useState<ConteoFisico[]>([]);
  const [conteoDetalles, setConteoDetalles] = useState<DetalleConteo[]>([]);
  const [selectedId, setSelectedId] = useState<string>(demoInventario[0]?.id ?? "");
  const [itemForm, setItemForm] = useState<InventarioItem | null>(demoInventario[0] ?? null);
  const [movement, setMovement] = useState(emptyMovement);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<"stock" | "lotes" | "conteo" | "categorias">("stock");
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);
  const [purchaseModalItem, setPurchaseModalItem] = useState<InventarioItem | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({ cantidad: "", proveedor: "", notas: "" });

  const selectedItem = useMemo(() => items.find(i => i.id === selectedId), [items, selectedId]);

  async function loadSnapshot() {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await withDemoFallback(async () => {
        const [itemsRaw, alertsRaw, catsRaw, lotesRaw, conteosRaw] = await Promise.all([
          api.inventario(),
          api.alertas(),
          api.categoriasInventario().catch(() => []),
          selectedId ? api.lotesPorItem(selectedId).catch(() => []) : Promise.resolve([]),
          api.conteosFisicos().catch(() => []),
        ]);
        return { items: mapInventoryItems(itemsRaw), alerts: mapAlerts(alertsRaw), categorias: catsRaw as CategoriaInventario[], lotes: lotesRaw as LoteInventario[], conteos: conteosRaw as ConteoFisico[] };
      }, async () => ({ items: demoInventario, alerts: demoAlertas, categorias: [], lotes: [], conteos: [] }));
      setItems(snapshot.items);
      setAlerts(snapshot.alerts);
      setCategorias(snapshot.categorias);
      setLotes(snapshot.lotes);
      setConteos(snapshot.conteos);
      if (!selectedId && snapshot.items.length > 0) {
        setSelectedId(snapshot.items[0].id);
        setItemForm(snapshot.items[0]);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cargar inventario.");
    } finally { setLoading(false); }
  }

  useEffect(() => { loadSnapshot(); }, []);
  useEffect(() => { if (selectedId) loadSnapshot(); }, [selectedId]);

  useEffect(() => {
    setItemForm(selectedItem ?? null);
  }, [selectedItem]);

  const metrics = useMemo(() => ({
    items: items.length,
    reorder: items.filter(item => item.stockActual <= item.puntoReorden).length,
    alerts: alerts.filter(alert => !alert.leida).length,
  }), [alerts, items]);
  const lowStockItems = useMemo(() => {
    return [...items]
      .filter((item) => item.stockActual <= item.puntoReorden)
      .sort((a, b) => (a.stockActual - a.puntoReorden) - (b.stockActual - b.puntoReorden));
  }, [items]);

  function recommendedQty(item: InventarioItem) {
    const refillToMax = Math.max(0, item.stockMaximo - item.stockActual);
    const coverBuffer = Math.max(0, item.puntoReorden - item.stockActual) + Math.max(1, item.stockMinimo);
    return Math.max(refillToMax, coverBuffer);
  }

  async function saveItem() {
    if (!itemForm) return;
    setSaving(true); setError(null);
    try {
      await api.actualizarItemInventario(itemForm.id, {
        nombre: itemForm.nombre, descripcion: itemForm.descripcion,
        unidadMedida: itemForm.unidadMedida, stockMinimo: itemForm.stockMinimo,
        stockMaximo: itemForm.stockMaximo, puntoReorden: itemForm.puntoReorden,
        costoUnitario: itemForm.costoUnitario, proveedorPreferidoId: itemForm.proveedorPreferidoId || null,
        tiempoEntregaProveedorDias: itemForm.tiempoEntregaProveedorDias ?? 1,
        clasificacionAbc: itemForm.clasificacionAbc, activo: itemForm.activo ?? true,
        categoriaId: itemForm.categoriaId || null,
      });
      await loadSnapshot();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo actualizar el item.");
    } finally { setSaving(false); }
  }

  async function saveMovement() {
    if (!itemForm) return;
    setSaving(true); setError(null);
    try {
      const payload = { itemInventarioId: itemForm.id, cantidad: Number(movement.cantidad), motivo: movement.motivo, referencia: movement.referencia };
      if (movement.tipo === "entrada") await api.registrarEntradaInventario(payload);
      else await api.registrarSalidaInventario(payload);
      await loadSnapshot();
      setMovement(m => ({ ...m, cantidad: "1" }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo registrar el movimiento.");
    } finally { setSaving(false); }
  }

  async function attendAlert(id: string) {
    setSaving(true);
    try {
      await api.atenderAlerta(id);
      await loadSnapshot();
    } catch (reason) {
      if (!(reason instanceof ApiError)) setAlerts(cur => cur.map(a => a.id === id ? { ...a, leida: true } : a));
    } finally { setSaving(false); }
  }

  async function handleNuevaCategoria() {
    const nombre = prompt("Nombre de la nueva categoria:");
    if (!nombre) return;
    setSaving(true);
    try {
      await api.crearCategoriaInventario({ nombre });
      await loadSnapshot();
      setNotice("Categoria creada.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Error al crear categoria.");
    } finally { setSaving(false); }
  }

  async function handleIniciarConteo() {
    setSaving(true);
    try {
      await api.iniciarConteo();
      await loadSnapshot();
      setNotice("Conteo iniciado.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Error al iniciar conteo.");
    } finally { setSaving(false); }
  }

  async function handleRegistrarConteoItem(conteoId: string, itemId: string, cantidadFisica: number) {
    setSaving(true);
    try {
      await api.registrarConteoDetalle(conteoId, { itemInventarioId: itemId, cantidadFisica });
      await loadSnapshot();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Error al registrar conteo.");
    } finally { setSaving(false); }
  }

  async function handleCerrarConteo(conteoId: string) {
    if (!confirm("Cerrar el conteo? Se ajustara el stock automaticamente.")) return;
    setSaving(true);
    try {
      await api.cerrarConteo(conteoId);
      await loadSnapshot();
      setNotice("Conteo cerrado. Stock ajustado.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Error al cerrar conteo.");
    } finally { setSaving(false); }
  }

  function pushRestockRequest(item: InventarioItem, prioridad: RestockRequest["prioridad"], cantidad: number, proveedor: string, notas: string) {
    setRestockRequests((current) => [
      {
        id: `${prioridad}-${item.id}-${Date.now()}`,
        itemId: item.id,
        itemNombre: item.nombre,
        prioridad,
        cantidad,
        proveedor,
        notas,
        createdAt: new Date().toISOString().slice(0, 10)
      },
      ...current
    ]);
  }

  function handleSuggestedRestock(item: InventarioItem) {
    pushRestockRequest(item, "SUGERENCIA", recommendedQty(item), item.proveedorPreferidoId || "", "Reposicion sugerida automaticamente por stock bajo.");
    setNotice(`Se genero una sugerencia de compra para ${item.nombre}.`);
  }

  function openManualPurchase(item: InventarioItem) {
    setPurchaseModalItem(item);
    setPurchaseForm({
      cantidad: String(recommendedQty(item)),
      proveedor: item.proveedorPreferidoId || "",
      notas: ""
    });
  }

  function saveManualPurchase() {
    if (!purchaseModalItem || !purchaseForm.cantidad) return;
    pushRestockRequest(
      purchaseModalItem,
      "MANUAL",
      Number(purchaseForm.cantidad),
      purchaseForm.proveedor,
      purchaseForm.notas || "Solicitud manual desde inventario."
    );
    setNotice(`Compra manual lista para ${purchaseModalItem.nombre}.`);
    setPurchaseModalItem(null);
    setPurchaseForm({ cantidad: "", proveedor: "", notas: "" });
  }

  const conteoAbierto = conteos.find(c => c.estado === "ABIERTO" || c.estado === "EN_PROGRESO");

  return (
    <div className="space-y-6">
      <PageHeader title="Inventario" eyebrow="Stock, categorias, lotes, conteos fisicos y alertas"
        action={<button className="btn-primary rounded-2xl" onClick={loadSnapshot}>Actualizar</button>} />
      <InlineFeedback loading={loading || saving} error={error} />
      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Items activos" value={String(metrics.items)} />
        <StatCard label="Bajo reorden" value={String(metrics.reorder)} tone="maize" />
        <StatCard label="Alertas abiertas" value={String(metrics.alerts)} tone="tomato" />
        <StatCard label="Categorias" value={String(categorias.length)} tone="ink" />
      </div>

      <div className="flex gap-2 border-b border-stone-200">
        {(["stock", "lotes", "conteo", "categorias"] as const).map(t => (
          <button key={t} className={`px-4 py-2 text-sm font-bold transition-colors ${tab === t ? "border-b-2 border-herb text-herb" : "text-stone-500 hover:text-stone-800"}`} onClick={() => setTab(t)}>
            {t === "stock" ? "Stock" : t === "lotes" ? "Lotes" : t === "conteo" ? "Conteo fisico" : "Categorias"}
          </button>
        ))}
      </div>

      {tab === "stock" && (
        <div className="space-y-6">
          <ModulePanel title="Reposicion por stock bajo" port="Sugerencia y compra manual" description="Solo aparecen los insumos que ya tocaron punto de reorden. Desde aqui puedes generar sugerencias o registrar compras manuales sin pasar por otro modulo.">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
              <div className="grid gap-4 md:grid-cols-2">
                {lowStockItems.map((item) => (
                  <article key={`restock-${item.id}`} className="rounded-3xl border border-stone-200 bg-oatmeal p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">{item.categoriaNombre || "Inventario"}</p>
                        <h3 className="mt-2 text-lg font-black text-ink">{item.nombre}</h3>
                        <p className="mt-2 text-sm text-stone-500">{item.descripcion}</p>
                      </div>
                      <Badge tone="red">{item.estadoStock || "CRITICO"}</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Stock actual</p>
                        <p className="mt-1 font-semibold">{item.stockActual} {item.unidadMedida}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Compra sugerida</p>
                        <p className="mt-1 font-semibold">{recommendedQty(item)} {item.unidadMedida}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2">
                      <button className="btn-secondary w-full rounded-2xl" onClick={() => handleSuggestedRestock(item)}>
                        <ClipboardList size={16} /> Sugerir compra
                      </button>
                      <button className="btn-primary w-full rounded-2xl" onClick={() => openManualPurchase(item)}>
                        <Plus size={16} /> Compra manual
                      </button>
                    </div>
                  </article>
                ))}
                {lowStockItems.length === 0 ? <p className="rounded-3xl border border-stone-200 bg-white px-4 py-6 text-sm text-stone-500 md:col-span-2">No hay items bajo reorden en este momento.</p> : null}
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Bandeja operativa</p>
                <h3 className="mt-2 text-xl font-black text-ink">Solicitudes creadas</h3>
                <div className="mt-4 space-y-3">
                  {restockRequests.map((request) => (
                    <div key={request.id} className="rounded-2xl border border-stone-200 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{request.itemNombre}</p>
                        <Badge tone={request.prioridad === "MANUAL" ? "blue" : "yellow"}>{request.prioridad === "MANUAL" ? "Manual" : "Sugerida"}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-stone-500">Cantidad: {request.cantidad} · Fecha: {request.createdAt}</p>
                      {request.proveedor ? <p className="text-sm text-stone-500">Proveedor: {request.proveedor}</p> : null}
                      {request.notas ? <p className="mt-2 text-xs text-stone-400">{request.notas}</p> : null}
                    </div>
                  ))}
                  {restockRequests.length === 0 ? <p className="text-sm text-stone-500">Aun no generaste sugerencias ni compras manuales.</p> : null}
                </div>
              </div>
            </div>
          </ModulePanel>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
            <ModulePanel title="Stock operativo" port="Existencias actuales" description="Nivel real de cada insumo y su impacto sobre la disponibilidad.">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                    <tr><th className="p-4">Item</th><th>ABC</th><th>Categoria</th><th>Stock</th><th>Reorden</th><th>Costo</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {items.map(item => {
                      const percent = (item.stockActual / item.stockMaximo) * 100;
                      const low = item.stockActual <= item.puntoReorden;
                      return (
                        <tr key={item.id} className={`cursor-pointer border-t border-stone-100 ${selectedId === item.id ? "bg-herb/5" : ""}`} onClick={() => setSelectedId(item.id)}>
                          <td className="p-4"><b>{item.nombre}</b><p className="text-stone-500">{item.descripcion}</p></td>
                          <td><Badge tone={item.clasificacionAbc === "ALTA" ? "green" : item.clasificacionAbc === "MEDIA" ? "yellow" : "neutral"}>{item.clasificacionAbc}</Badge></td>
                          <td className="text-xs text-stone-500">{item.categoriaNombre || "-"}</td>
                          <td className="w-56"><Progress value={percent} /><p className="mt-1 text-xs">{item.stockActual} / {item.stockMaximo} {item.unidadMedida}</p></td>
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
              <ModulePanel title="Editar parametros" port="Reglas de reposicion" description="Ajusta umbrales para prevenir faltantes.">
                {itemForm ? (
                  <div className="space-y-3">
                    <label><span className="mb-1 block text-sm font-bold">Nombre</span><input className="input" value={itemForm.nombre} onChange={e => setItemForm({ ...itemForm, nombre: e.target.value })} /></label>
                    <label><span className="mb-1 block text-sm font-bold">Descripcion</span><input className="input" value={itemForm.descripcion} onChange={e => setItemForm({ ...itemForm, descripcion: e.target.value })} /></label>
                    <label><span className="mb-1 block text-sm font-bold">Categoria</span>
                      <select className="input" value={itemForm.categoriaId || ""} onChange={e => setItemForm({ ...itemForm, categoriaId: e.target.value || undefined })}>
                        <option value="">Sin categoria</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label><span className="mb-1 block text-sm font-bold">Stock minimo</span><input className="input" type="number" value={itemForm.stockMinimo} onChange={e => setItemForm({ ...itemForm, stockMinimo: Number(e.target.value) })} /></label>
                      <label><span className="mb-1 block text-sm font-bold">Stock maximo</span><input className="input" type="number" value={itemForm.stockMaximo} onChange={e => setItemForm({ ...itemForm, stockMaximo: Number(e.target.value) })} /></label>
                      <label><span className="mb-1 block text-sm font-bold">Punto reorden</span><input className="input" type="number" value={itemForm.puntoReorden} onChange={e => setItemForm({ ...itemForm, puntoReorden: Number(e.target.value) })} /></label>
                      <label><span className="mb-1 block text-sm font-bold">Costo unitario</span><input className="input" type="number" step="0.01" value={itemForm.costoUnitario} onChange={e => setItemForm({ ...itemForm, costoUnitario: Number(e.target.value) })} /></label>
                    </div>
                    <button className="btn-primary w-full rounded-2xl" onClick={saveItem}><Save size={16} /> Guardar parametros</button>
                  </div>
                ) : <p className="text-sm text-stone-500">Selecciona un item para editarlo.</p>}
              </ModulePanel>

              <ModulePanel title="Movimientos de stock" port="Entradas y salidas" description="Registra movimientos para reflejar el stock real.">
                {itemForm ? (
                  <div className="space-y-3">
                    <label><span className="mb-1 block text-sm font-bold">Tipo</span>
                      <select className="input" value={movement.tipo} onChange={e => setMovement(m => ({ ...m, tipo: e.target.value }))}>
                        <option value="entrada">Entrada</option><option value="salida">Salida</option>
                      </select>
                    </label>
                    <label><span className="mb-1 block text-sm font-bold">Cantidad</span><input className="input" type="number" min="0.01" step="0.01" value={movement.cantidad} onChange={e => setMovement(m => ({ ...m, cantidad: e.target.value }))} /></label>
                    <label><span className="mb-1 block text-sm font-bold">Motivo</span><input className="input" value={movement.motivo} onChange={e => setMovement(m => ({ ...m, motivo: e.target.value }))} /></label>
                    <label><span className="mb-1 block text-sm font-bold">Referencia</span><input className="input" value={movement.referencia} onChange={e => setMovement(m => ({ ...m, referencia: e.target.value }))} /></label>
                    <button className="btn-primary w-full rounded-2xl" onClick={saveMovement}>Registrar movimiento</button>
                  </div>
                ) : null}
              </ModulePanel>
            </div>
          </div>
        </div>
      )}

      {tab === "lotes" && (
        <ModulePanel title="Lotes y vencimientos" port="Trazabilidad por lote"
          description="Controla fechas de vencimiento y lotes de insumos para reducir mermas."
          action={selectedItem && <Badge tone="blue">{lotes.length} lotes</Badge>}>
          {selectedItem ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                  <tr><th className="p-4">Codigo lote</th><th>Cant. inicial</th><th>Cant. restante</th><th>Vencimiento</th><th>Costo unit.</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {lotes.map(lote => {
                    const vencido = lote.fechaVencimiento && new Date(lote.fechaVencimiento) < new Date();
                    const porVencer = lote.fechaVencimiento && !vencido && new Date(lote.fechaVencimiento) < new Date(Date.now() + 7 * 86400000);
                    return (
                      <tr key={lote.id} className="border-t border-stone-100">
                        <td className="p-4 font-bold">{lote.codigoLote}</td>
                        <td>{lote.cantidadInicial} {selectedItem.unidadMedida}</td>
                        <td>{lote.cantidadRestante} {selectedItem.unidadMedida}</td>
                        <td>{lote.fechaVencimiento ? new Date(lote.fechaVencimiento).toLocaleDateString() : "Sin venc."}</td>
                        <td>BOB {lote.costoUnitario}</td>
                        <td><Badge tone={vencido ? "red" : porVencer ? "yellow" : "green"}>{lote.estado}</Badge></td>
                      </tr>
                    );
                  })}
                  {lotes.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-stone-400">Selecciona un item de inventario para ver sus lotes.</td></tr>}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-stone-500">Selecciona un item para ver sus lotes.</p>}
        </ModulePanel>
      )}

      {tab === "conteo" && (
        <ModulePanel title="Conteo fisico de inventario" port="Toma fisica periodica"
          description="Registra cantidades reales y ajusta el stock automaticamente."
          action={
            <div className="flex gap-2">
              {!conteoAbierto && <button className="btn-primary rounded-2xl text-sm" onClick={handleIniciarConteo}><Plus size={16} /> Nuevo conteo</button>}
            </div>
          }>
          {conteoAbierto ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <b>Conteo #{conteoAbierto.numeroConteo}</b> - {conteoAbierto.estado} - {conteoAbierto.fechaConteo}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                    <tr><th className="p-4">Item</th><th>Stock sistema</th><th>Cant. fisica</th><th>Diferencia</th><th>Ajuste valor</th></tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-t border-stone-100">
                        <td className="p-4 font-bold">{item.nombre}</td>
                        <td>{item.stockActual}</td>
                        <td>
                          <input className="input max-w-24" type="number" min="0" step="0.01" defaultValue={item.stockActual}
                            onBlur={e => handleRegistrarConteoItem(conteoAbierto.id, item.id, Number(e.target.value))} />
                        </td>
                        <td className="text-stone-500">-</td>
                        <td className="text-stone-500">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn-primary rounded-2xl" onClick={() => handleCerrarConteo(conteoAbierto.id)} disabled={saving}>
                <ClipboardCheck size={17} /> Cerrar conteo y ajustar stock
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {conteos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                      <tr><th className="p-4">#</th><th>Fecha</th><th>Estado</th><th>Items contados</th><th>Diferencias</th><th>Ajuste total</th></tr>
                    </thead>
                    <tbody>
                      {conteos.slice(0, 10).map(c => (
                        <tr key={c.id} className="border-t border-stone-100">
                          <td className="p-4 font-bold">{c.numeroConteo}</td>
                          <td>{new Date(c.fechaConteo).toLocaleDateString()}</td>
                          <td><Badge tone={c.estado === "CERRADO" ? "green" : c.estado === "ABIERTO" ? "yellow" : "blue"}>{c.estado}</Badge></td>
                          <td>{c.totalItemsContados}</td>
                          <td>{c.totalDiferencias}</td>
                          <td>BOB {c.totalAjusteValor.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-sm text-stone-500">No hay conteos registrados. Inicia uno nuevo.</p>}
              <button className="btn-primary rounded-2xl" onClick={handleIniciarConteo} disabled={saving}>
                <Plus size={16} /> Iniciar nuevo conteo
              </button>
            </div>
          )}
        </ModulePanel>
      )}

      {tab === "categorias" && (
        <ModulePanel title="Categorias de inventario" port="Agrupacion de insumos"
          description="Organiza los items por tipo (verduras, carnes, lacteos, limpieza, etc.)."
          action={<button className="btn-secondary rounded-2xl text-sm" onClick={handleNuevaCategoria}><Plus size={16} /> Nueva categoria</button>}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categorias.map(cat => (
              <div key={cat.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Tags size={16} className="text-herb" />
                  <p className="font-bold text-ink">{cat.nombre}</p>
                </div>
                {cat.descripcion && <p className="mt-1 text-xs text-stone-500">{cat.descripcion}</p>}
                <p className="mt-2 text-xs text-stone-400">{items.filter(i => i.categoriaId === cat.id).length} items</p>
              </div>
            ))}
            {categorias.length === 0 && <p className="text-sm text-stone-500 col-span-full">Crea categorias para organizar tu inventario.</p>}
          </div>
        </ModulePanel>
      )}

      <ModulePanel title="Alertas de stock" port="Atencion prioritaria" description="Riesgos de faltante antes de que afecten la venta o la produccion.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {alerts.map(alert => (
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

      {purchaseModalItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={() => setPurchaseModalItem(null)}>
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-soft" onClick={(event) => event.stopPropagation()}>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Compra manual</p>
            <h2 className="mt-2 text-2xl font-black text-ink">{purchaseModalItem.nombre}</h2>
            <p className="mt-2 text-sm text-stone-500">Define la cantidad a comprar y deja la solicitud guardada en la bandeja operativa de inventario.</p>
            <div className="mt-5 space-y-3">
              <input className="input" type="number" min="1" step="0.01" placeholder="Cantidad" value={purchaseForm.cantidad} onChange={(event) => setPurchaseForm((current) => ({ ...current, cantidad: event.target.value }))} />
              <input className="input" placeholder="Proveedor o referencia" value={purchaseForm.proveedor} onChange={(event) => setPurchaseForm((current) => ({ ...current, proveedor: event.target.value }))} />
              <textarea className="input min-h-28" placeholder="Notas" value={purchaseForm.notas} onChange={(event) => setPurchaseForm((current) => ({ ...current, notas: event.target.value }))} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-secondary rounded-2xl" onClick={() => setPurchaseModalItem(null)}>Cancelar</button>
              <button className="btn-primary rounded-2xl" onClick={saveManualPurchase}>Guardar compra manual</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
