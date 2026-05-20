import type { Alerta, InventarioItem } from "../../../types";

export type InventarioSnapshot = {
  items: InventarioItem[];
  alerts: Alerta[];
};

export type InventarioPort = {
  getSnapshot: () => Promise<InventarioSnapshot>;
};
