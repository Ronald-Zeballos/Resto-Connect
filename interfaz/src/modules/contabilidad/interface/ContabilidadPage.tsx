import { DollarSign, Plus, Receipt, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../../../core/http/httpClient";
import { Badge, InlineFeedback, ModulePanel, PageHeader, StatCard } from "../../../shared/ui/primitives";
import type { ContabilidadGasto, ContabilidadIngreso, CuentaCobrar, CuentaPagar } from "../../../types";

type Tab = "pagar" | "cobrar" | "gastos" | "ingresos" | "reporte";

type TabMeta = {
  id: Tab;
  label: string;
  icon: LucideIcon;
  panelTitle: string;
  port: string;
  description: string;
};

const pagoFormInicial = { monto: 0, fechaPago: new Date().toISOString().split("T")[0], metodoPago: "EFECTIVO", comprobante: "", observaciones: "" };
const cobroFormInicial = { monto: 0, fechaCobro: new Date().toISOString().split("T")[0], metodoPago: "EFECTIVO", comprobante: "", observaciones: "" };
const gastoFormInicial = { fechaGasto: new Date().toISOString().split("T")[0], descripcion: "", categoriaGasto: "OPERATIVO", monto: 0, metodoPago: "EFECTIVO", comprobante: "", observaciones: "" };
const ingresoFormInicial = { fechaIngreso: new Date().toISOString().split("T")[0], descripcion: "", categoriaIngreso: "VENTAS", monto: 0, metodoPago: "EFECTIVO", comprobante: "", observaciones: "" };
const nuevaPagarInicial = { proveedorId: "", montoOriginal: 0, fechaEmision: new Date().toISOString().split("T")[0], fechaVencimiento: "", descripcion: "", numeroComprobante: "" };
const nuevaCobrarInicial = { clienteId: "", montoOriginal: 0, fechaEmision: new Date().toISOString().split("T")[0], fechaVencimiento: "", descripcion: "" };

const tabs: TabMeta[] = [
  { id: "pagar", label: "Cuentas por pagar", icon: TrendingDown, panelTitle: "Cuentas por pagar", port: "Compromisos pendientes", description: "Organiza vencimientos, saldos pendientes y pagos a proveedores dentro de un panel claro y consistente." },
  { id: "cobrar", label: "Cuentas por cobrar", icon: TrendingUp, panelTitle: "Cuentas por cobrar", port: "Cobros pendientes", description: "Haz seguimiento de lo que te deben clientes y pedidos financiados." },
  { id: "gastos", label: "Gastos", icon: Receipt, panelTitle: "Registro de gastos", port: "Salida de dinero", description: "Carga egresos operativos y mantén el historial dentro del mismo formato visual del resto del sistema." },
  { id: "ingresos", label: "Ingresos", icon: DollarSign, panelTitle: "Registro de ingresos", port: "Entrada de dinero", description: "Registra ingresos extraordinarios o movimientos que no vienen directo desde ventas." },
  { id: "reporte", label: "Estado de resultados", icon: DollarSign, panelTitle: "Estado de resultados", port: "Lectura financiera", description: "Resume ingresos, gastos y resultado para revisar la salud del negocio." }
];

function ModalShell({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-soft" onClick={(event) => event.stopPropagation()}>
        <h2 className="text-xl font-black text-ink">{title}</h2>
        <div className="mt-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function estadoBadge(estado: string) {
  const tones: Record<string, "yellow" | "green" | "blue" | "red" | "neutral"> = {
    PENDIENTE: "yellow",
    PAGADO: "green",
    COBRADO: "green",
    PARCIAL: "blue",
    VENCIDA: "red"
  };
  return <Badge tone={tones[estado] || "neutral"}>{estado}</Badge>;
}

export function ContabilidadPage() {
  const [tab, setTab] = useState<Tab>("pagar");
  const [cuentasPagar, setCuentasPagar] = useState<CuentaPagar[]>([]);
  const [cuentasCobrar, setCuentasCobrar] = useState<CuentaCobrar[]>([]);
  const [gastos, setGastos] = useState<ContabilidadGasto[]>([]);
  const [ingresos, setIngresos] = useState<ContabilidadIngreso[]>([]);
  const [reporte, setReporte] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");

  const [pagoForm, setPagoForm] = useState(pagoFormInicial);
  const [cobroForm, setCobroForm] = useState(cobroFormInicial);
  const [gastoForm, setGastoForm] = useState(gastoFormInicial);
  const [ingresoForm, setIngresoForm] = useState(ingresoFormInicial);
  const [nuevaPagarForm, setNuevaPagarForm] = useState(nuevaPagarInicial);
  const [nuevaCobrarForm, setNuevaCobrarForm] = useState(nuevaCobrarInicial);

  const [pagoModal, setPagoModal] = useState<string | null>(null);
  const [cobroModal, setCobroModal] = useState<string | null>(null);
  const [showGastoForm, setShowGastoForm] = useState(false);
  const [showIngresoForm, setShowIngresoForm] = useState(false);
  const [showNuevaPagar, setShowNuevaPagar] = useState(false);
  const [showNuevaCobrar, setShowNuevaCobrar] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [pagarRaw, cobrarRaw, gastosRaw, ingresosRaw] = await Promise.all([
        api.cuentasPagar(),
        api.cuentasCobrar(),
        api.gastosContables(),
        api.ingresosContables()
      ]);
      setCuentasPagar(pagarRaw as CuentaPagar[]);
      setCuentasCobrar(cobrarRaw as CuentaCobrar[]);
      setGastos(gastosRaw as ContabilidadGasto[]);
      setIngresos(ingresosRaw as ContabilidadIngreso[]);
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo cargar contabilidad.");
    } finally {
      setLoading(false);
    }
  }

  async function loadReporte() {
    try {
      setReporte(await api.estadoResultados() as Record<string, unknown>);
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo cargar el reporte.");
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (tab === "reporte") void loadReporte();
  }, [tab]);

  const metrics = useMemo(() => ({
    pagar: cuentasPagar.reduce((sum, item) => sum + item.saldoPendiente, 0),
    cobrar: cuentasCobrar.reduce((sum, item) => sum + item.saldoPendiente, 0),
    gastos: gastos.reduce((sum, item) => sum + item.monto, 0),
    ingresos: ingresos.reduce((sum, item) => sum + item.monto, 0)
  }), [cuentasCobrar, cuentasPagar, gastos, ingresos]);

  const activeTab = tabs.find((item) => item.id === tab) ?? tabs[0];

  async function registrarPago() {
    if (!pagoModal) return;
    setWorking(true);
    try {
      await api.registrarPagoCuenta(pagoModal, pagoForm as unknown as Record<string, unknown>);
      setPagoModal(null);
      setPagoForm(pagoFormInicial);
      await loadData();
      setNotice("Pago registrado.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo registrar el pago.");
    } finally {
      setWorking(false);
    }
  }

  async function registrarCobro() {
    if (!cobroModal) return;
    setWorking(true);
    try {
      await api.registrarCobroCuenta(cobroModal, cobroForm as unknown as Record<string, unknown>);
      setCobroModal(null);
      setCobroForm(cobroFormInicial);
      await loadData();
      setNotice("Cobro registrado.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo registrar el cobro.");
    } finally {
      setWorking(false);
    }
  }

  async function guardarGasto() {
    setWorking(true);
    try {
      await api.crearGastoContable(gastoForm as unknown as Record<string, unknown>);
      setShowGastoForm(false);
      setGastoForm(gastoFormInicial);
      await loadData();
      setNotice("Gasto guardado.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo guardar el gasto.");
    } finally {
      setWorking(false);
    }
  }

  async function guardarIngreso() {
    setWorking(true);
    try {
      await api.crearIngresoContable(ingresoForm as unknown as Record<string, unknown>);
      setShowIngresoForm(false);
      setIngresoForm(ingresoFormInicial);
      await loadData();
      setNotice("Ingreso guardado.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo guardar el ingreso.");
    } finally {
      setWorking(false);
    }
  }

  async function guardarNuevaPagar() {
    setWorking(true);
    try {
      await api.crearCuentaPagar(nuevaPagarForm as unknown as Record<string, unknown>);
      setShowNuevaPagar(false);
      setNuevaPagarForm(nuevaPagarInicial);
      await loadData();
      setNotice("Cuenta por pagar creada.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo crear la cuenta por pagar.");
    } finally {
      setWorking(false);
    }
  }

  async function guardarNuevaCobrar() {
    setWorking(true);
    try {
      await api.crearCuentaCobrar(nuevaCobrarForm as unknown as Record<string, unknown>);
      setShowNuevaCobrar(false);
      setNuevaCobrarForm(nuevaCobrarInicial);
      await loadData();
      setNotice("Cuenta por cobrar creada.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo crear la cuenta por cobrar.");
    } finally {
      setWorking(false);
    }
  }

  function renderTabAction() {
    if (tab === "pagar") return <button onClick={() => setShowNuevaPagar(true)} className="btn-primary rounded-2xl text-sm"><Plus className="h-4 w-4" /> Nueva cuenta</button>;
    if (tab === "cobrar") return <button onClick={() => setShowNuevaCobrar(true)} className="btn-primary rounded-2xl text-sm"><Plus className="h-4 w-4" /> Nueva cuenta</button>;
    if (tab === "gastos") return <button onClick={() => setShowGastoForm(true)} className="btn-primary rounded-2xl text-sm"><Plus className="h-4 w-4" /> Nuevo gasto</button>;
    if (tab === "ingresos") return <button onClick={() => setShowIngresoForm(true)} className="btn-primary rounded-2xl text-sm"><Plus className="h-4 w-4" /> Nuevo ingreso</button>;
    return <Badge tone="blue">Actualizado</Badge>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contabilidad"
        eyebrow="Cartera, flujo y resultado"
        action={<button className="btn-secondary rounded-2xl" onClick={() => void loadData()}>Actualizar</button>}
      />

      <InlineFeedback loading={loading || working} error={null} />
      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saldo por pagar" value={`Bs ${metrics.pagar.toFixed(2)}`} tone="tomato" />
        <StatCard label="Saldo por cobrar" value={`Bs ${metrics.cobrar.toFixed(2)}`} tone="herb" />
        <StatCard label="Gastos cargados" value={`Bs ${metrics.gastos.toFixed(2)}`} tone="maize" />
        <StatCard label="Ingresos cargados" value={`Bs ${metrics.ingresos.toFixed(2)}`} tone="ink" />
      </div>

      <div className="card p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => {
            const Icon = item.icon;
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${selected ? "bg-herb text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <ModulePanel title={activeTab.panelTitle} port={activeTab.port} description={activeTab.description} action={renderTabAction()}>
        {tab === "pagar" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-stone-500">
              <span>{cuentasPagar.length} registros</span>
              <span>Vencimientos y pagos a proveedores</span>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-stone-200">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Proveedor</th>
                    <th className="px-4 py-3 text-right">Monto</th>
                    <th className="px-4 py-3 text-right">Saldo</th>
                    <th className="px-4 py-3 text-center">Vence</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-right">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentasPagar.map((cuenta) => (
                    <tr key={cuenta.id} className="border-t border-stone-100 bg-white">
                      <td className="px-4 py-3 font-semibold">{cuenta.proveedorNombre || "-"}</td>
                      <td className="px-4 py-3 text-right">Bs {cuenta.montoOriginal.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-amber-700">Bs {cuenta.saldoPendiente.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">{cuenta.fechaVencimiento}</td>
                      <td className="px-4 py-3 text-center">{estadoBadge(cuenta.estado)}</td>
                      <td className="px-4 py-3 text-right">
                        {cuenta.saldoPendiente > 0 ? <button onClick={() => setPagoModal(cuenta.id)} className="btn-secondary rounded-2xl px-3 py-2 text-xs">Registrar pago</button> : <Badge tone="green">Al dia</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === "cobrar" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-stone-500">
              <span>{cuentasCobrar.length} registros</span>
              <span>Clientes y saldos pendientes</span>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-stone-200">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3 text-right">Monto</th>
                    <th className="px-4 py-3 text-right">Saldo</th>
                    <th className="px-4 py-3 text-center">Vence</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-right">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentasCobrar.map((cuenta) => (
                    <tr key={cuenta.id} className="border-t border-stone-100 bg-white">
                      <td className="px-4 py-3 font-semibold">{cuenta.clienteNombre || "-"}</td>
                      <td className="px-4 py-3 text-right">Bs {cuenta.montoOriginal.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-green-700">Bs {cuenta.saldoPendiente.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">{cuenta.fechaVencimiento}</td>
                      <td className="px-4 py-3 text-center">{estadoBadge(cuenta.estado)}</td>
                      <td className="px-4 py-3 text-right">
                        {cuenta.saldoPendiente > 0 ? <button onClick={() => setCobroModal(cuenta.id)} className="btn-secondary rounded-2xl px-3 py-2 text-xs">Registrar cobro</button> : <Badge tone="green">Cobrado</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === "gastos" ? (
          <div className="overflow-x-auto rounded-3xl border border-stone-200">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Descripcion</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((gasto) => (
                  <tr key={gasto.id} className="border-t border-stone-100 bg-white">
                    <td className="px-4 py-3">{gasto.fechaGasto}</td>
                    <td className="px-4 py-3 font-semibold">{gasto.descripcion}</td>
                    <td className="px-4 py-3">{gasto.categoriaGasto}</td>
                    <td className="px-4 py-3 text-right text-red-600">-Bs {gasto.monto.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "ingresos" ? (
          <div className="overflow-x-auto rounded-3xl border border-stone-200">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Descripcion</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {ingresos.map((ingreso) => (
                  <tr key={ingreso.id} className="border-t border-stone-100 bg-white">
                    <td className="px-4 py-3">{ingreso.fechaIngreso}</td>
                    <td className="px-4 py-3 font-semibold">{ingreso.descripcion}</td>
                    <td className="px-4 py-3">{ingreso.categoriaIngreso}</td>
                    <td className="px-4 py-3 text-right text-green-600">+Bs {ingreso.monto.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "reporte" && reporte ? (
          <div className="max-w-xl rounded-3xl border border-stone-200 bg-stone-50 p-5">
            {(reporte.periodo as Record<string, string>) ? (
              <p className="text-sm text-stone-500">
                Periodo: {(reporte.periodo as Record<string, string>).desde} al {(reporte.periodo as Record<string, string>).hasta}
              </p>
            ) : null}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <span>Ingresos</span>
                <b className="text-green-600">+Bs {Number(reporte.ingresos || 0).toFixed(2)}</b>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <span>Gastos</span>
                <b className="text-red-600">-Bs {Number(reporte.gastos || 0).toFixed(2)}</b>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-herb/10 px-4 py-4">
                <span className="font-semibold">Resultado</span>
                <b className={Number(reporte.resultado || 0) >= 0 ? "text-herb" : "text-red-600"}>
                  {Number(reporte.resultado || 0) >= 0 ? "+" : ""}Bs {Number(reporte.resultado || 0).toFixed(2)}
                </b>
              </div>
            </div>
          </div>
        ) : null}
      </ModulePanel>

      {showGastoForm ? (
        <ModalShell title="Nuevo gasto contable" onClose={() => setShowGastoForm(false)}>
          <input className="input" type="date" value={gastoForm.fechaGasto} onChange={(event) => setGastoForm({ ...gastoForm, fechaGasto: event.target.value })} />
          <input className="input" placeholder="Descripcion" value={gastoForm.descripcion} onChange={(event) => setGastoForm({ ...gastoForm, descripcion: event.target.value })} />
          <select className="input" value={gastoForm.categoriaGasto} onChange={(event) => setGastoForm({ ...gastoForm, categoriaGasto: event.target.value })}>
            <option value="OPERATIVO">Operativo</option>
            <option value="ADMINISTRATIVO">Administrativo</option>
            <option value="ALQUILER">Alquiler</option>
            <option value="SERVICIOS">Servicios</option>
            <option value="SUELDOS">Sueldos</option>
            <option value="OTROS">Otros</option>
          </select>
          <input className="input" type="number" placeholder="Monto" value={gastoForm.monto || ""} onChange={(event) => setGastoForm({ ...gastoForm, monto: Number(event.target.value) })} />
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary rounded-2xl" onClick={() => setShowGastoForm(false)}>Cancelar</button>
            <button className="btn-primary rounded-2xl" onClick={guardarGasto}>Guardar</button>
          </div>
        </ModalShell>
      ) : null}

      {showIngresoForm ? (
        <ModalShell title="Nuevo ingreso contable" onClose={() => setShowIngresoForm(false)}>
          <input className="input" type="date" value={ingresoForm.fechaIngreso} onChange={(event) => setIngresoForm({ ...ingresoForm, fechaIngreso: event.target.value })} />
          <input className="input" placeholder="Descripcion" value={ingresoForm.descripcion} onChange={(event) => setIngresoForm({ ...ingresoForm, descripcion: event.target.value })} />
          <select className="input" value={ingresoForm.categoriaIngreso} onChange={(event) => setIngresoForm({ ...ingresoForm, categoriaIngreso: event.target.value })}>
            <option value="VENTAS">Ventas</option>
            <option value="SERVICIOS">Servicios</option>
            <option value="OTROS">Otros</option>
          </select>
          <input className="input" type="number" placeholder="Monto" value={ingresoForm.monto || ""} onChange={(event) => setIngresoForm({ ...ingresoForm, monto: Number(event.target.value) })} />
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary rounded-2xl" onClick={() => setShowIngresoForm(false)}>Cancelar</button>
            <button className="btn-primary rounded-2xl" onClick={guardarIngreso}>Guardar</button>
          </div>
        </ModalShell>
      ) : null}

      {pagoModal ? (
        <ModalShell title="Registrar pago" onClose={() => setPagoModal(null)}>
          <input className="input" type="number" placeholder="Monto" value={pagoForm.monto || ""} onChange={(event) => setPagoForm({ ...pagoForm, monto: Number(event.target.value) })} />
          <input className="input" type="date" value={pagoForm.fechaPago} onChange={(event) => setPagoForm({ ...pagoForm, fechaPago: event.target.value })} />
          <select className="input" value={pagoForm.metodoPago} onChange={(event) => setPagoForm({ ...pagoForm, metodoPago: event.target.value })}>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="CHEQUE">Cheque</option>
          </select>
          <input className="input" placeholder="Comprobante" value={pagoForm.comprobante} onChange={(event) => setPagoForm({ ...pagoForm, comprobante: event.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary rounded-2xl" onClick={() => setPagoModal(null)}>Cancelar</button>
            <button className="btn-primary rounded-2xl" onClick={registrarPago}>Registrar pago</button>
          </div>
        </ModalShell>
      ) : null}

      {cobroModal ? (
        <ModalShell title="Registrar cobro" onClose={() => setCobroModal(null)}>
          <input className="input" type="number" placeholder="Monto" value={cobroForm.monto || ""} onChange={(event) => setCobroForm({ ...cobroForm, monto: Number(event.target.value) })} />
          <input className="input" type="date" value={cobroForm.fechaCobro} onChange={(event) => setCobroForm({ ...cobroForm, fechaCobro: event.target.value })} />
          <select className="input" value={cobroForm.metodoPago} onChange={(event) => setCobroForm({ ...cobroForm, metodoPago: event.target.value })}>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="QR">QR</option>
          </select>
          <input className="input" placeholder="Comprobante" value={cobroForm.comprobante} onChange={(event) => setCobroForm({ ...cobroForm, comprobante: event.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary rounded-2xl" onClick={() => setCobroModal(null)}>Cancelar</button>
            <button className="btn-primary rounded-2xl" onClick={registrarCobro}>Registrar cobro</button>
          </div>
        </ModalShell>
      ) : null}

      {showNuevaPagar ? (
        <ModalShell title="Nueva cuenta por pagar" onClose={() => setShowNuevaPagar(false)}>
          <input className="input" placeholder="ID del proveedor" value={nuevaPagarForm.proveedorId} onChange={(event) => setNuevaPagarForm({ ...nuevaPagarForm, proveedorId: event.target.value })} />
          <input className="input" type="number" placeholder="Monto original" value={nuevaPagarForm.montoOriginal || ""} onChange={(event) => setNuevaPagarForm({ ...nuevaPagarForm, montoOriginal: Number(event.target.value) })} />
          <input className="input" type="date" value={nuevaPagarForm.fechaEmision} onChange={(event) => setNuevaPagarForm({ ...nuevaPagarForm, fechaEmision: event.target.value })} />
          <input className="input" type="date" placeholder="Fecha de vencimiento" value={nuevaPagarForm.fechaVencimiento} onChange={(event) => setNuevaPagarForm({ ...nuevaPagarForm, fechaVencimiento: event.target.value })} />
          <input className="input" placeholder="Descripcion" value={nuevaPagarForm.descripcion} onChange={(event) => setNuevaPagarForm({ ...nuevaPagarForm, descripcion: event.target.value })} />
          <input className="input" placeholder="Numero de comprobante" value={nuevaPagarForm.numeroComprobante} onChange={(event) => setNuevaPagarForm({ ...nuevaPagarForm, numeroComprobante: event.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary rounded-2xl" onClick={() => setShowNuevaPagar(false)}>Cancelar</button>
            <button className="btn-primary rounded-2xl" onClick={guardarNuevaPagar}>Guardar</button>
          </div>
        </ModalShell>
      ) : null}

      {showNuevaCobrar ? (
        <ModalShell title="Nueva cuenta por cobrar" onClose={() => setShowNuevaCobrar(false)}>
          <input className="input" placeholder="ID del cliente" value={nuevaCobrarForm.clienteId} onChange={(event) => setNuevaCobrarForm({ ...nuevaCobrarForm, clienteId: event.target.value })} />
          <input className="input" type="number" placeholder="Monto original" value={nuevaCobrarForm.montoOriginal || ""} onChange={(event) => setNuevaCobrarForm({ ...nuevaCobrarForm, montoOriginal: Number(event.target.value) })} />
          <input className="input" type="date" value={nuevaCobrarForm.fechaEmision} onChange={(event) => setNuevaCobrarForm({ ...nuevaCobrarForm, fechaEmision: event.target.value })} />
          <input className="input" type="date" placeholder="Fecha de vencimiento" value={nuevaCobrarForm.fechaVencimiento} onChange={(event) => setNuevaCobrarForm({ ...nuevaCobrarForm, fechaVencimiento: event.target.value })} />
          <input className="input" placeholder="Descripcion" value={nuevaCobrarForm.descripcion} onChange={(event) => setNuevaCobrarForm({ ...nuevaCobrarForm, descripcion: event.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary rounded-2xl" onClick={() => setShowNuevaCobrar(false)}>Cancelar</button>
            <button className="btn-primary rounded-2xl" onClick={guardarNuevaCobrar}>Guardar</button>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
