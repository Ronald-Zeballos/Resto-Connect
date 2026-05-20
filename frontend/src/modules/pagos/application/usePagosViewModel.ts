import { useAsyncViewModel } from "../../../core/hooks/useAsyncViewModel";
import { pagosPort } from "../adapters/pagosRepository";
import type { PaymentItem } from "../ports/pagosPort";

const fallbackPayments: PaymentItem[] = [
  { id: "p-1001", pedido: "Mesa 4 - pedido 1001", mesaNumero: 4, total: 66, estado: "LISTO", qr: null },
  { id: "p-1002", pedido: "Mesa 7 - pedido 1002", mesaNumero: 7, total: 41, estado: "ENTREGADO", qr: null },
  { id: "p-1003", pedido: "Mesa 9 - pedido 1003", mesaNumero: 9, total: 29, estado: "CONFIRMADO", qr: null }
];

export function usePagosViewModel() {
  const state = useAsyncViewModel(() => pagosPort.listPendingPayments(), fallbackPayments, []);
  return { ...state, actions: pagosPort };
}
