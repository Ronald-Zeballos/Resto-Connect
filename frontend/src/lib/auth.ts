import { create } from "zustand";
import type { Role } from "../types";
import { login } from "./api";

type Session = {
  token: string | null;
  role: Role;
  name: string;
  demo: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  quickDemo: (role: Role) => void;
  signOut: () => void;
};

function roleFromUsername(username: string): Role {
  if (username === "cocina") return "COCINA";
  if (username === "mesero") return "MESERO";
  return "ADMIN";
}

export const useAuth = create<Session>((set) => ({
  token: localStorage.getItem("restoconnect-token"),
  role: (localStorage.getItem("restoconnect-role") as Role) || "ADMIN",
  name: localStorage.getItem("restoconnect-name") || "Administrador General",
  demo: localStorage.getItem("restoconnect-demo") === "true",
  async signIn(username, password) {
    try {
      const response = await login(username, password);
      const token = response.token || response.accessToken || "api-session";
      const role = ((response.rol || response.role || roleFromUsername(username)) as Role);
      const name = response.nombre || (role === "COCINA" ? "Cocinero Principal" : role === "MESERO" ? "Mesero Principal" : "Administrador General");
      localStorage.setItem("restoconnect-token", token);
      localStorage.setItem("restoconnect-role", role);
      localStorage.setItem("restoconnect-name", name);
      localStorage.setItem("restoconnect-demo", "false");
      set({ token, role, name, demo: false });
    } catch {
      const role = roleFromUsername(username);
      const demoToken = `demo-${role.toLowerCase()}`;
      localStorage.setItem("restoconnect-token", demoToken);
      localStorage.setItem("restoconnect-role", role);
      localStorage.setItem("restoconnect-name", role === "COCINA" ? "Cocinero Principal" : role === "MESERO" ? "Mesero Principal" : "Administrador General");
      localStorage.setItem("restoconnect-demo", "true");
      set({ token: demoToken, role, name: localStorage.getItem("restoconnect-name") || "Demo", demo: true });
    }
  },
  quickDemo(role) {
    const token = `demo-${role.toLowerCase()}`;
    const name = role === "COCINA" ? "Cocinero Principal" : role === "MESERO" ? "Mesero Principal" : "Administrador General";
    localStorage.setItem("restoconnect-token", token);
    localStorage.setItem("restoconnect-role", role);
    localStorage.setItem("restoconnect-name", name);
    localStorage.setItem("restoconnect-demo", "true");
    set({ token, role, name, demo: true });
  },
  signOut() {
    localStorage.removeItem("restoconnect-token");
    localStorage.removeItem("restoconnect-role");
    localStorage.removeItem("restoconnect-name");
    localStorage.removeItem("restoconnect-demo");
    set({ token: null, role: "ADMIN", name: "", demo: false });
  }
}));
