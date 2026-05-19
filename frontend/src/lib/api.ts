const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("restoconnect-token");
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new ApiError(text || `Error ${response.status}`, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function login(username: string, password: string) {
  return apiFetch<{ token?: string; accessToken?: string; rol?: string; role?: string; nombre?: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export const api = {
  mesas: () => apiFetch<unknown[]>("/api/mesas"),
  mapaMesas: () => apiFetch<unknown[]>("/api/mesas/mapa"),
  productos: () => apiFetch<unknown[]>("/api/menu/productos"),
  categorias: () => apiFetch<unknown[]>("/api/menu/categorias"),
  pedidosCocina: () => apiFetch<unknown[]>("/api/pedidos/cocina/pendientes"),
  pedidosPendientes: () => apiFetch<unknown[]>("/api/pedidos/pendientes"),
  inventario: () => apiFetch<unknown[]>("/api/inventario/items"),
  stock: () => apiFetch<unknown[]>("/api/inventario/stock"),
  alertas: () => apiFetch<unknown[]>("/api/inventario/alertas"),
  predicciones: () => apiFetch<unknown[]>("/api/inventario/prediccion"),
  ordenes: () => apiFetch<unknown[]>("/api/compras/ordenes"),
  incidencias: () => apiFetch<unknown[]>("/api/incidencias"),
  configuracion: () => apiFetch<unknown>("/api/configuracion/restaurante")
};

export function connectNotifications(onMessage: (message: string) => void) {
  const token = localStorage.getItem("restoconnect-token");
  const url = new URL(`${API_URL}/api/notificaciones/stream`);
  if (token) url.searchParams.set("token", token);
  const source = new EventSource(url);
  source.onmessage = (event) => onMessage(event.data);
  return () => source.close();
}
