import type { Alerta, Mesa, Pedido, Producto } from "../../../types";

export type DashboardSnapshot = {
  sales: Array<{ dia: string; ventas: number }>;
  alerts: Alerta[];
  tables: Mesa[];
  activeOrders: Pedido[];
  featuredProducts: Producto[];
};

export type DashboardPort = {
  getSnapshot: () => Promise<DashboardSnapshot>;
  subscribeToEvents: (onEvent: (message: string) => void) => () => void;
};
