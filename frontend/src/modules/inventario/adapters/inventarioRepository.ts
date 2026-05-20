import type { Alerta, InventarioItem } from "../../../types";
import { demoAlertas, demoInventario } from "../../../data/demo";
import { api, asString, toRecordArray, withDemoFallback } from "../../../core/http/httpClient";
import type { InventarioPort } from "../ports/inventarioPort";

function mapItems(value: unknown): InventarioItem[] {
  return toRecordArray(value).map((item, index) => ({
    id: asString(item.id, `item-${index}`),
    nombre: asString(item.nombre, `Item ${index + 1}`),
    descripcion: asString(item.descripcion, "Sin descripcion"),
    unidadMedida: asString(item.unidadMedida, "UNIDAD"),
    stockActual: Number(item.stockActual ?? 0),
    stockMinimo: Number(item.stockMinimo ?? 0),
    stockMaximo: Number(item.stockMaximo ?? 1),
    puntoReorden: Number(item.puntoReorden ?? 0),
    costoUnitario: Number(item.costoUnitario ?? 0),
    clasificacionAbc: asString(item.clasificacionAbc, "MEDIA") as InventarioItem["clasificacionAbc"]
  }));
}

function mapAlerts(value: unknown): Alerta[] {
  return toRecordArray(value).map((item, index) => ({
    id: asString(item.id, `alerta-${index}`),
    titulo: asString(item.titulo || item.mensaje, "Alerta"),
    descripcion: asString(item.descripcion || item.detalle, "Sin detalle"),
    severidad: asString(item.severidad, "INFO") as Alerta["severidad"]
  }));
}

export const inventarioPort: InventarioPort = {
  async getSnapshot() {
    return withDemoFallback(async () => {
      const [items, alerts] = await Promise.all([api.inventario(), api.alertas()]);
      return {
        items: mapItems(items),
        alerts: mapAlerts(alerts)
      };
    }, async () => ({ items: demoInventario, alerts: demoAlertas }));
  }
};
