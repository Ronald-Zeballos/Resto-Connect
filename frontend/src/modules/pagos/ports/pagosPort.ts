export type PaymentQr = {
  qrId: string;
  estado: string;
  monto: number;
  moneda: string;
  descripcion: string;
  expiracion?: string;
  imagenQr?: string;
  referenciaPago?: string;
  pagosDetectados: number;
  aplicado: boolean;
};

export type PaymentItem = {
  id: string;
  pedido: string;
  mesaNumero?: number;
  total: number;
  estado: string;
  qr?: PaymentQr | null;
};

export type PaymentConfirmation = {
  qr: PaymentQr;
  pagoId?: string;
  referenciaTransaccion?: string;
  facturaNumero?: string;
};

export type CashPaymentConfirmation = {
  pagoId?: string;
  estado: string;
  facturaNumero?: string;
};

export type PagosPort = {
  listPendingPayments: () => Promise<PaymentItem[]>;
  generateQr: (pedidoId: string, options?: { descripcion?: string; fechaExpiracion?: string; usoUnico?: boolean; montoEditable?: boolean }) => Promise<PaymentQr>;
  refreshQr: (qrId: string) => Promise<PaymentQr>;
  cancelQr: (qrId: string) => Promise<PaymentQr>;
  confirmQr: (qrId: string, options?: { razonSocial?: string; nitCi?: string; email?: string }) => Promise<PaymentConfirmation>;
  chargeCash: (pedidoId: string, monto: number, options?: { razonSocial?: string; nitCi?: string; email?: string }) => Promise<CashPaymentConfirmation>;
};
