import type { Alerta, Categoria, ConsumoVsPrediccion, InventarioItem, Mesa, Pedido, Prediccion, Producto, ProductoVendido, VentaDiaria, VentaMetodo } from "../../types";
import { asString, toRecordArray } from "./httpClient";
import { resolveProductImage } from "../../data/demo";

export function mapProduct(item: Record<string, unknown>, index: number): Producto {
  const categoria = asString(item.categoriaNombre || item.categoria, "General");
  const recetaArray = Array.isArray(item.receta) ? item.receta as Array<Record<string, unknown>> : [];
  return {
    id: asString(item.id, `producto-${index}`),
    nombre: asString(item.nombre, `Producto ${index + 1}`),
    descripcion: asString(item.descripcion, "Sin descripcion"),
    precio: Number(item.precio ?? 0),
    categoriaId: asString(item.categoriaId),
    categoria,
    activo: Boolean(item.activo ?? true),
    disponible: Boolean(item.disponible ?? true),
    imagenUrl: resolveProductImage(asString(item.nombre, `Producto ${index + 1}`), categoria, asString(item.imagenUrl)),
    codigoInterno: asString(item.codigoInterno),
    costo: Number(item.costo ?? 0),
    esVenta: Boolean(item.esVenta ?? true),
    esInsumo: Boolean(item.esInsumo ?? false),
    impuestoAplicable: Number(item.impuestoAplicable ?? 0),
    unidadMedida: asString(item.unidadMedida, "UNIDAD"),
    receta: recetaArray.map((r) => ({
      id: asString(r.id) || undefined,
      itemInventarioId: asString(r.itemInventarioId),
      itemInventarioNombre: asString(r.itemInventarioNombre),
      cantidadNecesaria: Number(r.cantidadNecesaria ?? 0),
      unidadMedida: asString(r.unidadMedida)
    }))
  };
}

export function mapProducts(value: unknown): Producto[] {
  return toRecordArray(value).map(mapProduct);
}

export function mapCategory(item: Record<string, unknown>, index: number): Categoria {
  return {
    id: asString(item.id, `categoria-${index}`),
    nombre: asString(item.nombre, `Categoria ${index + 1}`),
    descripcion: asString(item.descripcion),
    activo: Boolean(item.activo ?? true)
  };
}

export function mapCategories(value: unknown): Categoria[] {
  return toRecordArray(value).map(mapCategory);
}

export function mapMesa(item: Record<string, unknown>, index: number): Mesa {
  return {
    id: asString(item.id, `mesa-${index}`),
    numero: Number(item.numero ?? index + 1),
    estado: asString(item.estado, "LIBRE") as Mesa["estado"],
    codigoQr: asString(item.codigoQr, `mesa-${index + 1}`)
  };
}

export function mapMesas(value: unknown): Mesa[] {
  return toRecordArray(value).map(mapMesa);
}

export function mapPedido(item: Record<string, unknown>, index: number): Pedido {
  return {
    id: asString(item.id, `pedido-${index}`),
    mesaNumero: Number(item.mesaNumero ?? item.numeroMesa ?? index + 1),
    estado: asString(item.estado, "PENDIENTE"),
    metodoPago: asString(item.metodoPago),
    total: Number(item.total ?? 0),
    minutos: Number(item.minutos ?? 0),
    items: toRecordArray(item.detalles || item.items).map((detalle, detalleIndex) => ({
      productId: asString(detalle.productoId || detalle.id) || undefined,
      producto: asString(detalle.producto || detalle.productoNombre, `Producto ${detalleIndex + 1}`),
      cantidad: Number(detalle.cantidad ?? 0),
      precioUnitario: Number(detalle.precioUnitario ?? 0) || undefined,
      subtotal: Number(detalle.subtotal ?? 0) || undefined
    }))
  };
}

export function mapInventoryItem(item: Record<string, unknown>, index: number): InventarioItem {
  return {
    id: asString(item.id, `item-${index}`),
    nombre: asString(item.nombre, `Item ${index + 1}`),
    descripcion: asString(item.descripcion, "Sin descripcion"),
    unidadMedida: asString(item.unidadMedida, "UNIDAD"),
    stockActual: Number(item.stockActual ?? 0),
    stockMinimo: Number(item.stockMinimo ?? 0),
    stockMaximo: Number(item.stockMaximo ?? 1),
    puntoReorden: Number(item.puntoReorden ?? 0),
    costoUnitario: Number(item.costoUnitario ?? 0),
    costoPromedioPonderado: Number(item.costoPromedioPonderado ?? 0) || undefined,
    clasificacionAbc: asString(item.clasificacionAbc, "MEDIA") as InventarioItem["clasificacionAbc"],
    proveedorPreferidoId: asString(item.proveedorPreferidoId),
    tiempoEntregaProveedorDias: Number(item.tiempoEntregaProveedorDias ?? 1),
    activo: Boolean(item.activo ?? true),
    estadoStock: asString(item.estadoStock, "DISPONIBLE"),
    categoriaId: asString(item.categoriaId) || undefined,
    categoriaNombre: asString(item.categoriaNombre) || undefined,
  };
}

export function mapInventoryItems(value: unknown): InventarioItem[] {
  return toRecordArray(value).map(mapInventoryItem);
}

export function mapAlert(item: Record<string, unknown>, index: number): Alerta {
  return {
    id: asString(item.id, `alerta-${index}`),
    titulo: asString(item.itemInventarioNombre || item.titulo || item.mensaje, "Alerta"),
    descripcion: asString(item.mensaje || item.descripcion || item.detalle, "Sin detalle"),
    severidad: asString(item.severidad, "INFO") as Alerta["severidad"],
    leida: Boolean(item.atendida ?? item.leida ?? false)
  };
}

export function mapAlerts(value: unknown): Alerta[] {
  return toRecordArray(value).map(mapAlert);
}

export function mapPrediction(item: Record<string, unknown>, index: number): Prediccion {
  return {
    id: asString(item.id, `pred-${index}`),
    itemId: asString(item.itemInventarioId),
    item: asString(item.itemInventarioNombre || item.item || item.nombreItem, `Item ${index + 1}`),
    consumoPromedioDiario: Number(item.consumoPromedioDiario ?? 0),
    diasHastaAgotamiento: Number(item.diasHastaAgotamiento ?? 0),
    cantidadSugeridaCompra: Number(item.cantidadSugeridaCompra ?? 0),
    nivelRiesgo: asString(item.nivelRiesgo, "BAJO") as Prediccion["nivelRiesgo"],
    confianza: Number(item.confianza ?? 0),
    motivo: asString(item.motivo)
  };
}

export function mapPredictions(value: unknown): Prediccion[] {
  return toRecordArray(value).map(mapPrediction);
}

export function mapSalesDetail(value: unknown): VentaDiaria[] {
  return toRecordArray(value).map((item) => ({
    fecha: asString(item.fecha),
    monto: Number(item.monto ?? 0),
    transacciones: Number(item.transacciones ?? 0)
  }));
}

export function mapPaymentMix(value: unknown): VentaMetodo[] {
  return toRecordArray(value).map((item, index) => ({
    name: asString(item.metodoPago, `Metodo ${index + 1}`),
    value: Number(item.montoTotal ?? 0),
    transacciones: Number(item.transacciones ?? 0)
  }));
}

export function mapTopProducts(value: unknown): ProductoVendido[] {
  return toRecordArray(value).map((item, index) => ({
    productoId: asString(item.productoId, `producto-${index}`),
    nombreProducto: asString(item.nombreProducto, `Producto ${index + 1}`),
    cantidadVendida: Number(item.cantidadVendida ?? 0),
    ingresos: Number(item.ingresos ?? 0)
  }));
}

export function mapConsumptionPrediction(value: unknown): ConsumoVsPrediccion[] {
  return toRecordArray(value).map((item, index) => ({
    itemInventarioId: asString(item.itemInventarioId, `item-${index}`),
    nombreItem: asString(item.nombreItem, `Item ${index + 1}`),
    consumoReal: Number(item.consumoReal ?? 0),
    consumoPredicho: Number(item.consumoPredicho ?? 0),
    diferencia: Number(item.diferencia ?? 0),
    desviacionPorcentual: Number(item.desviacionPorcentual ?? 0),
    nivelRiesgo: asString(item.nivelRiesgo, "BAJO"),
    confianzaPrediccion: Number(item.confianzaPrediccion ?? 0)
  }));
}
