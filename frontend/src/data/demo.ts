import type { Alerta, Incidencia, InventarioItem, Mesa, OrdenCompra, Pedido, Prediccion, Producto } from "../types";

export const imageForProduct: Record<string, string> = {
  "Hamburguesa simple": "/images/burger-simple.jpg",
  "Hamburguesa con queso": "/images/burger-cheese.jpg",
  "Papas fritas": "/images/fries.jpg",
  "Pollo crispy": "/images/crispy-chicken.jpg",
  "Taco de pollo": "/images/chicken-taco.jpg",
  "Taco de carne": "/images/beef-taco.jpg",
  "Ensalada fresca": "/images/fresh-salad.jpg",
  "Combo burger": "/images/burger-double.jpg",
  "Refresco regular": "/images/soda.jpg",
  "Hamburguesa doble": "/images/burger-double.jpg"
};

export const demoProductos: Producto[] = [
  ["1", "Hamburguesa simple", "Clasica con vegetales frescos", 18, "Hamburguesas"],
  ["2", "Hamburguesa con queso", "Clasica con cheddar", 20, "Hamburguesas"],
  ["3", "Papas fritas", "Papas crocantes de la casa", 9, "Acompanamientos"],
  ["4", "Pollo crispy", "Pollo dorado con toque casero", 19, "Acompanamientos"],
  ["5", "Taco de pollo", "Taco con pollo y vegetales", 16, "Tacos y wraps"],
  ["6", "Taco de carne", "Taco de carne jugosa", 17, "Tacos y wraps"],
  ["7", "Ensalada fresca", "Hojas verdes, tomate y queso", 12, "Acompanamientos"],
  ["8", "Combo burger", "Hamburguesa con queso y papas", 28, "Hamburguesas"],
  ["9", "Refresco regular", "Bebida fria individual", 6, "Bebidas"],
  ["10", "Hamburguesa doble", "Doble porcion de carne", 24, "Hamburguesas"]
].map(([id, nombre, descripcion, precio, categoria]) => ({
  id: String(id),
  nombre: String(nombre),
  descripcion: String(descripcion),
  precio: Number(precio),
  categoria: String(categoria),
  activo: true,
  disponible: true,
  imagenUrl: imageForProduct[String(nombre)] ?? "/images/restaurant-hero.jpg"
}));

export const demoMesas: Mesa[] = [
  { id: "201", numero: 1, estado: "LIBRE", codigoQr: "mesa-1-seed" },
  { id: "202", numero: 2, estado: "OCUPADA", codigoQr: "mesa-2-seed" },
  { id: "203", numero: 3, estado: "LIBRE", codigoQr: "mesa-3-seed" },
  { id: "204", numero: 4, estado: "BLOQUEADA", codigoQr: "mesa-4-seed" },
  { id: "205", numero: 5, estado: "OCUPADA", codigoQr: "mesa-5-seed" }
];

export const demoInventario: InventarioItem[] = [
  ["401", "Pan hamburguesa", "Pan brioche para hamburguesa", "UNIDAD", 80, 20, 120, 30, 0.6, "ALTA"],
  ["402", "Carne hamburguesa", "Carne de res porcionada", "UNIDAD", 60, 15, 90, 25, 2.1, "ALTA"],
  ["403", "Lechuga fresca", "Lechuga para ensaladas", "GRAMO", 3000, 600, 5000, 900, 0.01, "MEDIA"],
  ["404", "Queso laminado", "Queso cheddar laminado", "UNIDAD", 90, 20, 140, 30, 0.45, "ALTA"],
  ["405", "Papas congeladas", "Papas para freir", "KG", 35, 8, 60, 12, 1.9, "ALTA"],
  ["406", "Aceite vegetal", "Aceite para freidora", "LITRO", 25, 5, 40, 8, 2.8, "MEDIA"],
  ["407", "Pollo marinado", "Pollo para plancha", "UNIDAD", 50, 10, 80, 18, 2.4, "ALTA"],
  ["408", "Tortilla de trigo", "Tortilla para tacos", "UNIDAD", 100, 25, 160, 35, 0.35, "MEDIA"],
  ["409", "Tomate", "Tomate fresco", "GRAMO", 2400, 500, 4000, 800, 0.01, "MEDIA"],
  ["410", "Jarabe gaseosa", "Base para refresco", "LITRO", 18, 4, 30, 6, 3.1, "BAJA"]
].map(([id, nombre, descripcion, unidadMedida, stockActual, stockMinimo, stockMaximo, puntoReorden, costoUnitario, clasificacionAbc]) => ({
  id: String(id),
  nombre: String(nombre),
  descripcion: String(descripcion),
  unidadMedida: String(unidadMedida),
  stockActual: Number(stockActual),
  stockMinimo: Number(stockMinimo),
  stockMaximo: Number(stockMaximo),
  puntoReorden: Number(puntoReorden),
  costoUnitario: Number(costoUnitario),
  clasificacionAbc: clasificacionAbc as InventarioItem["clasificacionAbc"]
}));

export const demoPedidos: Pedido[] = [
  { id: "p-1001", mesaNumero: 2, estado: "PENDIENTE", total: 66, minutos: 8, items: [{ producto: "Combo burger", cantidad: 2 }, { producto: "Refresco regular", cantidad: 2 }] },
  { id: "p-1002", mesaNumero: 5, estado: "EN_PREPARACION", total: 41, minutos: 15, items: [{ producto: "Taco de carne", cantidad: 1 }, { producto: "Pollo crispy", cantidad: 1 }] },
  { id: "p-1003", mesaNumero: 1, estado: "LISTO", total: 29, minutos: 22, items: [{ producto: "Hamburguesa con queso", cantidad: 1 }, { producto: "Papas fritas", cantidad: 1 }] }
];

export const demoAlertas: Alerta[] = [
  { id: "a1", titulo: "Stock bajo: Jarabe gaseosa", descripcion: "Quedan 18 litros, revisar punto de reorden.", severidad: "ADVERTENCIA" },
  { id: "a2", titulo: "QR mesa 4 desgastado", descripcion: "Incidencia abierta por mesero principal.", severidad: "INFO" },
  { id: "a3", titulo: "Prediccion disponible", descripcion: "3 insumos requieren compra sugerida.", severidad: "CRITICA" }
];

export const demoPredicciones: Prediccion[] = [
  { id: "pr1", item: "Pan hamburguesa", consumoPromedioDiario: 5.5, diasHastaAgotamiento: 14.5, cantidadSugeridaCompra: 0, nivelRiesgo: "BAJO", confianza: 78 },
  { id: "pr2", item: "Carne hamburguesa", consumoPromedioDiario: 6.5, diasHastaAgotamiento: 9.2, cantidadSugeridaCompra: 22, nivelRiesgo: "MEDIO", confianza: 82 },
  { id: "pr3", item: "Jarabe gaseosa", consumoPromedioDiario: 1.2, diasHastaAgotamiento: 5.8, cantidadSugeridaCompra: 12, nivelRiesgo: "ALTO", confianza: 74 }
];

export const demoOrdenes: OrdenCompra[] = [
  { id: "oc1", proveedor: "Distribuidora Andina", estado: "BORRADOR", total: 248.5, fecha: "2026-05-11" },
  { id: "oc2", proveedor: "Abastos del Sur", estado: "APROBADA", total: 164.2, fecha: "2026-05-10" }
];

export const demoIncidencias: Incidencia[] = [
  { id: "i1", titulo: "Mesa con QR desgastado", categoria: "MESA", prioridad: "MEDIA", estado: "ABIERTA" },
  { id: "i2", titulo: "Freidora requiere revision", categoria: "COCINA", prioridad: "ALTA", estado: "EN_PROCESO" }
];

export const salesData = [
  { dia: "Lun", ventas: 880 },
  { dia: "Mar", ventas: 1240 },
  { dia: "Mie", ventas: 980 },
  { dia: "Jue", ventas: 1460 },
  { dia: "Vie", ventas: 1920 },
  { dia: "Sab", ventas: 2340 },
  { dia: "Dom", ventas: 1680 }
];
