import type { Incidencia } from "../../../types";

export type IncidenciasPort = {
  list: () => Promise<Incidencia[]>;
  create: (payload: { titulo: string; descripcion: string; categoria: string; prioridad: string }) => Promise<Incidencia>;
  updateStatus: (id: string, estado: string) => Promise<Incidencia>;
};
