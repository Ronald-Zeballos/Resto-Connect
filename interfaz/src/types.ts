export type Role = "ADMIN" | "GERENTE" | "CAJERO" | "COCINA" | "INVENTARIO" | "CONTADOR" | "MESERO" | "CLIENTE_QR";
export type TipoServicio = "PARA_COMER" | "PARA_LLEVAR";

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
  codigoInterno?: string;
  costo?: number;
  esVenta?: boolean;
  esInsumo?: boolean;
  impuestoAplicable?: number;
  unidadMedida?: string;
  receta?: RecetaItem[];
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
  costoPromedioPonderado?: number;
  clasificacionAbc: "ALTA" | "MEDIA" | "BAJA";
  proveedorPreferidoId?: string;
  tiempoEntregaProveedorDias?: number;
  activo?: boolean;
  estadoStock?: string;
  categoriaId?: string;
  categoriaNombre?: string;
};

export type CategoriaInventario = {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
};

export type LoteInventario = {
  id: string;
  itemInventarioId: string;
  itemInventarioNombre: string;
  codigoLote: string;
  cantidadInicial: number;
  cantidadRestante: number;
  fechaVencimiento?: string;
  fechaIngreso: string;
  costoUnitario: number;
  activo: boolean;
  estado: string;
};

export type ConteoFisico = {
  id: string;
  fechaConteo: string;
  numeroConteo: number;
  estado: string;
  observaciones?: string;
  usuarioNombre?: string;
  totalItemsContados: number;
  totalDiferencias: number;
  totalAjusteValor: number;
};

export type DetalleConteo = {
  id: string;
  conteoId: string;
  itemInventarioId: string;
  itemInventarioNombre: string;
  cantidadSistema: number;
  cantidadFisica: number;
  diferencia: number;
  costoUnitario: number;
  ajusteValor: number;
  observaciones?: string;
};

export type CierreCaja = {
  id: string;
  fechaApertura: string;
  fechaCierre?: string;
  estado: string;
  usuarioAperturaNombre: string;
  usuarioCierreNombre?: string;
  saldoInicial: number;
  saldoEsperado?: number;
  saldoRealDeclarado?: number;
  diferencia?: number;
  observaciones?: string;
  detallePagos?: string;
  totalPedidos: number;
  totalVentas: number;
  totalImpuesto: number;
  totalPropinas: number;
  totalDescuentos: number;
  totalGastos: number;
};

export type CajaGasto = {
  id: string;
  cierreCajaId: string;
  descripcion: string;
  categoriaGasto: string;
  monto: number;
  metodoPago: string;
  comprobante?: string;
};

export type Pedido = {
  id: string;
  mesaNumero: number;
  estado: string;
  metodoPago?: string;
  tipoServicio?: TipoServicio;
  total: number;
  minutos: number;
  items: Array<{ productId?: string; producto: string; cantidad: number; precioUnitario?: number; subtotal?: number }>;
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

export type RecetaItem = {
  id?: string;
  itemInventarioId: string;
  itemInventarioNombre: string;
  cantidadNecesaria: number;
  unidadMedida: string;
};

export type Cliente = {
  id: string;
  nombre: string;
  nitCi?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  tipoDocumento?: string;
  activo: boolean;
};

export type ProveedorFull = {
  id: string;
  nombre: string;
  nit: string;
  telefono: string;
  email: string;
  direccion: string;
  activo: boolean;
  personaContacto?: string;
  paginaWeb?: string;
};

export type Personal = {
  id: string;
  nombre: string;
  username: string;
  rol: string;
  activo: boolean;
};

export type CuentaPagar = {
  id: string;
  proveedorId?: string;
  proveedorNombre?: string;
  ordenCompraId?: string;
  montoOriginal: number;
  saldoPendiente: number;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: string;
  descripcion?: string;
  numeroComprobante?: string;
  fechaUltimoPago?: string;
};

export type CuentaCobrar = {
  id: string;
  clienteId?: string;
  clienteNombre?: string;
  pedidoId?: string;
  montoOriginal: number;
  saldoPendiente: number;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: string;
  descripcion?: string;
  fechaUltimoCobro?: string;
};

export type ContabilidadGasto = {
  id: string;
  fechaGasto: string;
  descripcion: string;
  categoriaGasto: string;
  monto: number;
  metodoPago?: string;
  comprobante?: string;
  proveedorId?: string;
  proveedorNombre?: string;
  observaciones?: string;
};

export type ContabilidadIngreso = {
  id: string;
  fechaIngreso: string;
  descripcion: string;
  categoriaIngreso: string;
  monto: number;
  metodoPago?: string;
  comprobante?: string;
  clienteId?: string;
  clienteNombre?: string;
  observaciones?: string;
};
