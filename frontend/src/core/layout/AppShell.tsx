import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useSession } from "../auth/sessionStore";
import { moduleRegistry } from "../modules/moduleRegistry";

export function AppShell() {
  const { role, name, signOut } = useSession();
  const navigate = useNavigate();
  const links = moduleRegistry.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-oatmeal">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(47,111,78,0.16),_transparent_48%),radial-gradient(circle_at_top_right,_rgba(199,68,47,0.14),_transparent_36%)]" />
      <div className="relative lg:grid lg:grid-cols-[300px_1fr]">
        <aside className="border-b border-stone-200/70 bg-ink text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:bg-ink/98">
          <div className="flex items-center justify-between gap-3 p-5 lg:block lg:p-7">
            <div>
              <p className="text-2xl font-black tracking-tight">RestoConnect</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">Operacion del restaurante</p>
            </div>
            <button className="btn bg-white/10 text-white lg:hidden" onClick={() => { signOut(); navigate("/login"); }}>
              <LogOut size={16} />
            </button>
          </div>

          <div className="px-4 pb-4 lg:px-5">
            <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
              <p className="text-sm font-bold">{name}</p>
              <p className="mt-2 text-xs text-white/60">{role} | Datos en linea</p>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-3 pb-5 lg:block lg:space-y-2 lg:overflow-visible lg:px-5">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `group flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      isActive ? "bg-white text-ink shadow-soft" : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <span className="rounded-xl bg-white/10 p-2 text-current">
                    <Icon size={18} />
                  </span>
                  <span>{item.navLabel}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="hidden p-5 pt-0 lg:block">
            <button className="btn w-full rounded-2xl bg-white/10 py-3 text-white hover:bg-white/15" onClick={() => { signOut(); navigate("/login"); }}>
              <LogOut size={16} />
              Cerrar sesion
            </button>
          </div>
        </aside>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
