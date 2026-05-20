import type { Incidencia } from "../../../types";
import { demoIncidencias } from "../../../data/demo";
import { api, asString, toRecordArray, withDemoFallback } from "../../../core/http/httpClient";
import type { IncidenciasPort } from "../ports/incidenciasPort";

function mapIncidents(value: unknown): Incidencia[] {
  return toRecordArray(value).map((item, index) => ({
    id: asString(item.id, `incidencia-${index}`),
    titulo: asString(item.titulo, `Incidencia ${index + 1}`),
    categoria: asString(item.categoria, "OPERATIVA"),
    prioridad: asString(item.prioridad, "MEDIA") as Incidencia["prioridad"],
    estado: asString(item.estado, "ABIERTA") as Incidencia["estado"]
  }));
}

export const incidenciasPort: IncidenciasPort = {
  async list() {
    return withDemoFallback(async () => {
      return mapIncidents(await api.incidencias());
    }, async () => demoIncidencias);
  },
  async create(payload) {
    return withDemoFallback(async () => {
      const raw = await api.registrarIncidencia({
        titulo: payload.titulo,
        descripcion: payload.descripcion,
        categoria: payload.categoria,
        prioridad: payload.prioridad
      });
      return mapIncidents([raw])[0];
    }, async () => ({
      id: `local-${Date.now()}`,
      titulo: payload.titulo,
      categoria: payload.categoria,
      prioridad: payload.prioridad as Incidencia["prioridad"],
      estado: "ABIERTA"
    }));
  },
  async updateStatus(id, estado) {
    return withDemoFallback(async () => {
      const raw = await api.actualizarEstadoIncidencia(id, {
        estado,
        comentarioResolucion: estado === "RESUELTA" ? "Resuelta desde panel operativo." : ""
      });
      return mapIncidents([raw])[0];
    }, async () => {
      const current = demoIncidencias.find((item) => item.id === id) ?? demoIncidencias[0];
      return {
        ...current,
        id,
        estado: estado as Incidencia["estado"]
      };
    });
  }
};
