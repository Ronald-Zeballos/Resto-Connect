import { CreditCard, FileCheck, FileText, RefreshCw, SquareX, Ticket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge, InlineFeedback, ModulePanel, PageHeader, SafeImage } from "../../../shared/ui/primitives";
import { TableQrPreview } from "../../mesas/interface/TableQrPreview";
import { usePagosViewModel } from "../application/usePagosViewModel";
import type { PaymentItem, PaymentQr } from "../ports/pagosPort";

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
    setPaymentMethod((current) => Object.fromEntries(data.map((item) => [item.id, current[item.id] ?? (item.qr ? "QR" : "EFECTIVO")])));
  }, [data]);

  const pendingCount = useMemo(
    () => payments.filter((payment) => payment.estado !== "PAGADO" && payment.estado !== "FACTURADO" && !payment.qr?.aplicado).length,
    [payments]
  );

  function updatePayment(id: string, updater: (payment: PaymentItem) => PaymentItem) {
    setPayments((current) => current.map((payment) => payment.id === id ? updater(payment) : payment));
  }

  async function generateQr(payment: PaymentItem) {
    setBusyId(payment.id);
    try {
      const qr = await actions.generateQr(payment.id, {
        descripcion: `Cobro de ${payment.pedido}`,
        usoUnico: true
      });
      updatePayment(payment.id, (current) => ({ ...current, qr }));
      setPaymentMethod((current) => ({ ...current, [payment.id]: "QR" }));
      setNotice("QR generado correctamente.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo generar el QR.");
    } finally {
      setBusyId("");
    }
  }

  async function refreshQr(payment: PaymentItem) {
    if (!payment.qr) return;
    setBusyId(payment.id);
    try {
      const qr = await actions.refreshQr(payment.qr.qrId);
      updatePayment(payment.id, (current) => ({ ...current, qr }));
      setNotice(qr.pagosDetectados > 0 ? "El QR ya registra un pago." : "Estado del QR actualizado.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo consultar el QR.");
    } finally {
      setBusyId("");
    }
  }

  async function cancelQr(payment: PaymentItem) {
    if (!payment.qr) return;
    setBusyId(payment.id);
    try {
      const qr = await actions.cancelQr(payment.qr.qrId);
      updatePayment(payment.id, (current) => ({ ...current, qr }));
      setNotice("QR cancelado correctamente.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo cancelar el QR.");
    } finally {
      setBusyId("");
    }
  }

  async function chargePayment(payment: PaymentItem) {
    setBusyId(payment.id);
    try {
      const confirmation = await actions.chargeCash(payment.id, payment.total, {
        razonSocial: customerById[payment.id] || "Consumidor Final",
        nitCi: "S/N",
        email: "facturacion@restoconnect.local"
      });
      updatePayment(payment.id, (current) => ({ ...current, estado: confirmation.estado || "PAGADO" }));
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

  async function confirmQr(payment: PaymentItem) {
    if (!payment.qr) return;
    setBusyId(payment.id);
    try {
      const confirmation = await actions.confirmQr(payment.qr.qrId, {
        razonSocial: customerById[payment.id] || "Consumidor Final",
        nitCi: "S/N",
        email: "facturacion@restoconnect.local"
      });
      updatePayment(payment.id, (current) => ({ ...current, estado: "PAGADO", qr: confirmation.qr }));
      if (confirmation.facturaNumero) {
        setInvoiceById((current) => ({ ...current, [payment.id]: confirmation.facturaNumero ?? "" }));
      }
      setNotice(confirmation.facturaNumero ? `Pago aplicado y factura ${confirmation.facturaNumero} emitida.` : "Pago QR aplicado al pedido.");
      await reload();
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo confirmar el pago QR.");
    } finally {
      setBusyId("");
    }
  }

  function renderQrPreview(payment: PaymentItem, qr: PaymentQr) {
    if (qr.imagenQr) {
      return <SafeImage className="mx-auto h-32 w-32 rounded-2xl border border-stone-200 bg-white p-2" src={qr.imagenQr} alt={`QR de ${payment.pedido}`} fallback="/images/qr-table.png" />;
    }
    return <TableQrPreview value={`${payment.id}:${qr.qrId}:${qr.monto}`} alt={`QR de ${payment.pedido}`} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cobros y cierre de mesa" eyebrow="Caja lista para cobrar en efectivo, tarjeta o QR interoperable" action={<button className="btn-primary rounded-2xl" onClick={() => void reload()}><RefreshCw size={16} /> Actualizar cobros</button>} />
      <InlineFeedback loading={loading} error={error} />
      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}
      <ModulePanel title="Cobros pendientes" port="Caja del turno" description="Genera el QR, consulta si ya pagaron y aplica el cobro al pedido antes de facturar.">
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
              payment.qr?.aplicado || payment.estado === "FACTURADO"
                ? "green"
                : payment.qr?.estado === "PAGADO_CONFIRMADO" || payment.estado === "COBRADO" || payment.estado === "PAGADO"
                  ? "blue"
                  : payment.qr?.estado === "CANCELADO"
                    ? "red"
                    : "yellow";

            return (
              <article key={payment.id} className="card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-black">{payment.pedido}</h2>
                  <Badge tone={tone}>{payment.qr?.estado ?? payment.estado}</Badge>
                </div>
                <p className="text-3xl font-black">BOB {payment.total}</p>
                {payment.mesaNumero ? <p className="mt-1 text-sm text-stone-500">Mesa {payment.mesaNumero}</p> : null}
                <div className="mt-4 space-y-3">
                  <label>
                    <span className="mb-1 block text-sm font-bold">Metodo de cobro</span>
                    <select className="input" value={paymentMethod[payment.id] ?? "EFECTIVO"} onChange={(event) => setPaymentMethod((current) => ({ ...current, [payment.id]: event.target.value }))}>
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="QR">QR</option>
                      <option value="TARJETA">Tarjeta</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                  </label>
                  <label>
                    <span className="mb-1 block text-sm font-bold">Razon social o cliente</span>
                    <input className="input" value={customerById[payment.id] ?? ""} placeholder="Consumidor final" onChange={(event) => setCustomerById((current) => ({ ...current, [payment.id]: event.target.value }))} />
                  </label>
                  {paymentMethod[payment.id] === "QR" && payment.qr ? (
                    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                      <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
                        <div>{renderQrPreview(payment, payment.qr)}</div>
                        <div className="space-y-2 text-sm text-stone-600">
                          <p><b>QR:</b> {payment.qr.qrId}</p>
                          <p><b>Estado:</b> {payment.qr.estado}</p>
                          <p><b>Monto:</b> {payment.qr.moneda} {payment.qr.monto}</p>
                          <p><b>Pagos detectados:</b> {payment.qr.pagosDetectados}</p>
                          {payment.qr.expiracion ? <p><b>Vence:</b> {new Date(payment.qr.expiracion).toLocaleString()}</p> : null}
                          {payment.qr.referenciaPago ? <p><b>Referencia:</b> {payment.qr.referenciaPago}</p> : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {invoiceById[payment.id] ? <p className="rounded-2xl bg-stone-50 px-3 py-2 text-sm text-stone-600">Factura emitida: <b>{invoiceById[payment.id]}</b></p> : null}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {paymentMethod[payment.id] === "QR" ? (
                    <>
                      <button className="btn-primary rounded-2xl" disabled={busyId === payment.id} onClick={() => payment.qr ? refreshQr(payment) : generateQr(payment)}>
                        {payment.qr ? <RefreshCw size={16} /> : <Ticket size={16} />}
                        {payment.qr ? "Actualizar QR" : "Generar QR"}
                      </button>
                      <button className="btn-secondary rounded-2xl" disabled={busyId === payment.id || !payment.qr || payment.qr.estado === "CANCELADO"} onClick={() => payment.qr && (payment.qr.pagosDetectados > 0 || payment.qr.estado === "PAGADO_CONFIRMADO") ? confirmQr(payment) : cancelQr(payment)}>
                        {payment.qr && (payment.qr.pagosDetectados > 0 || payment.qr.estado === "PAGADO_CONFIRMADO") ? <FileCheck size={16} /> : <SquareX size={16} />}
                        {payment.qr && (payment.qr.pagosDetectados > 0 || payment.qr.estado === "PAGADO_CONFIRMADO") ? "Aplicar pago" : "Cancelar QR"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-primary rounded-2xl" disabled={busyId === payment.id} onClick={() => void chargePayment(payment)}><CreditCard size={16} /> Registrar cobro</button>
                      <button className="btn-secondary rounded-2xl" onClick={() => issueInvoice(payment.id)}><FileText size={16} /> Emitir factura</button>
                    </>
                  )}
                </div>
                {paymentMethod[payment.id] === "QR" ? (
                  <div className="mt-2">
                    <button className="btn-secondary w-full rounded-2xl" onClick={() => issueInvoice(payment.id)}><FileText size={16} /> Emitir factura</button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </ModulePanel>
    </div>
  );
}
