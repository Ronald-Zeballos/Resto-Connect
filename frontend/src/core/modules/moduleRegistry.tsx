import { lazy } from "react";
import type { AppModule, ModuleId } from "./module.types";
import { moduleCatalog } from "./moduleCatalog";

const components: Record<ModuleId, AppModule["component"]> = {
  dashboard: lazy(() => import("../../modules/dashboard/interface/DashboardPage").then((module) => ({ default: module.DashboardPage }))),
  mesas: lazy(() => import("../../modules/mesas/interface/MesasPage").then((module) => ({ default: module.MesasPage }))),
  menu: lazy(() => import("../../modules/menu/interface/MenuPage").then((module) => ({ default: module.MenuPage }))),
  pedidos: lazy(() => import("../../modules/pedidos/interface/PedidosPage").then((module) => ({ default: module.PedidosPage }))),
  cocina: lazy(() => import("../../modules/cocina/interface/CocinaPage").then((module) => ({ default: module.CocinaPage }))),
  pagos: lazy(() => import("../../modules/pagos/interface/PagosPage").then((module) => ({ default: module.PagosPage }))),
  inventario: lazy(() => import("../../modules/inventario/interface/InventarioPage").then((module) => ({ default: module.InventarioPage }))),
  compras: lazy(() => import("../../modules/compras/interface/ComprasPage").then((module) => ({ default: module.ComprasPage }))),
  incidencias: lazy(() => import("../../modules/incidencias/interface/IncidenciasPage").then((module) => ({ default: module.IncidenciasPage }))),
  reportes: lazy(() => import("../../modules/reportes/interface/ReportesPage").then((module) => ({ default: module.ReportesPage }))),
  configuracion: lazy(() => import("../../modules/configuracion/interface/ConfiguracionPage").then((module) => ({ default: module.ConfiguracionPage })))
};

export const moduleRegistry: AppModule[] = moduleCatalog.map((moduleMeta) => ({
  ...moduleMeta,
  component: components[moduleMeta.id]
}));
