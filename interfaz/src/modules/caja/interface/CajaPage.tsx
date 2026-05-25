import { Banknote, ClipboardCheck, DollarSign, List, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../core/http/httpClient";
import { Badge, InlineFeedback, ModulePanel, PageHeader } from "../../../shared/ui/primitives";
import { useCajaViewModel } from "../application/useCajaViewModel";
import type { CierreCaja } from "../../../types";

const emptyGasto = { descripcion: "", categoriaGasto: "INSUMOS", monto: 0, metodoPago: "EFECTIVO" };

export function CajaPage() {
  const { abierto, historial, loading, error, reload } = useCajaViewModel();
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [saldoReal, setSaldoReal] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showGastoForm, setShowGastoForm] = useState(false);
  const [gastoForm, setGastoForm] = useState(emptyGasto);
  const [detallePagos, setDetallePagos] = useState<Record<string, number>>({});

  useEffect(() => {
    if (abierto?.detallePagos) {
      try {
        setDetallePagos(JSON.parse(abierto.detallePagos));
      } catch { setDetallePagos({}); }
    }
  }, [abierto]);

  async function handleAbrir() {
    setSaving(true);
    setNotice(null);
    try {
      await api.abrirCaja({ saldoInicial });
      setNotice("Caja abierta exitosamente.");
      reload();
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "Error al abrir caja.");
    } finally { setSaving(false); }
  }

  async function handleCerrar() {
    if (!abierto) return;
    setSaving(true);
    setNotice(null);
    try {
      await api.cerrarCaja(abierto.id, { saldoRealDeclarado: saldoReal, observaciones });
      setNotice("Caja cerrada exitosamente.");
      reload();
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "Error al cerrar caja.");
    } finally { setSaving(false); }
  }

  async function handleRegistrarGasto() {
    if (!abierto) return;
    setSaving(true);
    try {
      await api.registrarGasto(abierto.id, gastoForm);
      setGastoForm(emptyGasto);
      setShowGastoForm(false);
      setNotice("Gasto registrado.");
      reload();
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "Error al registrar gasto.");
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Caja"
        eyebrow="Control de efectivo y cierre del día"
        action={
          <div className="flex gap-2">
            {!abierto ? (
              <button className="btn-primary rounded-2xl" disabled={saving} onClick={handleAbrir}>
                <Banknote size={17} /> Abrir caja
              </button>
            ) : (
              <>
                <button className="btn-secondary rounded-2xl" onClick={() => setShowGastoForm(!showGastoForm)}>
                  <Plus size={17} /> Gasto
                </button>
                <button className="btn-primary rounded-2xl" disabled={saving} onClick={handleCerrar}>
                  <ClipboardCheck size={17} /> Cerrar caja
                </button>
              </>
            )}
          </div>
        }
      />
      <InlineFeedback loading={loading} error={error} />
      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}

      {!abierto ? (
        <ModulePanel title="Abrir caja" port="Turno nuevo" description="Registra el saldo inicial con el que arranca el turno.">
          <div className="max-w-sm space-y-4">
            <label>
              <span className="mb-1 block text-sm font-bold">Saldo inicial (BOB)</span>
              <input className="input" type="number" min="0" step="0.01" value={saldoInicial}
                onChange={(e) => setSaldoInicial(Number(e.target.value))} />
            </label>
            <button className="btn-primary rounded-2xl w-full" onClick={handleAbrir} disabled={saving}>
              <Banknote size={17} /> Iniciar turno
            </button>
          </div>
        </ModulePanel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-stone-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Saldo inicial</p>
              <p className="mt-1 text-2xl font-black text-ink">BOB {abierto.saldoInicial.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Ventas del turno</p>
              <p className="mt-1 text-2xl font-black text-herb">BOB {abierto.totalVentas.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Pedidos</p>
              <p className="mt-1 text-2xl font-black text-ink">{abierto.totalPedidos}</p>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Gastos</p>
              <p className="mt-1 text-2xl font-black text-tomato">BOB {abierto.totalGastos.toFixed(2)}</p>
            </div>
          </div>

          {Object.keys(detallePagos).length > 0 && (
            <ModulePanel title="Pagos por método" port="Resumen de cobros" description="Distribución de los pagos registrados en este turno.">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(detallePagos).map(([metodo, monto]) => (
                  <div key={metodo} className="rounded-2xl border border-stone-200 bg-white p-4">
                    <p className="text-sm font-bold text-ink">{metodo}</p>
                    <p className="text-xl font-black text-herb">BOB {monto.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </ModulePanel>
          )}

          {showGastoForm && (
            <ModulePanel title="Registrar gasto" port="Salida de efectivo" description="Anota cualquier gasto operativo del turno.">
              <div className="max-w-md space-y-4">
                <label>
                  <span className="mb-1 block text-sm font-bold">Descripcion</span>
                  <input className="input" value={gastoForm.descripcion}
                    onChange={(e) => setGastoForm(f => ({ ...f, descripcion: e.target.value }))} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className="mb-1 block text-sm font-bold">Categoria</span>
                    <select className="input" value={gastoForm.categoriaGasto}
                      onChange={(e) => setGastoForm(f => ({ ...f, categoriaGasto: e.target.value }))}>
                      <option value="INSUMOS">Insumos</option>
                      <option value="SERVICIOS">Servicios</option>
                      <option value="MANTENIMIENTO">Mantenimiento</option>
                      <option value="TRANSPORTE">Transporte</option>
                      <option value="OTROS">Otros</option>
                    </select>
                  </label>
                  <label>
                    <span className="mb-1 block text-sm font-bold">Monto (BOB)</span>
                    <input className="input" type="number" min="0.01" step="0.01" value={gastoForm.monto}
                      onChange={(e) => setGastoForm(f => ({ ...f, monto: Number(e.target.value) }))} />
                  </label>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary rounded-2xl" onClick={handleRegistrarGasto} disabled={saving}>
                    <DollarSign size={16} /> Registrar gasto
                  </button>
                  <button className="btn-secondary rounded-2xl" onClick={() => setShowGastoForm(false)}>
                    <X size={16} /> Cancelar
                  </button>
                </div>
              </div>
            </ModulePanel>
          )}

          <ModulePanel title="Cerrar turno" port="Corte de caja" description="Ingresa el saldo real contado en caja para cerrar el turno.">
            <div className="max-w-sm space-y-4">
              <label>
                <span className="mb-1 block text-sm font-bold">Saldo real contado (BOB)</span>
                <input className="input" type="number" min="0" step="0.01" value={saldoReal}
                  onChange={(e) => setSaldoReal(Number(e.target.value))} />
              </label>
              <label>
                <span className="mb-1 block text-sm font-bold">Observaciones</span>
                <textarea className="input min-h-20 resize-y" value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)} />
              </label>
              <button className="btn-primary rounded-2xl w-full" onClick={handleCerrar} disabled={saving}>
                <ClipboardCheck size={17} /> Cerrar caja
              </button>
            </div>
          </ModulePanel>
        </>
      )}

      {historial.length > 0 && (
        <ModulePanel title="Historial de cierres" port="Turnos anteriores" description="Consulta los cortes de caja de días previos.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr><th className="p-4">Apertura</th><th>Cierre</th><th>Estado</th><th>Inicial</th><th>Esperado</th><th>Real</th><th>Diferencia</th><th>Usuario</th></tr>
              </thead>
              <tbody>
                {historial.map((c) => (
                  <tr key={c.id} className="border-t border-stone-100">
                    <td className="p-4">{new Date(c.fechaApertura).toLocaleString()}</td>
                    <td>{c.fechaCierre ? new Date(c.fechaCierre).toLocaleString() : "-"}</td>
                    <td><Badge tone={c.estado === "ABIERTO" ? "blue" : c.estado === "CERRADO" ? "yellow" : "green"}>{c.estado}</Badge></td>
                    <td>BOB {c.saldoInicial.toFixed(2)}</td>
                    <td>BOB {(c.saldoEsperado ?? 0).toFixed(2)}</td>
                    <td>BOB {(c.saldoRealDeclarado ?? 0).toFixed(2)}</td>
                    <td className={c.diferencia && c.diferencia !== 0 ? "text-tomato font-bold" : ""}>
                      {(c.diferencia ?? 0).toFixed(2)}
                    </td>
                    <td>{c.usuarioAperturaNombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModulePanel>
      )}
    </div>
  );
}
