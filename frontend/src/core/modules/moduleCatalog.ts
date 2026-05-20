import { BarChart3, Bell, ChefHat, ClipboardList, CreditCard, Home, Package, Settings, ShoppingCart, Table2, Utensils } from "lucide-react";
import type { ModuleMeta } from "./module.types";

export const moduleCatalog: ModuleMeta[] = [
  {
    id: "dashboard",
    path: "/",
    navLabel: "Resumen",
    title: "Panorama del día",
    description: "Vista general de ventas, mesas, alertas y pedidos en curso.",
    port: "Resumen ejecutivo",
    summary: "Sigue el pulso del restaurante en un solo lugar.",
    roles: ["ADMIN", "MESERO", "COCINA"],
    icon: Home
  },
  {
    id: "mesas",
    path: "/mesas",
    navLabel: "Mesas",
    title: "Sala y mesas",
    description: "Gestiona la ocupación, los QR y la rotación de mesas.",
    port: "Atención en sala",
    summary: "Controla el salón y el acceso al menú por QR.",
    roles: ["ADMIN", "MESERO"],
    icon: Table2
  },
  {
    id: "menu",
    path: "/menu",
    navLabel: "Menu",
    title: "Carta y precios",
    description: "Administra productos, categorías y disponibilidad comercial.",
    port: "Catálogo comercial",
    summary: "Mantiene la carta actualizada para sala y QR.",
    roles: ["ADMIN", "MESERO"],
    icon: Utensils
  },
  {
    id: "pedidos",
    path: "/pedidos",
    navLabel: "Pedidos",
    title: "Toma de pedidos",
    description: "Registra órdenes, arma carritos y envía pedidos a operación.",
    port: "Servicio en mesa",
    summary: "Conecta productos, mesas y atención del turno.",
    roles: ["ADMIN", "MESERO"],
    icon: ShoppingCart
  },
  {
    id: "cocina",
    path: "/cocina",
    navLabel: "Cocina",
    title: "Producción",
    description: "Visualiza y mueve pedidos entre estados de preparación.",
    port: "Cola de cocina",
    summary: "Organiza la salida de platos del turno.",
    roles: ["ADMIN", "COCINA"],
    icon: ChefHat
  },
  {
    id: "pagos",
    path: "/pagos",
    navLabel: "Pagos",
    title: "Cobros",
    description: "Gestiona caja, métodos de pago y emisión de factura.",
    port: "Caja y facturación",
    summary: "Prepara el cierre del pedido y el comprobante.",
    roles: ["ADMIN", "MESERO"],
    icon: CreditCard
  },
  {
    id: "inventario",
    path: "/inventario",
    navLabel: "Inventario",
    title: "Inventario",
    description: "Controla stock, alertas y consumo de insumos.",
    port: "Control de existencias",
    summary: "Cuida el stock y anticipa faltantes.",
    roles: ["ADMIN"],
    icon: Package
  },
  {
    id: "compras",
    path: "/compras",
    navLabel: "Compras",
    title: "Compras y reposición",
    description: "Trabaja con pronósticos y órdenes de compra sugeridas.",
    port: "Pronóstico y abastecimiento",
    summary: "Convierte el análisis en decisiones de compra.",
    roles: ["ADMIN"],
    icon: ClipboardList
  },
  {
    id: "incidencias",
    path: "/incidencias",
    navLabel: "Incidencias",
    title: "Novedades operativas",
    description: "Centraliza incidentes, tareas y seguimientos del turno.",
    port: "Seguimiento operativo",
    summary: "Ordena lo urgente y da visibilidad al equipo.",
    roles: ["ADMIN", "MESERO", "COCINA"],
    icon: Bell
  },
  {
    id: "reportes",
    path: "/reportes",
    navLabel: "Reportes",
    title: "Análisis del negocio",
    description: "Expone métricas de ventas, pagos e inventario.",
    port: "Ventas y rendimiento",
    summary: "Ayuda a decidir con datos del restaurante.",
    roles: ["ADMIN"],
    icon: BarChart3
  },
  {
    id: "configuracion",
    path: "/configuracion",
    navLabel: "Configuracion",
    title: "Ajustes del negocio",
    description: "Administra datos fiscales y operativos del restaurante.",
    port: "Configuración general",
    summary: "Reúne la información base del local.",
    roles: ["ADMIN"],
    icon: Settings
  }
];
