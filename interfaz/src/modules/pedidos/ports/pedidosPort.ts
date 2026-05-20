import type { Mesa, Producto } from "../../../types";

export type PedidoWorkspace = {
  mesas: Mesa[];
  productos: Producto[];
};

export type PedidosPort = {
  loadWorkspace: () => Promise<PedidoWorkspace>;
};
