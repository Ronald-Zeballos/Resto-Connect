import { CreditCard, FileText, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge, InlineFeedback, ModulePanel, PageHeader } from "../../../shared/ui/primitives";
import { usePagosViewModel } from "../application/usePagosViewModel";
import type { PaymentItem } from "../ports/pagosPort";

export function PagosPage() {
  const { data, loading, error, actions, reload } = usePagosViewModel();
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<Record<string, string>>({});
  const [invoiceById, setInvoiceById] = useState<Record<string, string>>({});
  const [customerById, setCustomerById] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string>("");
  const [busyId, setBusyId] = useState<string>("");

  useEffect(() => {
    setPayments(data);
  }, [data]);

  const pendingCount = useMemo(
    () => payments.filter((payment) => payment.estado !== "PAGADO" && payment.estado !== "FACTURADO").length,
    [payments]
  );

  async function chargePayment(payment: PaymentItem) {
    setBusyId(payment.id);
    try {
      const method = paymentMethod[payment.id] || "EFECTIVO";
      const confirmation = await actions.chargeCash(payment.id, payment.total, method, {
        razonSocial: customerById[payment.id] || "Consumidor Final",
        nitCi: "S/N",
        email: "facturacion@restoconnect.local"
      });
      setPayments((current) => current.map((item) => item.id === payment.id ? { ...item, estado: confirmation.estado || "PAGADO" } : item));
      if (confirmation.facturaNumero) {
        setInvoiceById((current) => ({ ...current, [payment.id]: confirmation.facturaNumero ?? "" }));
      }
      setNotice(confirmation.facturaNumero ? `Cobro aplicado y factura ${confirmation.facturaNumero} emitida.` : "Cobro registrado correctamente.");
      await reload();
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo registrar el cobro.");
    } finally {
      setBusyId("");
    }
  }

  function issueInvoice(id: string) {
    const payment = payments.find((item) => item.id === id);
    if (!payment) return;
    if (payment.estado !== "COBRADO" && payment.estado !== "FACTURADO" && payment.estado !== "PAGADO") {
      setNotice("Primero debes registrar o confirmar el cobro antes de emitir la factura.");
      return;
    }

    const invoiceNumber = invoiceById[id] ?? `FAC-${new Date().getFullYear()}-${String(Object.keys(invoiceById).length + 1).padStart(4, "0")}`;
    setInvoiceById((current) => ({ ...current, [id]: invoiceNumber }));
    setPayments((current) => current.map((item) => item.id === id ? { ...item, estado: "FACTURADO" } : item));
    setNotice(`Factura ${invoiceNumber} emitida.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cobros y cierre de mesa" eyebrow="Caja lista para cobrar en efectivo, tarjeta o transferencia" action={<button className="btn-primary rounded-2xl" onClick={() => void reload()}><RefreshCw size={16} /> Actualizar cobros</button>} />
      <InlineFeedback loading={loading} error={error} />
      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}
      <ModulePanel title="Cobros pendientes" port="Caja del turno" description="Registra el cobro al pedido y emite la factura.">
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">Pendientes</p>
            <p className="mt-2 text-2xl font-black">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">Cobrados</p>
            <p className="mt-2 text-2xl font-black">{payments.filter((payment) => payment.estado === "COBRADO" || payment.estado === "PAGADO").length}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">Facturados</p>
            <p className="mt-2 text-2xl font-black">{payments.filter((payment) => payment.estado === "FACTURADO").length}</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {payments.map((payment) => {
            const tone: "green" | "blue" | "red" | "yellow" =
              payment.estado === "FACTURADO"
                ? "green"
                : payment.estado === "COBRADO" || payment.estado === "PAGADO"
                  ? "blue"
                  : "yellow";

            return (
              <article key={payment.id} className="card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-black">{payment.pedido}</h2>
                  <Badge tone={tone}>{payment.estado}</Badge>
                </div>
                <p className="text-3xl font-black">BOB {payment.total}</p>
                {payment.mesaNumero ? <p className="mt-1 text-sm text-stone-500">Mesa {payment.mesaNumero}</p> : null}
                <div className="mt-4 space-y-3">
                  <label>
                    <span className="mb-1 block text-sm font-bold">Metodo de cobro</span>
                    <select className="input" defaultValue="EFECTIVO" onChange={(event) => setPaymentMethod((current) => ({ ...current, [payment.id]: event.target.value }))}>
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TARJETA">Tarjeta</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                  </label>
                  <label>
                    <span className="mb-1 block text-sm font-bold">Razon social o cliente</span>
                    <input className="input" value={customerById[payment.id] ?? ""} placeholder="Consumidor final" onChange={(event) => setCustomerById((current) => ({ ...current, [payment.id]: event.target.value }))} />
                  </label>
                  {invoiceById[payment.id] ? <p className="rounded-2xl bg-stone-50 px-3 py-2 text-sm text-stone-600">Factura emitida: <b>{invoiceById[payment.id]}</b></p> : null}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button className="btn-primary rounded-2xl" disabled={busyId === payment.id} onClick={() => void chargePayment(payment)}><CreditCard size={16} /> Registrar cobro</button>
                  <button className="btn-secondary rounded-2xl" onClick={() => issueInvoice(payment.id)}><FileText size={16} /> Emitir factura</button>
                </div>
              </article>
            );
          })}
        </div>
      </ModulePanel>
    </div>
  );
}
