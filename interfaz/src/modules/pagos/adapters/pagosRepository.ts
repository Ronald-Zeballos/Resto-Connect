import { api, asString, toRecordArray, withDemoFallback } from "../../../core/http/httpClient";
import type { PagosPort, PaymentItem } from "../ports/pagosPort";

const STORAGE_KEY = "restoconnect-demo-payments";

const fallbackPayments: PaymentItem[] = [
  { id: "p-1001", pedido: "Mesa 4 - pedido 1001", mesaNumero: 4, total: 66, estado: "LISTO" },
  { id: "p-1002", pedido: "Mesa 7 - pedido 1002", mesaNumero: 7, total: 41, estado: "ENTREGADO" },
  { id: "p-1003", pedido: "Mesa 9 - pedido 1003", mesaNumero: 9, total: 29, estado: "CONFIRMADO" }
];

function mapPayments(value: unknown): PaymentItem[] {
  return toRecordArray(value).map((item, index) => ({
    id: asString(item.pedidoId ?? item.id, `pedido-${index}`),
    pedido: asString(item.pedido, `Pedido ${asString(item.pedidoId ?? item.id, `p-${1000 + index}`)}`),
    mesaNumero: Number(item.mesaNumero ?? 0) || undefined,
    total: Number(item.total ?? item.montoTotal ?? 0),
    estado: asString(item.estado, "Pendiente")
  }));
}

function readDemoPayments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallbackPayments;
    const parsed = JSON.parse(raw) as PaymentItem[];
    return parsed.length ? parsed : fallbackPayments;
  } catch {
    return fallbackPayments;
  }
}

function writeDemoPayments(payments: PaymentItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  return payments;
}

export const pagosPort: PagosPort = {
  async listPendingPayments() {
    return withDemoFallback(async () => {
      return mapPayments(await api.cobrosQr());
    }, async () => writeDemoPayments(readDemoPayments()));
  },
  async chargeCash(pedidoId, monto, metodo, options) {
    return withDemoFallback(async () => {
      const result = await api.pagarEfectivo({
        pedidoId,
        monto,
        metodo,
        confirmadoPorMesero: true,
        datosFacturacion: {
          razonSocial: options?.razonSocial || "Consumidor Final",
          nitCi: options?.nitCi || "S/N",
          email: options?.email || "facturacion@restoconnect.local"
        }
      });
      const pago = typeof result.pago === "object" && result.pago !== null ? result.pago as Record<string, unknown> : {};
      const factura = typeof result.factura === "object" && result.factura !== null ? result.factura as Record<string, unknown> : {};
      return {
        pagoId: asString(pago.id),
        estado: asString(pago.estado, "PAGADO"),
        facturaNumero: asString(factura.numeroFactura)
      };
    }, async () => ({
      pagoId: `cash-${pedidoId}`,
      estado: "PAGADO",
      facturaNumero: `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
    }));
  }
};
