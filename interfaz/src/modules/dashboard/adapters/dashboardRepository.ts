import type { Alerta, Mesa, Pedido, Producto } from "../../../types";
import { demoAlertas, demoMesas, demoPedidos, demoProductos, salesData } from "../../../data/demo";
import { api, asString, connectNotifications, toRecordArray, withDemoFallback } from "../../../core/http/httpClient";
import { resolveProductImage } from "../../../data/demo";
import type { DashboardPort } from "../ports/dashboardPort";

function mapAlerts(value: unknown): Alerta[] {
  return toRecordArray(value).map((item, index) => ({
    id: asString(item.id, `alert-${index}`),
    titulo: asString(item.titulo || item.mensaje, "Alerta operativa"),
    descripcion: asString(item.descripcion || item.detalle, "Sin detalle"),
    severidad: (asString(item.severidad, "INFO") as Alerta["severidad"])
  }));
}

function mapTables(value: unknown): Mesa[] {
  return toRecordArray(value).map((item, index) => ({
    id: asString(item.id, `mesa-${index}`),
    numero: Number(item.numero ?? index + 1),
    estado: (asString(item.estado, "LIBRE") as Mesa["estado"]),
    codigoQr: asString(item.codigoQr, `mesa-${index + 1}`)
  }));
}

function mapOrders(value: unknown): Pedido[] {
  return toRecordArray(value).map((item, index) => ({
    id: asString(item.id, `pedido-${index}`),
    mesaNumero: Number(item.mesaNumero ?? item.numeroMesa ?? index + 1),
    estado: asString(item.estado, "PENDIENTE"),
    total: Number(item.total ?? 0),
    minutos: Number(item.minutos ?? 0),
    items: []
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

export const dashboardPort: DashboardPort = {
  async getSnapshot() {
    return withDemoFallback(async () => {
      const [alerts, tables, orders, products] = await Promise.all([
        api.alertas(),
        api.mapaMesas(),
        api.pedidosPendientes(),
        api.productos()
      ]);

      return {
        sales: salesData,
        alerts: mapAlerts(alerts),
        tables: mapTables(tables),
        activeOrders: mapOrders(orders),
        featuredProducts: mapProducts(products).slice(0, 4)
      };
    }, async () => ({
      sales: salesData,
      alerts: demoAlertas,
      tables: demoMesas,
      activeOrders: demoPedidos,
      featuredProducts: demoProductos.slice(0, 4)
    }));
  },
  subscribeToEvents(onEvent) {
    try {
      return connectNotifications(onEvent);
    } catch {
      return () => undefined;
    }
  }
};
