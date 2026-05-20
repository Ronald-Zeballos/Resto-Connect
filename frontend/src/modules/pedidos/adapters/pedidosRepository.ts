import type { Mesa, Producto } from "../../../types";
import { demoMesas, demoProductos, resolveProductImage } from "../../../data/demo";
import { api, asString, toRecordArray, withDemoFallback } from "../../../core/http/httpClient";
import type { PedidoWorkspace, PedidosPort } from "../ports/pedidosPort";

function mapTables(value: unknown): Mesa[] {
  return toRecordArray(value).map((item, index) => ({
    id: asString(item.id ?? item.mesaId, `mesa-${index}`),
    numero: Number(item.numero ?? item.numeroMesa ?? index + 1),
    estado: asString(item.estado ?? item.estadoMesa, "LIBRE") as Mesa["estado"],
    codigoQr: asString(item.codigoQr, `mesa-${index + 1}`)
  }));
}

function mapProducts(value: unknown): Producto[] {
  return toRecordArray(value).map((item, index) => {
    const nombre = asString(item.nombre, `Producto ${index + 1}`);
    const categoria = asString(item.categoriaNombre || item.categoria, "General");
    return {
      id: asString(item.id, `producto-${index}`),
      nombre,
      descripcion: asString(item.descripcion, "Sin descripcion"),
      precio: Number(item.precio ?? 0),
      categoria,
      activo: Boolean(item.activo ?? true),
      disponible: Boolean(item.disponible ?? true),
      imagenUrl: resolveProductImage(nombre, categoria, asString(item.imagenUrl))
    };
  });
}

export const pedidosPort: PedidosPort = {
  async loadWorkspace(): Promise<PedidoWorkspace> {
    return withDemoFallback(async () => {
      const [mesas, productos] = await Promise.all([api.mesas(), api.productos()]);
      return { mesas: mapTables(mesas), productos: mapProducts(productos) };
    }, async () => ({ mesas: demoMesas, productos: demoProductos }));
  }
};
