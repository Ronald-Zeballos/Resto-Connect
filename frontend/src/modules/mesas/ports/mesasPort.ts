import type { Mesa } from "../../../types";

export type MesasPort = {
  list: () => Promise<Mesa[]>;
  changeStatus: (id: string, estado: Mesa["estado"]) => Promise<Mesa>;
};
