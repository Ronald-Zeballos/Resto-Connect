import type { Mesa } from "../../../types";
import { demoMesas } from "../../../data/demo";
import { api, asString, withDemoFallback } from "../../../core/http/httpClient";
import { mapMesas } from "../../../core/http/mappers";
import type { MesasPort } from "../ports/mesasPort";

export const mesasPort: MesasPort = {
  async list() {
    return withDemoFallback(async () => mapMesas(await api.mesas()), async () => demoMesas);
  },
  async changeStatus(id, estado) {
    return withDemoFallback(async () => {
      const raw = await api.cambiarEstadoMesa(id, estado);
      return {
        id: asString(raw.id, id),
        numero: Number(raw.numero ?? 0),
        estado: asString(raw.estado, estado) as Mesa["estado"],
        codigoQr: asString(raw.codigoQr)
      };
    }, async () => {
      const mesa = demoMesas.find((item) => item.id === id);
      return { ...(mesa ?? demoMesas[0]), id, estado };
    });
  }
};
