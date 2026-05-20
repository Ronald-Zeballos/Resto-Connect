import type { Pedido } from "../../../types";
import { demoPedidos } from "../../../data/demo";
import { api, asString, toRecordArray, withDemoFallback } from "../../../core/http/httpClient";
import type { CocinaPort } from "../ports/cocinaPort";

function mapOrders(value: unknown): Pedido[] {
  return toRecordArray(value).map((item, index) => ({
    id: asString(item.id ?? item.pedidoId, `pedido-${index}`),
    mesaNumero: Number(item.mesaNumero ?? item.numeroMesa ?? index + 1),
    estado: asString(item.estado, "PENDIENTE"),
    total: Number(item.total ?? 0),
    minutos: Number(item.minutos ?? item.minutosEspera ?? 0),
    items: toRecordArray(item.detalles || item.items).map((detalle, detalleIndex) => ({
      producto: asString(detalle.producto, `Producto ${detalleIndex + 1}`),
      cantidad: Number(detalle.cantidad ?? 0)
    }))
  }));
}

export const cocinaPort: CocinaPort = {
  async list() {
    return withDemoFallback(async () => {
      return mapOrders(await api.pedidosCocina());
    }, async () => demoPedidos);
  },
  async changeStatus(pedidoId, estado) {
    await withDemoFallback(async () => {
      await api.cambiarEstadoPedido(pedidoId, estado);
    }, async () => undefined);
  }
};
