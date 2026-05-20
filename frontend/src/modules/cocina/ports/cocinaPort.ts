import type { Pedido } from "../../../types";

export type CocinaPort = {
  list: () => Promise<Pedido[]>;
  changeStatus: (pedidoId: string, estado: string) => Promise<void>;
};
