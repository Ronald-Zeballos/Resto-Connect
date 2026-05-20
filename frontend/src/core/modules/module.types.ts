import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { Role } from "../../types";

export type ModuleId =
  | "dashboard"
  | "mesas"
  | "menu"
  | "pedidos"
  | "cocina"
  | "pagos"
  | "inventario"
  | "compras"
  | "incidencias"
  | "reportes"
  | "configuracion";

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
};

export type AppModule = ModuleMeta & {
  component: ComponentType;
};
