import type { OrdenCompra, Prediccion } from "../../../types";
import { demoOrdenes, demoPredicciones } from "../../../data/demo";
import { api, asString, toRecordArray, withDemoFallback } from "../../../core/http/httpClient";
import type { ComprasPort } from "../ports/comprasPort";

function mapPredictions(value: unknown): Prediccion[] {
  return toRecordArray(value).map((item, index) => ({
    id: asString(item.id, `pred-${index}`),
    item: asString(item.item || item.nombreItem, `Item ${index + 1}`),
    consumoPromedioDiario: Number(item.consumoPromedioDiario ?? 0),
    diasHastaAgotamiento: Number(item.diasHastaAgotamiento ?? 0),
    cantidadSugeridaCompra: Number(item.cantidadSugeridaCompra ?? 0),
    nivelRiesgo: asString(item.nivelRiesgo, "BAJO") as Prediccion["nivelRiesgo"],
    confianza: Number(item.confianza ?? 0)
  }));
}

function mapOrders(value: unknown): OrdenCompra[] {
  return toRecordArray(value).map((item, index) => ({
    id: asString(item.id, `orden-${index}`),
    proveedor: asString(item.proveedor || item.proveedorNombre, `Proveedor ${index + 1}`),
    estado: asString(item.estado, "BORRADOR") as OrdenCompra["estado"],
    total: Number(item.total ?? 0),
    fecha: asString(item.fecha, "2026-05-11")
  }));
}

export const comprasPort: ComprasPort = {
  async getSnapshot() {
    return withDemoFallback(async () => {
      const [predicciones, ordenes] = await Promise.all([api.predicciones(), api.ordenes()]);
      return {
        predicciones: mapPredictions(predicciones),
        ordenes: mapOrders(ordenes)
      };
    }, async () => ({ predicciones: demoPredicciones, ordenes: demoOrdenes }));
  }
};
