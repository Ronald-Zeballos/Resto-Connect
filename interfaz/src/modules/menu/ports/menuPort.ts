import type { Producto } from "../../../types";

export type MenuPort = {
  list: () => Promise<Producto[]>;
};
