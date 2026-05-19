export type Role = "ADMIN" | "MESERO" | "COCINA" | "CLIENTE_QR";

export type MesaEstado = "LIBRE" | "OCUPADA" | "BLOQUEADA" | "INACTIVA";

export type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  activo: boolean;
  disponible: boolean;
  imagenUrl: string;
};

export type Mesa = {
  id: string;
  numero: number;
  estado: MesaEstado;
  codigoQr?: string;
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
};

export type Pedido = {
  id: string;
  mesaNumero: number;
  estado: string;
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
  item: string;
  consumoPromedioDiario: number;
  diasHastaAgotamiento: number;
  cantidadSugeridaCompra: number;
  nivelRiesgo: "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
  confianza: number;
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
