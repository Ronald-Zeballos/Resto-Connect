import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { Role } from "../../types";

export type ModuleId =
  | "dashboard"
  | "mesas"
  | "menu"
  | "productos"
  | "recetas"
  | "pedidos"
  | "cocina"
  | "pagos"
  | "caja"
  | "inventario"
  | "compras"
  | "proveedores"
  | "clientes"
  | "personal"
  | "contabilidad"
  | "incidencias"
  | "reportes"
  | "configuracion";

export type ModuleGroup = "general" | "salon" | "cocina" | "inventario" | "caja" | "clientes" | "contabilidad" | "sistema";

export type ModuleMeta = {
  id: ModuleId;
  path: string;
  navLabel: string;
  title: string;
  description: string;
  port: string;
  summary: string;
  roles: Role[];
  icon: LucideIcon;
  group: ModuleGroup;
};

export type AppModule = ModuleMeta & {
  component: ComponentType;
};
