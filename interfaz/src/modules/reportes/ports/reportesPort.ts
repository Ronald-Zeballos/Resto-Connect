export type PaymentMix = Array<{ name: string; value: number }>;

export type ReportesSnapshot = {
  sales: Array<{ dia: string; ventas: number }>;
  paymentMix: PaymentMix;
};

export type ReportesPort = {
  getSnapshot: () => Promise<ReportesSnapshot>;
};
