export type PaymentItem = {
  id: string;
  pedido: string;
  mesaNumero?: number;
  total: number;
  estado: string;
};

export type CashPaymentConfirmation = {
  pagoId?: string;
  estado: string;
  facturaNumero?: string;
};

export type PagosPort = {
  listPendingPayments: () => Promise<PaymentItem[]>;
  chargeCash: (pedidoId: string, monto: number, metodo: string, options?: { razonSocial?: string; nitCi?: string; email?: string }) => Promise<CashPaymentConfirmation>;
};
