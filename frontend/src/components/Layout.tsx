import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Bell, ChefHat, ClipboardList, CreditCard, Home, LogOut, Package, ReceiptText, Settings, ShoppingCart, Table2, Utensils } from "lucide-react";
import { useAuth } from "../lib/auth";

const nav = [
  { to: "/", label: "Dashboard", icon: Home, roles: ["ADMIN", "MESERO"] },
  { to: "/mesas", label: "Mesas", icon: Table2, roles: ["ADMIN", "MESERO"] },
  { to: "/menu", label: "Menu", icon: Utensils, roles: ["ADMIN", "MESERO"] },
  { to: "/pedidos", label: "Pedidos", icon: ShoppingCart, roles: ["ADMIN", "MESERO"] },
  { to: "/cocina", label: "Cocina", icon: ChefHat, roles: ["ADMIN", "COCINA"] },
  { to: "/pagos", label: "Pagos", icon: CreditCard, roles: ["ADMIN", "MESERO"] },
  { to: "/inventario", label: "Inventario", icon: Package, roles: ["ADMIN"] },
  { to: "/compras", label: "Prediccion y compras", icon: ClipboardList, roles: ["ADMIN"] },
  { to: "/incidencias", label: "Incidencias", icon: Bell, roles: ["ADMIN", "MESERO", "COCINA"] },
  { to: "/reportes", label: "Reportes", icon: BarChart3, roles: ["ADMIN"] },
  { to: "/configuracion", label: "Configuracion", icon: Settings, roles: ["ADMIN"] }
];

export function Layout() {
  const { role, name, demo, signOut } = useAuth();
  const navigate = useNavigate();
  const links = nav.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[276px_1fr]">
      <aside className="border-b border-stone-200 bg-ink text-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 p-4 lg:block lg:p-6">
          <div>
            <p className="text-lg font-black">RestoConnect Pro</p>
            <p className="text-xs font-semibold text-white/60">{role} {demo ? " · Demo" : ""}</p>
          </div>
          <button className="btn bg-white/10 text-white lg:hidden" onClick={() => { signOut(); navigate("/login"); }}>
            <LogOut size={16} />
          </button>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1 lg:overflow-visible lg:px-4">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-w-max items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition ${
                    isActive ? "bg-white text-ink" : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="hidden p-4 lg:block">
          <div className="rounded-lg bg-white/8 p-4">
            <p className="text-sm font-bold">{name}</p>
            <p className="mt-1 text-xs text-white/55">Sesion operativa</p>
            <button className="btn mt-4 w-full bg-white/10 text-white hover:bg-white/15" onClick={() => { signOut(); navigate("/login"); }}>
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
