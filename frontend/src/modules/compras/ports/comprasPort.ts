import type { OrdenCompra, Prediccion } from "../../../types";

export type ComprasSnapshot = {
  predicciones: Prediccion[];
  ordenes: OrdenCompra[];
};

export type ComprasPort = {
  getSnapshot: () => Promise<ComprasSnapshot>;
};
