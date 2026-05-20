import type { Producto } from "../../../types";
import { demoProductos, resolveProductImage } from "../../../data/demo";
import { api, asString, toRecordArray, withDemoFallback } from "../../../core/http/httpClient";
import type { MenuPort } from "../ports/menuPort";

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

export const menuPort: MenuPort = {
  async list() {
    return withDemoFallback(async () => mapProducts(await api.productos()), async () => demoProductos);
  }
};
