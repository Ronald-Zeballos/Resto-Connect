function resolveApiUrl() {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (typeof window === "undefined") {
    return "http://localhost:8080";
  }

  const saved = window.localStorage.getItem("restoconnect-api-url")?.trim();
  if (saved) {
    return saved.replace(/\/+$/, "");
  }

  const { protocol, hostname, port } = window.location;
  const inferredPort = port === "4173" || port === "4174" ? "18080" : "8080";
  return `${protocol}//${hostname}:${inferredPort}`;
}

const API_URL = resolveApiUrl();

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

function buildHeaders(options: RequestInit = {}, token?: string | null) {
  const headers = new Headers(options.headers);
  const hasJsonBody = options.body !== undefined && options.body !== null && !(options.body instanceof FormData);
  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("restoconnect-token");
  return apiFetchWithToken(path, token, options);
}

export async function apiFetchWithToken<T>(path: string, token: string | null, options: RequestInit = {}): Promise<T> {
  const headers = buildHeaders(options, token);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    throw new ApiError(await extractErrorMessage(response), response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function extractErrorMessage(response: Response) {
  const text = await response.text().catch(() => "");
  if (!text) return `Error ${response.status}`;

  try {
    const payload = JSON.parse(text) as { error?: unknown; detalles?: Record<string, unknown> };
    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error.trim();
    }

    if (payload.detalles && typeof payload.detalles === "object") {
      const details = Object.values(payload.detalles)
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
      if (details.length) {
        return details.join(" ");
      }
    }
  } catch {
    return text;
  }

  return text;
}

export async function withDemoFallback<T>(loader: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    if (localStorage.getItem("restoconnect-demo") !== "true") {
      throw error;
    }
    return fallback();
  }
}

export function toRecordArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    : [];
}

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export async function login(username: string, password: string) {
  return apiFetch<{ token?: string; accessToken?: string; rol?: string; role?: string; nombre?: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

function toQueryString(params?: Record<string, string | number | undefined | null>) {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const api = {
  mesas: () => apiFetch<unknown[]>("/api/mesas"),
  mapaMesas: () => apiFetch<unknown[]>("/api/mesas/mapa"),
  cambiarEstadoMesa: (id: string, estado: string) => apiFetch<Record<string, unknown>>(`/api/mesas/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado })
  }),
  mesaPorQr: (codigoQr: string) => apiFetch<Record<string, unknown>>(`/api/mesas/qr/${encodeURIComponent(codigoQr)}`),
  productos: () => apiFetch<unknown[]>("/api/menu/productos"),
  categorias: () => apiFetch<unknown[]>("/api/menu/categorias"),
  actualizarProducto: (id: string, payload: Record<string, unknown>) => apiFetch<Record<string, unknown>>(`/api/menu/productos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  }),
  activarProducto: (id: string) => apiFetch<Record<string, unknown>>(`/api/menu/productos/${id}/activar`, { method: "PATCH" }),
  desactivarProducto: (id: string) => apiFetch<Record<string, unknown>>(`/api/menu/productos/${id}/desactivar`, { method: "PATCH" }),
  pedidosCocina: () => apiFetch<unknown[]>("/api/pedidos/cocina/pendientes"),
  pedidosPendientes: () => apiFetch<unknown[]>("/api/pedidos/pendientes"),
  validarPedido: (pedidoId: string) => apiFetch<Record<string, unknown>>(`/api/pedidos/${pedidoId}/validar`, {
    method: "PATCH"
  }),
  pedidoActivoMesa: (mesaId: string) => apiFetch<Record<string, unknown>>(`/api/pedidos/mesa/${mesaId}/activo`),
  crearPedido: (payload: Record<string, unknown>) => apiFetch<Record<string, unknown>>("/api/pedidos", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  obtenerPedido: (pedidoId: string) => apiFetch<Record<string, unknown>>(`/api/pedidos/${pedidoId}`),
  cambiarEstadoPedido: (pedidoId: string, estado: string) => apiFetch<Record<string, unknown>>(`/api/pedidos/${pedidoId}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado })
  }),
  pagarPasarela: (payload: Record<string, unknown>) => apiFetch<Record<string, unknown>>("/api/pagos/pasarela/simular", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  pagarEfectivo: (payload: Record<string, unknown>) => apiFetch<Record<string, unknown>>("/api/pagos/efectivo", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  cobrosQr: () => apiFetch<unknown[]>("/api/pagos/qr/cobrables"),
  generarPagoQr: (payload: Record<string, unknown>) => apiFetch<Record<string, unknown>>("/api/pagos/qr/generar", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  consultarPagoQr: (qrId: string) => apiFetch<Record<string, unknown>>(`/api/pagos/qr/${encodeURIComponent(qrId)}`),
  cancelarPagoQr: (qrId: string) => apiFetch<Record<string, unknown>>(`/api/pagos/qr/${encodeURIComponent(qrId)}`, {
    method: "DELETE"
  }),
  confirmarPagoQr: (qrId: string, payload: Record<string, unknown>) => apiFetch<Record<string, unknown>>(`/api/pagos/qr/${encodeURIComponent(qrId)}/confirmar`, {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  inventario: () => apiFetch<unknown[]>("/api/inventario/items"),
  stock: () => apiFetch<unknown[]>("/api/inventario/stock"),
  actualizarItemInventario: (id: string, payload: Record<string, unknown>) => apiFetch<Record<string, unknown>>(`/api/inventario/items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  }),
  registrarEntradaInventario: (payload: Record<string, unknown>) => apiFetch<Record<string, unknown>>("/api/inventario/movimientos/entrada", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  registrarSalidaInventario: (payload: Record<string, unknown>) => apiFetch<Record<string, unknown>>("/api/inventario/movimientos/salida", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  alertas: () => apiFetch<unknown[]>("/api/inventario/alertas"),
  atenderAlerta: (id: string) => apiFetch<Record<string, unknown>>(`/api/inventario/alertas/${id}/atendida`, { method: "PATCH" }),
  predicciones: () => apiFetch<unknown[]>("/api/inventario/prediccion"),
  generarPredicciones: () => apiFetch<unknown[]>("/api/inventario/prediccion/generar", { method: "POST" }),
  generarOrdenCompra: (prediccionId: string) => apiFetch<Record<string, unknown>>(`/api/inventario/prediccion/${prediccionId}/generar-orden-compra`, {
    method: "POST"
  }),
  ordenes: () => apiFetch<unknown[]>("/api/compras/ordenes"),
  incidencias: () => apiFetch<unknown[]>("/api/incidencias"),
  registrarIncidencia: (payload: Record<string, unknown>) => apiFetch<Record<string, unknown>>("/api/incidencias", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  actualizarEstadoIncidencia: (id: string, payload: Record<string, unknown>) => apiFetch<Record<string, unknown>>(`/api/incidencias/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  }),
  configuracion: () => apiFetch<Record<string, unknown>>("/api/configuracion/restaurante"),
  bancosQr: () => apiFetch<Array<Record<string, unknown>>>("/api/configuracion/restaurante/pagos-qr/bancos"),
  guardarConfiguracion: (payload: Record<string, unknown>) => apiFetch<Record<string, unknown>>("/api/configuracion/restaurante", {
    method: "PUT",
    body: JSON.stringify(payload)
  }),
  analizarConGrok: (payload: Record<string, unknown>) => apiFetch<Record<string, unknown>>("/api/ia/grok/analizar", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  ventasRango: (params?: Record<string, string | number | undefined | null>) => apiFetch<Record<string, unknown>>(`/api/reportes/ventas/rango${toQueryString(params)}`),
  ventasMetodos: (params?: Record<string, string | number | undefined | null>) => apiFetch<unknown[]>(`/api/reportes/ventas/metodos${toQueryString(params)}`),
  ventasProductos: (params?: Record<string, string | number | undefined | null>) => apiFetch<unknown[]>(`/api/reportes/ventas/productos${toQueryString(params)}`),
  consumoVsPrediccion: (params?: Record<string, string | number | undefined | null>) => apiFetch<unknown[]>(`/api/reportes/inventario/consumo-vs-prediccion${toQueryString(params)}`),
  authClienteQr: (codigoQr: string) => apiFetch<{ token?: string; rol?: string; nombre?: string }>(`/api/auth/cliente-qr/${encodeURIComponent(codigoQr)}`, {
    method: "POST"
  })
};

export function connectNotifications(onMessage: (message: string) => void) {
  if (localStorage.getItem("restoconnect-demo") === "true") return () => undefined;
  const token = localStorage.getItem("restoconnect-token");
  const url = new URL(`${API_URL}/api/notificaciones/stream`);
  if (token) url.searchParams.set("token", token);
  const source = new EventSource(url.toString());
  source.onmessage = (event) => onMessage(event.data);
  source.onerror = () => source.close();
  return () => source.close();
}
