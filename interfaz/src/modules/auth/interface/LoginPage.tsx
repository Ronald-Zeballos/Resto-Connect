import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ChefHat, KeyRound } from "lucide-react";
import { useSession } from "../../../core/auth/sessionStore";
import { SafeImage } from "../../../shared/ui/primitives";

export function LoginPage() {
  const { token, signIn } = useSession();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (token) return <Navigate to="/" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(username, password);
      navigate("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  }

  async function access(user: string, pass: string) {
    setUsername(user);
    setPassword(pass);
    setLoading(true);
    setError("");
    try {
      await signIn(user, pass);
      navigate("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-oatmeal lg:grid-cols-[1.1fr_520px]">
      <section className="relative hidden overflow-hidden lg:block">
        <SafeImage className="h-full w-full object-cover" src="/images/restaurant-hero.png" alt="" />
        <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(20,24,27,0.35),rgba(20,24,27,0.72))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(210,178,74,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(47,111,78,0.3),transparent_32%)]" />
        <div className="absolute bottom-12 left-12 max-w-xl text-white">
          <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] backdrop-blur">Gestión integral para restaurantes</p>
          <h1 className="text-5xl font-black tracking-tight">RestoConnect Pro</h1>
          <p className="mt-4 text-lg text-white/82">Controla mesas, carta, inventario, ventas y compras desde una sola plataforma pensada para la operación diaria.</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-5">
        <form className="card w-full max-w-md rounded-[2rem] p-7" onSubmit={submit}>
          <div className="mb-8 flex items-center gap-4">
            <div className="rounded-2xl bg-herb p-3 text-white shadow-soft"><ChefHat size={28} /></div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Ingreso al sistema</h1>
              <p className="mt-1 text-sm text-stone-500">Entra con tu perfil para continuar con la operación del turno.</p>
            </div>
          </div>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-stone-500">Usuario</span>
            <input className="input" value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-stone-500">Password</span>
            <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>

          <button className="btn-primary w-full rounded-2xl py-3" disabled={loading}>
            <KeyRound size={17} />
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
          {error ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <div className="mt-5 grid grid-cols-3 gap-2">
            <button type="button" className="btn-secondary rounded-2xl" onClick={() => access("admin", "admin123")}>Admin</button>
            <button type="button" className="btn-secondary rounded-2xl" onClick={() => access("mesero", "mesero123")}>Mesero</button>
            <button type="button" className="btn-secondary rounded-2xl" onClick={() => access("cocina", "cocina123")}>Cocina</button>
          </div>
        </form>
      </section>
    </main>
  );
}
