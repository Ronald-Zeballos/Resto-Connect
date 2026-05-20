import { create } from "zustand";
import type { Role } from "../../types";
import { login } from "../http/httpClient";

type Session = {
  token: string | null;
  role: Role;
  name: string;
  demo: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
};

function readStoredSession() {
  const storedToken = localStorage.getItem("restoconnect-token");
  const storedDemo = localStorage.getItem("restoconnect-demo") === "true";

  if (storedDemo || storedToken?.startsWith("demo-")) {
    localStorage.removeItem("restoconnect-token");
    localStorage.removeItem("restoconnect-role");
    localStorage.removeItem("restoconnect-name");
    localStorage.removeItem("restoconnect-demo");
    return { token: null, role: "ADMIN" as Role, name: "" };
  }

  return {
    token: storedToken,
    role: (localStorage.getItem("restoconnect-role") as Role) || "ADMIN",
    name: localStorage.getItem("restoconnect-name") || "Administrador General"
  };
}

function roleFromUsername(username: string): Role {
  if (username === "cocina") return "COCINA";
  if (username === "mesero") return "MESERO";
  return "ADMIN";
}

const storedSession = readStoredSession();

export const useSession = create<Session>((set) => ({
  token: storedSession.token,
  role: storedSession.role,
  name: storedSession.name,
  demo: false,
  async signIn(username, password) {
    const response = await login(username, password);
    const token = response.token || response.accessToken || "api-session";
    const role = (response.rol || response.role || roleFromUsername(username)) as Role;
    const name = response.nombre || (role === "COCINA" ? "Cocinero Principal" : role === "MESERO" ? "Mesero Principal" : "Administrador General");
    localStorage.setItem("restoconnect-token", token);
    localStorage.setItem("restoconnect-role", role);
    localStorage.setItem("restoconnect-name", name);
    localStorage.setItem("restoconnect-demo", "false");
    set({ token, role, name, demo: false });
  },
  signOut() {
    localStorage.removeItem("restoconnect-token");
    localStorage.removeItem("restoconnect-role");
    localStorage.removeItem("restoconnect-name");
    localStorage.removeItem("restoconnect-demo");
    set({ token: null, role: "ADMIN", name: "", demo: false });
  }
}));
