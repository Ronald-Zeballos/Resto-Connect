export type Role = "ADMIN" | "MESERO" | "COCINA" | "CLIENTE_QR";

export type MesaEstado = "LIBRE" | "OCUPADA" | "RESERVADA" | "BLOQUEADA" | "INACTIVA";

export type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId?: string;
  categoria: string;
  activo: boolean;
  disponible: boolean;
  imagenUrl: string;
};

export type Categoria = {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
};

export type Mesa = {
  id: string;
  numero: number;
  estado: MesaEstado;
  codigoQr: string;
};

export type InventarioItem = {
  id: string;
  nombre: string;
  descripcion: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  puntoReorden: number;
  costoUnitario: number;
  clasificacionAbc: "ALTA" | "MEDIA" | "BAJA";
  proveedorPreferidoId?: string;
  tiempoEntregaProveedorDias?: number;
  activo?: boolean;
  estadoStock?: string;
};

export type Pedido = {
  id: string;
  mesaNumero: number;
  estado: string;
  metodoPago?: string;
  total: number;
  minutos: number;
  items: Array<{ producto: string; cantidad: number }>;
};

export type Alerta = {
  id: string;
  titulo: string;
  descripcion: string;
  severidad: "INFO" | "ADVERTENCIA" | "CRITICA";
  leida?: boolean;
};

export type Prediccion = {
  id: string;
  itemId?: string;
  item: string;
  consumoPromedioDiario: number;
  diasHastaAgotamiento: number;
  cantidadSugeridaCompra: number;
  nivelRiesgo: "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
  confianza: number;
  motivo?: string;
};

export type OrdenCompra = {
  id: string;
  proveedor: string;
  estado: "BORRADOR" | "APROBADA" | "RECIBIDA";
  total: number;
  fecha: string;
};

export type Incidencia = {
  id: string;
  titulo: string;
  categoria: string;
  prioridad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
  estado: "ABIERTA" | "EN_PROCESO" | "RESUELTA";
};

export type VentaDiaria = {
  fecha: string;
  monto: number;
  transacciones: number;
};

export type VentaMetodo = {
  name: string;
  value: number;
  transacciones: number;
};

export type ProductoVendido = {
  productoId: string;
  nombreProducto: string;
  cantidadVendida: number;
  ingresos: number;
};

export type ConsumoVsPrediccion = {
  itemInventarioId: string;
  nombreItem: string;
  consumoReal: number;
  consumoPredicho: number;
  diferencia: number;
  desviacionPorcentual: number;
  nivelRiesgo: string;
  confianzaPrediccion: number;
};
