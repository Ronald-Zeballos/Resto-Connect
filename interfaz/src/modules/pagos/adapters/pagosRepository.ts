import { api, asString, toRecordArray, withDemoFallback } from "../../../core/http/httpClient";
import type { PagosPort, PaymentConfirmation, PaymentItem, PaymentQr } from "../ports/pagosPort";

const STORAGE_KEY = "restoconnect-demo-payments";

const fallbackPayments: PaymentItem[] = [
  { id: "p-1001", pedido: "Mesa 4 - pedido 1001", mesaNumero: 4, total: 66, estado: "LISTO", qr: null },
  { id: "p-1002", pedido: "Mesa 7 - pedido 1002", mesaNumero: 7, total: 41, estado: "ENTREGADO", qr: null },
  { id: "p-1003", pedido: "Mesa 9 - pedido 1003", mesaNumero: 9, total: 29, estado: "CONFIRMADO", qr: null }
];

function normalizeQrImage(value: string) {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) return value;
  if (value.length > 100) return `data:image/png;base64,${value}`;
  return value;
}

function mapQr(value: Record<string, unknown> | null | undefined): PaymentQr | null {
  if (!value) return null;
  return {
    qrId: asString(value.qrId),
    estado: asString(value.estado, "PENDIENTE"),
    monto: Number(value.monto ?? 0),
    moneda: asString(value.moneda, "BOB"),
    descripcion: asString(value.descripcion, "Cobro QR"),
    expiracion: asString(value.expiracion),
    imagenQr: normalizeQrImage(asString(value.imagenQr)),
    referenciaPago: asString(value.referenciaPago),
    pagosDetectados: Number(value.pagosDetectados ?? 0),
    aplicado: Boolean(value.aplicado)
  };
}

function mapPayments(value: unknown): PaymentItem[] {
  return toRecordArray(value).map((item, index) => ({
    id: asString(item.pedidoId ?? item.id, `pedido-${index}`),
    pedido: asString(item.pedido, `Pedido ${asString(item.pedidoId ?? item.id, `p-${1000 + index}`)}`),
    mesaNumero: Number(item.mesaNumero ?? 0) || undefined,
    total: Number(item.total ?? item.montoTotal ?? 0),
    estado: asString(item.estado, "Pendiente"),
    qr: mapQr((typeof item.qr === "object" && item.qr !== null ? item.qr : null) as Record<string, unknown> | null)
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

function buildDemoQr(payment: PaymentItem): PaymentQr {
  return {
    qrId: `QR-${payment.id}`,
    estado: "PENDIENTE",
    monto: payment.total,
    moneda: "BOB",
    descripcion: `Cobro QR ${payment.pedido}`,
    expiracion: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    imagenQr: "",
    referenciaPago: "",
    pagosDetectados: 0,
    aplicado: false
  };
}

function findPaymentByQr(qrId: string, payments: PaymentItem[]) {
  return payments.find((payment) => payment.qr?.qrId === qrId);
}

export const pagosPort: PagosPort = {
  async listPendingPayments() {
    return withDemoFallback(async () => {
      return mapPayments(await api.cobrosQr());
    }, async () => writeDemoPayments(readDemoPayments()));
  },
  async generateQr(pedidoId, options) {
    return withDemoFallback(async () => {
      const qr = mapQr(await api.generarPagoQr({
        pedidoId,
        descripcion: options?.descripcion,
        fechaExpiracion: options?.fechaExpiracion,
        usoUnico: options?.usoUnico ?? true,
        montoEditable: options?.montoEditable ?? false
      }));
      return qr ?? buildDemoQr(fallbackPayments[0]);
    }, async () => {
      const payments = readDemoPayments().map((payment) => payment.id === pedidoId ? { ...payment, qr: buildDemoQr(payment) } : payment);
      writeDemoPayments(payments);
      return payments.find((payment) => payment.id === pedidoId)?.qr ?? buildDemoQr(fallbackPayments[0]);
    });
  },
  async refreshQr(qrId) {
    return withDemoFallback(async () => {
      const qr = mapQr(await api.consultarPagoQr(qrId));
      return qr ?? {
        qrId,
        estado: "PENDIENTE",
        monto: 0,
        moneda: "BOB",
        descripcion: "Cobro QR",
        pagosDetectados: 0,
        aplicado: false
      };
    }, async () => {
      const payments = readDemoPayments().map((payment) => {
        if (payment.qr?.qrId !== qrId) return payment;
        return {
          ...payment,
          qr: {
            ...payment.qr,
            estado: "PAGADO_CONFIRMADO",
            pagosDetectados: Math.max(payment.qr.pagosDetectados, 1),
            referenciaPago: payment.qr.referenciaPago || `TX-${payment.id.toUpperCase()}`
          }
        };
      });
      writeDemoPayments(payments);
      return findPaymentByQr(qrId, payments)?.qr ?? {
        qrId,
        estado: "PAGADO_CONFIRMADO",
        monto: 0,
        moneda: "BOB",
        descripcion: "Cobro QR",
        pagosDetectados: 1,
        aplicado: false
      };
    });
  },
  async cancelQr(qrId) {
    return withDemoFallback(async () => {
      const qr = mapQr(await api.cancelarPagoQr(qrId));
      return qr ?? {
        qrId,
        estado: "CANCELADO",
        monto: 0,
        moneda: "BOB",
        descripcion: "Cobro QR",
        pagosDetectados: 0,
        aplicado: false
      };
    }, async () => {
      const payments = readDemoPayments().map((payment) => payment.qr?.qrId === qrId ? {
        ...payment,
        qr: {
          ...payment.qr,
          estado: "CANCELADO"
        }
      } : payment);
      writeDemoPayments(payments);
      return findPaymentByQr(qrId, payments)?.qr ?? {
        qrId,
        estado: "CANCELADO",
        monto: 0,
        moneda: "BOB",
        descripcion: "Cobro QR",
        pagosDetectados: 0,
        aplicado: false
      };
    });
  },
  async confirmQr(qrId, options) {
    return withDemoFallback(async () => {
      const result = await api.confirmarPagoQr(qrId, {
        datosFacturacion: {
          razonSocial: options?.razonSocial || "Consumidor Final",
          nitCi: options?.nitCi || "S/N",
          email: options?.email || "facturacion@restoconnect.local"
        }
      });
      const qr = mapQr((typeof result.qr === "object" && result.qr !== null ? result.qr : null) as Record<string, unknown> | null);
      const pago = typeof result.pago === "object" && result.pago !== null ? result.pago as Record<string, unknown> : {};
      const factura = typeof result.factura === "object" && result.factura !== null ? result.factura as Record<string, unknown> : {};
      return {
        qr: qr ?? {
          qrId,
          estado: "APLICADO",
          monto: 0,
          moneda: "BOB",
          descripcion: "Cobro QR",
          pagosDetectados: 1,
          aplicado: true
        },
        pagoId: asString(pago.id),
        referenciaTransaccion: asString(pago.referenciaTransaccion),
        facturaNumero: asString(factura.numeroFactura)
      } as PaymentConfirmation;
    }, async () => {
      const payments = readDemoPayments().map((payment) => payment.qr?.qrId === qrId ? {
        ...payment,
        estado: "PAGADO",
        qr: {
          ...payment.qr,
          estado: "APLICADO",
          aplicado: true,
          pagosDetectados: Math.max(payment.qr.pagosDetectados, 1),
          referenciaPago: payment.qr.referenciaPago || `TX-${payment.id.toUpperCase()}`
        }
      } : payment);
      writeDemoPayments(payments);
      const payment = findPaymentByQr(qrId, payments);
      return {
        qr: payment?.qr ?? {
          qrId,
          estado: "APLICADO",
          monto: 0,
          moneda: "BOB",
          descripcion: "Cobro QR",
          pagosDetectados: 1,
          aplicado: true
        },
        referenciaTransaccion: payment?.qr?.referenciaPago ?? `TX-${qrId}`,
        facturaNumero: `FAC-${new Date().getFullYear()}-${String(payments.length).padStart(4, "0")}`
      };
    });
  },
  async chargeCash(pedidoId, monto, options) {
    return withDemoFallback(async () => {
      const result = await api.pagarEfectivo({
        pedidoId,
        monto,
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
