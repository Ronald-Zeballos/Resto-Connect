import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ChefHat, KeyRound } from "lucide-react";
import { useAuth } from "../lib/auth";
import type { Role } from "../types";

export function Login() {
  const { token, signIn, quickDemo } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    await signIn(username, password);
    setLoading(false);
    navigate("/");
  }

  function access(role: Role, user: string, pass: string) {
    setUsername(user);
    setPassword(pass);
    quickDemo(role);
    navigate("/");
  }

  return (
    <main className="grid min-h-screen bg-cream lg:grid-cols-[1fr_520px]">
      <section className="relative hidden overflow-hidden lg:block">
        <img className="h-full w-full object-cover" src="/images/restaurant-hero.jpg" alt="" />
        <div className="absolute inset-0 bg-ink/35" />
        <div className="absolute bottom-12 left-12 max-w-xl text-white">
          <p className="mb-4 inline-flex rounded-md bg-white/15 px-3 py-2 text-sm font-bold backdrop-blur">Operacion gastronomica</p>
          <h1 className="text-5xl font-black">RestoConnect Pro</h1>
          <p className="mt-4 text-lg text-white/82">Mesas, cocina, inventario inteligente, compras y reportes en una sola consola.</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-5">
        <form className="card w-full max-w-md p-6" onSubmit={submit}>
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-lg bg-herb p-3 text-white"><ChefHat size={24} /></div>
            <div>
              <h1 className="text-2xl font-black">RestoConnect Pro</h1>
              <p className="text-sm text-stone-500">Ingreso operativo</p>
            </div>
          </div>
          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-bold">Usuario</span>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className="mb-5 block">
            <span className="mb-1 block text-sm font-bold">Password</span>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button className="btn-primary w-full" disabled={loading}>
            <KeyRound size={17} />
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <button type="button" className="btn-secondary" onClick={() => access("ADMIN", "admin", "admin123")}>Admin</button>
            <button type="button" className="btn-secondary" onClick={() => access("MESERO", "mesero", "mesero123")}>Mesero</button>
            <button type="button" className="btn-secondary" onClick={() => access("COCINA", "cocina", "cocina123")}>Cocina</button>
          </div>
        </form>
      </section>
    </main>
  );
}
