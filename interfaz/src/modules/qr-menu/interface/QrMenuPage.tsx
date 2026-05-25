import { Minus, Plus, QrCode, ReceiptText, Search, ShoppingBag, Store, Trash2, UtensilsCrossed, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api, ApiError, apiFetchWithToken } from "../../../core/http/httpClient";
import { mapMesa, mapPedido, mapProducts } from "../../../core/http/mappers";
import { Badge, InlineFeedback, Progress, SafeImage } from "../../../shared/ui/primitives";
import { demoMesas, demoProductos } from "../../../data/demo";
import type { Mesa, Pedido, Producto, TipoServicio } from "../../../types";

const paymentOptions = [
  { value: "EFECTIVO", label: "Pagar en caja" },
  { value: "PASARELA", label: "Pagar por QR" }
] as const;

const serviceOptions: Array<{ value: TipoServicio; label: string; icon: typeof UtensilsCrossed }> = [
  { value: "PARA_COMER", label: "Para comer aqui", icon: UtensilsCrossed },
  { value: "PARA_LLEVAR", label: "Para llevar", icon: Store }
];

const statusLabels: Record<string, string> = {
  PENDIENTE_VALIDACION: "Pendiente de validacion",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparacion",
  LISTO: "Listo para entregar",
  ENTREGADO: "Entregado",
  PAGADO: "Pagado",
  CANCELADO: "Cancelado"
};

const MINUTE_MS = 60_000;

type OrderMeta = {
  pedidoId: string;
  tipoServicio: TipoServicio;
  createdAt: number;
  prepMinutes: number;
  readyAt: number;
  handoffAt: number;
};

function storageKeys(codigoQr: string) {
  return {
    serviceType: `restoconnect-qr-service-type:${codigoQr}`,
    orderMeta: `restoconnect-qr-order-meta:${codigoQr}`,
    demoOrder: `restoconnect-qr-demo-order:${codigoQr}`
  };
}

function computeOrderMeta(orderId: string, items: Pedido["items"], tipoServicio: TipoServicio): OrderMeta {
  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const uniqueItems = items.length;
  const now = Date.now();
  const prepMinutes = Math.min(45, (tipoServicio === "PARA_LLEVAR" ? 10 : 8) + totalItems * 2 + uniqueItems);
  const handoffBuffer = tipoServicio === "PARA_LLEVAR" ? 4 : 2;
  return {
    pedidoId: orderId,
    tipoServicio,
    createdAt: now,
    prepMinutes,
    readyAt: now + prepMinutes * MINUTE_MS,
    handoffAt: now + (prepMinutes + handoffBuffer) * MINUTE_MS
  };
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function formatHour(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
}

function deriveEtaSnapshot(meta: OrderMeta, now: number) {
  const totalWindow = Math.max(1, meta.handoffAt - meta.createdAt);
  const elapsed = Math.max(0, now - meta.createdAt);
  const progress = Math.min(100, (elapsed / totalWindow) * 100);

  if (now >= meta.handoffAt) {
    return {
      progress: 100,
      stageTitle: meta.tipoServicio === "PARA_LLEVAR" ? "Listo para recoger" : "Listo para servir",
      stageDescription: meta.tipoServicio === "PARA_LLEVAR"
        ? "Tu pedido deberia estar listo en mostrador o caja."
        : "Tu pedido ya deberia estar saliendo a mesa.",
      nextEtaLabel: meta.tipoServicio === "PARA_LLEVAR" ? "Recoger ahora" : "Servicio ahora",
      nextEtaValue: "Ahora"
    };
  }

  if (now >= meta.readyAt) {
    return {
      progress,
      stageTitle: meta.tipoServicio === "PARA_LLEVAR" ? "Empaquetando retiro" : "Montando servicio",
      stageDescription: meta.tipoServicio === "PARA_LLEVAR"
        ? "Estamos cerrando el pedido para que puedas retirarlo."
        : "Estamos dando el toque final antes de servirlo.",
      nextEtaLabel: meta.tipoServicio === "PARA_LLEVAR" ? "Recoger en" : "Servir en",
      nextEtaValue: formatRemaining(meta.handoffAt - now)
    };
  }

  if (now >= meta.createdAt + (meta.readyAt - meta.createdAt) * 0.4) {
    return {
      progress,
      stageTitle: "En preparacion",
      stageDescription: "Cocina ya esta trabajando tu pedido.",
      nextEtaLabel: meta.tipoServicio === "PARA_LLEVAR" ? "Listo para recoger en" : "Listo para servir en",
      nextEtaValue: formatRemaining(meta.readyAt - now)
    };
  }

  return {
    progress,
    stageTitle: "Orden confirmada",
    stageDescription: "Estamos organizando tu pedido y enviandolo a produccion.",
    nextEtaLabel: meta.tipoServicio === "PARA_LLEVAR" ? "Salida a retiro en" : "Salida a servicio en",
    nextEtaValue: formatRemaining(meta.readyAt - now)
  };
}

function readStoredServiceType(codigoQr: string): TipoServicio {
  if (typeof window === "undefined") return "PARA_COMER";
  const stored = window.localStorage.getItem(storageKeys(codigoQr).serviceType);
  return stored === "PARA_LLEVAR" ? "PARA_LLEVAR" : "PARA_COMER";
}

function buildCartFromOrder(order: Pedido, products: Producto[]) {
  return order.items.reduce<Record<string, number>>((accumulator, item) => {
    const match = item.productId
      ? products.find((product) => product.id === item.productId)
      : products.find((product) => product.nombre === item.producto);
    if (match) accumulator[match.id] = item.cantidad;
    return accumulator;
  }, {});
}

export function QrMenuPage() {
  const { codigoQr = "" } = useParams();
  const demoMesaSeed = useMemo(() => demoMesas.find((item) => item.codigoQr === codigoQr) ?? null, [codigoQr]);
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<Producto[]>(demoProductos);
  const [activeOrder, setActiveOrder] = useState<Pedido | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentOptions)[number]["value"]>("PASARELA");
  const [serviceType, setServiceType] = useState<TipoServicio>(() => readStoredServiceType(codigoQr));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [receiptMessage, setReceiptMessage] = useState<string>("");
  const [orderMeta, setOrderMeta] = useState<OrderMeta | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const isDemoSession = Boolean(demoMesaSeed) || Boolean(token?.startsWith("demo-qr-"));

  useEffect(() => {
    setServiceType(readStoredServiceType(codigoQr));
  }, [codigoQr]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKeys(codigoQr).serviceType, serviceType);
  }, [codigoQr, serviceType]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  function readStoredOrderMeta() {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(storageKeys(codigoQr).orderMeta);
      return stored ? JSON.parse(stored) as Partial<OrderMeta> : null;
    } catch {
      return null;
    }
  }

  function readStoredDemoOrder() {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(storageKeys(codigoQr).demoOrder);
      return stored ? JSON.parse(stored) as Pedido : null;
    } catch {
      return null;
    }
  }

  function attachStoredOrderMeta(order: Pedido | null) {
    if (!order || typeof window === "undefined") return order;
    try {
      const payload = readStoredOrderMeta();
      if (!payload) return order;
      if (payload.pedidoId === order.id && payload.tipoServicio) {
        return { ...order, tipoServicio: payload.tipoServicio };
      }
    } catch {
      return order;
    }
    return order;
  }

  function persistOrderMeta(orderId: string, items: Pedido["items"], tipoServicio: TipoServicio) {
    if (typeof window === "undefined") return;
    const meta = computeOrderMeta(orderId, items, tipoServicio);
    window.localStorage.setItem(storageKeys(codigoQr).orderMeta, JSON.stringify(meta));
    setOrderMeta(meta);
  }

  function clearOrderMeta() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(storageKeys(codigoQr).orderMeta);
    setOrderMeta(null);
  }

  function persistDemoOrder(order: Pedido | null) {
    if (typeof window === "undefined") return;
    if (!order) {
      window.localStorage.removeItem(storageKeys(codigoQr).demoOrder);
      return;
    }
    window.localStorage.setItem(storageKeys(codigoQr).demoOrder, JSON.stringify(order));
  }

  function createLocalOrder(currentMesa: Mesa, currentPaymentMethod: (typeof paymentOptions)[number]["value"], currentServiceType: TipoServicio) {
    return {
      id: `demo-${Date.now()}`,
      mesaNumero: currentMesa.numero,
      estado: "PENDIENTE_VALIDACION",
      metodoPago: currentPaymentMethod,
      tipoServicio: currentServiceType,
      total,
      minutos: 0,
      items: Object.entries(cart).map(([productoId, cantidad]) => {
        const product = products.find((item) => item.id === productoId);
        return {
          productId: productoId,
          producto: product?.nombre ?? "Producto",
          cantidad,
          precioUnitario: product?.precio ?? 0,
          subtotal: (product?.precio ?? 0) * cantidad
        };
      })
    } satisfies Pedido;
  }

  async function loadActiveOrder(currentMesa: Mesa, currentToken: string, demoMode: boolean) {
    if (demoMode) {
      setActiveOrder(attachStoredOrderMeta(readStoredDemoOrder()));
      return;
    }
    try {
      const raw = await apiFetchWithToken<Record<string, unknown>>(`/api/pedidos/mesa/${currentMesa.id}/activo`, currentToken);
      const nextOrder = attachStoredOrderMeta(mapPedido(raw, 0));
      setActiveOrder(nextOrder);
      persistDemoOrder(nextOrder);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 404) {
        setActiveOrder(null);
        clearOrderMeta();
        persistDemoOrder(null);
        return;
      }
      const fallbackOrder = readStoredDemoOrder();
      if (fallbackOrder) {
        setActiveOrder(attachStoredOrderMeta(fallbackOrder));
      }
    }
  }

  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      setLoading(true);
      setError(null);
      if (demoMesaSeed) {
        setMesa(demoMesaSeed);
        setToken(`demo-qr-${codigoQr}`);
        setProducts(demoProductos.filter((product) => product.activo));
        setLoading(false);
        return;
      }
      try {
        const [mesaRaw, authResponse, productsRaw] = await Promise.all([
          api.mesaPorQr(codigoQr),
          api.authClienteQr(codigoQr),
          api.productos()
        ]);

        if (!alive) return;
        const mesaResolved = mapMesa(mesaRaw, 0);
        const tokenResolved = authResponse.token ?? null;
        setMesa(mesaResolved);
        setToken(tokenResolved);
        setProducts(mapProducts(productsRaw).filter((product) => product.activo));
      } catch (reason) {
        if (!alive) return;
        if (reason instanceof ApiError) {
          setError(reason.message);
          return;
        }
        const demoMesa = demoMesaSeed ?? demoMesas[0] ?? null;
        setMesa(demoMesa);
        setToken(`demo-qr-${codigoQr}`);
        setProducts(demoProductos);
      } finally {
        if (alive) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      alive = false;
    };
  }, [codigoQr, demoMesaSeed]);

  useEffect(() => {
    if (!mesa || !token) return undefined;
    const currentMesa = mesa;
    const currentToken = token;
    const currentMode = isDemoSession;

    async function pollOrder() {
      try {
        await loadActiveOrder(currentMesa, currentToken, currentMode);
      } catch {
        // Keep the latest known state if polling fails temporarily.
      }
    }

    pollOrder();
    if (currentMode) return undefined;
    const interval = window.setInterval(pollOrder, 8000);
    return () => {
      window.clearInterval(interval);
    };
  }, [isDemoSession, mesa, token]);

  function changeQty(productId: string, delta: number) {
    setCart((current) => {
      const next = Math.max(0, (current[productId] ?? 0) + delta);
      const copy = { ...current, [productId]: next };
      if (!next) delete copy[productId];
      return copy;
    });
  }

  function removeFromCart(productId: string) {
    setCart((current) => {
      const copy = { ...current };
      delete copy[productId];
      return copy;
    });
  }

  function clearCart() {
    setCart({});
  }

  const categories = useMemo(() => ["Todas", ...Array.from(new Set(products.filter((product) => product.disponible).map((product) => product.categoria)))], [products]);
  const availableProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product.disponible) return false;
      if (category !== "Todas" && product.categoria !== category) return false;
      if (query.trim() && !`${product.nombre} ${product.descripcion}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [category, products, query]);
  const total = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => sum + (products.find((product) => product.id === id)?.precio ?? 0) * qty, 0);
  }, [cart, products]);
  const cartCount = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart]);
  const selectedServiceLabel = serviceOptions.find((option) => option.value === serviceType)?.label ?? "Para comer aqui";
  const activeOrderServiceLabel = serviceOptions.find((option) => option.value === activeOrder?.tipoServicio)?.label;
  const canCancelActiveOrder = activeOrder?.estado === "PENDIENTE_VALIDACION";
  const canPayActiveOrder = activeOrder && activeOrder.estado !== "PENDIENTE_VALIDACION" && activeOrder.estado !== "CANCELADO" && activeOrder.estado !== "PAGADO" && activeOrder.metodoPago === "PASARELA";
  const etaSnapshot = orderMeta ? deriveEtaSnapshot(orderMeta, now) : null;

  useEffect(() => {
    if (!activeOrder) {
      setOrderMeta(null);
      return;
    }
    const stored = readStoredOrderMeta();
    if (stored?.pedidoId === activeOrder.id && stored.createdAt && stored.readyAt && stored.handoffAt && stored.prepMinutes && stored.tipoServicio) {
      setOrderMeta(stored as OrderMeta);
      return;
    }
    const tipoServicio = activeOrder.tipoServicio || serviceType;
    const meta = computeOrderMeta(activeOrder.id, activeOrder.items, tipoServicio);
    setOrderMeta(meta);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKeys(codigoQr).orderMeta, JSON.stringify(meta));
    }
  }, [activeOrder, codigoQr, serviceType]);

  async function submitOrder() {
    if (!mesa || !token || !Object.keys(cart).length) return;
    setSubmitting(true);
    setReceiptMessage("");
    setError(null);
    try {
      if (isDemoSession) {
        const createdOrder = createLocalOrder(mesa, paymentMethod, serviceType);
        setActiveOrder(createdOrder);
        persistOrderMeta(createdOrder.id, createdOrder.items, serviceType);
        persistDemoOrder(createdOrder);
        setCart({});
        setReceiptMessage(`Pedido confirmado para ${selectedServiceLabel.toLowerCase()}. Si necesitas corregirlo, podras hacerlo mientras siga pendiente de validacion.`);
        return;
      }
      const payload = {
        mesaId: mesa.id,
        metodoPago: paymentMethod,
        detalles: Object.entries(cart).map(([productoId, cantidad]) => ({ productoId, cantidad }))
      };
      try {
        const created = await apiFetchWithToken<Record<string, unknown>>("/api/pedidos", token, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        const createdOrder = { ...mapPedido(created, 0), tipoServicio: serviceType };
        setActiveOrder(createdOrder);
        persistOrderMeta(createdOrder.id, createdOrder.items, serviceType);
        persistDemoOrder(createdOrder);
      } catch (reason) {
        if (reason instanceof ApiError) throw reason;
        const createdOrder = createLocalOrder(mesa, paymentMethod, serviceType);
        setActiveOrder(createdOrder);
        persistOrderMeta(createdOrder.id, createdOrder.items, serviceType);
        persistDemoOrder(createdOrder);
      }
      setCart({});
      setReceiptMessage(`Pedido confirmado para ${selectedServiceLabel.toLowerCase()}. Si necesitas corregirlo, podras hacerlo mientras siga pendiente de validacion.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo registrar el pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelOrder(loadIntoCart: boolean) {
    if (!token || !activeOrder) return;
    setCancelling(true);
    setReceiptMessage("");
    setError(null);
    const restoredCart = loadIntoCart ? buildCartFromOrder(activeOrder, products) : {};
    try {
      if (!isDemoSession) {
        try {
          await apiFetchWithToken<Record<string, unknown>>(`/api/pedidos/${activeOrder.id}/cancelar`, token, { method: "PATCH" });
        } catch (reason) {
          if (reason instanceof ApiError) throw reason;
        }
      }
      clearOrderMeta();
      persistDemoOrder(null);
      setActiveOrder(null);
      if (loadIntoCart) {
        setCart(restoredCart);
        setReceiptMessage("Cargamos tu pedido nuevamente al editor para que agregues, quites o cambies cantidades antes de confirmarlo otra vez.");
      } else {
        setReceiptMessage("Pedido cancelado. Ya puedes armar uno nuevo desde el menu.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cancelar el pedido.");
    } finally {
      setCancelling(false);
    }
  }

  async function payOrder() {
    if (!token || !activeOrder) return;
    setPaying(true);
    setReceiptMessage("");
    setError(null);
    try {
      if (isDemoSession) {
        const nextOrder = { ...activeOrder, estado: "PAGADO" };
        setActiveOrder(nextOrder);
        persistDemoOrder(nextOrder);
        setReceiptMessage("Pago QR simulado correctamente. La factura demo queda marcada como emitida.");
        return;
      }
      try {
        await apiFetchWithToken<Record<string, unknown>>("/api/pagos/pasarela/simular", token, {
          method: "POST",
          body: JSON.stringify({
            pedidoId: activeOrder.id,
            monto: activeOrder.total,
            tokenSimulado: `qr-${activeOrder.id}`,
            datosFacturacion: {
              razonSocial: "Consumidor Final",
              nitCi: "S/N",
              email: "cliente.qr@restoconnect.local"
            }
          })
        });
      } catch (reason) {
        if (reason instanceof ApiError) throw reason;
        setActiveOrder((current) => {
          const next = current ? { ...current, estado: "PAGADO" } : current;
          persistDemoOrder(next);
          return next;
        });
      }
      setReceiptMessage("Pago QR registrado correctamente. La factura ya fue emitida.");
      try {
        const updated = await apiFetchWithToken<Record<string, unknown>>(`/api/pedidos/${activeOrder.id}`, token);
        const nextOrder = attachStoredOrderMeta(mapPedido(updated, 0));
        setActiveOrder(nextOrder);
        persistDemoOrder(nextOrder);
      } catch {
        // Keep optimistic local state in demo mode.
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo procesar el pago QR.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <main className="min-h-screen bg-oatmeal px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-soft">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_.8fr]">
            <div className="p-6 sm:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-herb/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-herb">
                <QrCode size={16} />
                Menu QR activo
              </div>
              <h1 className="text-3xl font-black text-ink sm:text-4xl">Pide a tu ritmo</h1>
              <p className="mt-3 max-w-2xl text-sm text-stone-500">Agrega productos, cambia cantidades, elige si es para comer aqui o para llevar y confirma tu pedido sin perder el control del resumen.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Badge tone="blue">{mesa ? `Mesa ${mesa.numero}` : "Resolviendo mesa..."}</Badge>
                {mesa ? <Badge tone={mesa.estado === "LIBRE" ? "green" : mesa.estado === "OCUPADA" ? "yellow" : "red"}>{mesa.estado}</Badge> : null}
                <Badge>{paymentOptions.find((option) => option.value === paymentMethod)?.label}</Badge>
                <Badge>{selectedServiceLabel}</Badge>
              </div>
            </div>
            <SafeImage className="h-56 w-full object-cover lg:h-full" src="/images/restaurant-hero.png" alt="Restaurante" fallback="/images/restaurant-hero.png" />
          </div>
        </section>

        <InlineFeedback loading={loading} error={error} />
        {receiptMessage ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{receiptMessage}</div> : null}
        {isDemoSession ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">Modo demo activo. Esta mesa usa datos locales para que puedas probar confirmar, editar, cancelar y pagar sin depender del backend.</div> : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            {activeOrder ? (
              <section className="card p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Pedido activo</p>
                    <h2 className="mt-2 text-2xl font-black">{statusLabels[activeOrder.estado] ?? activeOrder.estado}</h2>
                    <p className="mt-2 max-w-2xl text-sm text-stone-500">
                      {canCancelActiveOrder
                        ? "Tu pedido aun esta pendiente. Puedes cancelarlo por completo o cargarlo de nuevo al editor para corregir cantidades y productos."
                        : "Tu pedido ya esta en proceso. Puedes seguirlo desde aqui mientras cocina o caja actualizan el estado."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={activeOrder.estado === "PAGADO" ? "green" : canCancelActiveOrder ? "yellow" : "blue"}>{activeOrder.metodoPago || paymentMethod}</Badge>
                    {activeOrderServiceLabel ? <Badge>{activeOrderServiceLabel}</Badge> : null}
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {activeOrder.items.map((item) => (
                    <div key={`${activeOrder.id}-${item.productId ?? item.producto}`} className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
                      <div>
                        <p className="font-semibold">{item.cantidad} x {item.producto}</p>
                        {item.precioUnitario ? <p className="text-xs text-stone-500">BOB {item.precioUnitario.toFixed(2)} c/u</p> : null}
                      </div>
                      <span className="font-bold">{item.subtotal ? `BOB ${item.subtotal.toFixed(2)}` : "En proceso"}</span>
                    </div>
                  ))}
                </div>

                {etaSnapshot && orderMeta ? (
                  <div className="mt-5 rounded-3xl border border-stone-200 bg-stone-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Seguimiento estimado</p>
                        <h3 className="mt-1 text-lg font-black">{etaSnapshot.stageTitle}</h3>
                        <p className="mt-1 text-sm text-stone-500">{etaSnapshot.stageDescription}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">{etaSnapshot.nextEtaLabel}</p>
                        <p className="mt-1 text-lg font-black text-ink">{etaSnapshot.nextEtaValue}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={etaSnapshot.progress} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Preparacion estimada</p>
                        <p className="mt-1 font-semibold">{orderMeta.prepMinutes} min</p>
                        <p className="text-xs text-stone-500">Listo aprox a las {formatHour(orderMeta.readyAt)}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">{orderMeta.tipoServicio === "PARA_LLEVAR" ? "Ventana de retiro" : "Salida estimada"}</p>
                        <p className="mt-1 font-semibold">{formatHour(orderMeta.handoffAt)}</p>
                        <p className="text-xs text-stone-500">{orderMeta.tipoServicio === "PARA_LLEVAR" ? "Pasa por caja o mostrador cerca de esa hora." : "El equipo deberia servirlo cerca de esa hora."}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 text-xl font-black">
                  <span>Total</span>
                  <span>BOB {activeOrder.total.toFixed(2)}</span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {canCancelActiveOrder ? (
                    <>
                      <button className="btn-secondary rounded-2xl" disabled={cancelling} onClick={() => void cancelOrder(true)}>
                        <ReceiptText size={17} />
                        {cancelling ? "Preparando edicion..." : "Editar pedido"}
                      </button>
                      <button className="btn-secondary rounded-2xl" disabled={cancelling} onClick={() => void cancelOrder(false)}>
                        <Trash2 size={17} />
                        {cancelling ? "Cancelando..." : "Cancelar pedido"}
                      </button>
                    </>
                  ) : null}

                  {canPayActiveOrder ? (
                    <button className="btn-primary rounded-2xl sm:col-span-2" disabled={paying} onClick={payOrder}>
                      <Wallet size={17} />
                      {paying ? "Procesando pago..." : "Pagar pedido por QR"}
                    </button>
                  ) : null}
                </div>

                {activeOrder.metodoPago === "EFECTIVO" && activeOrder.estado !== "PAGADO" ? (
                  <p className="mt-4 text-sm text-stone-500">Elegiste pagar en caja. Cuando el equipo confirme el cobro, este estado se actualizara aqui.</p>
                ) : null}
              </section>
            ) : null}

            <section className="card p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Explora el menu</p>
                  <h2 className="mt-2 text-2xl font-black">Agrega, quita o ajusta antes de confirmar</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="relative">
                    <Search className="absolute left-3 top-3 text-stone-400" size={18} />
                    <input className="input pl-10" placeholder="Buscar producto" value={query} onChange={(event) => setQuery(event.target.value)} />
                  </label>
                  <select className="input" value={category} onChange={(event) => setCategory(event.target.value)}>
                    {categories.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {availableProducts.map((product) => (
                <article key={product.id} className="card overflow-hidden">
                  <SafeImage className="h-44 w-full object-cover" src={product.imagenUrl} alt={product.nombre} fallback="/images/restaurant-hero.png" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-black">{product.nombre}</h2>
                        <p className="mt-1 text-sm text-stone-500">{product.descripcion}</p>
                      </div>
                      <Badge tone="green">Disponible</Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-black">BOB {product.precio.toFixed(2)}</span>
                      <Badge>{product.categoria}</Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <button className="btn-secondary h-10 w-10 rounded-2xl p-0" onClick={() => changeQty(product.id, -1)}><Minus size={16} /></button>
                      <span className="text-lg font-black">{cart[product.id] ?? 0}</span>
                      <button className="btn-primary h-10 w-10 rounded-2xl p-0" onClick={() => changeQty(product.id, 1)}><Plus size={16} /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {!availableProducts.length ? <div className="rounded-2xl border border-stone-200 bg-white px-4 py-5 text-sm text-stone-500">No encontramos productos con ese filtro. Cambia la categoria o la busqueda para seguir armando tu pedido.</div> : null}
          </section>

          <aside className="card h-max p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-herb/10 p-3 text-herb"><ShoppingBag size={20} /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Gestion del pedido</p>
                <h2 className="text-xl font-black">Tu resumen</h2>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Tipo de servicio</p>
                <div className="grid gap-2">
                  {serviceOptions.map((option) => {
                    const Icon = option.icon;
                    const selected = serviceType === option.value;
                    return (
                      <button
                        key={option.value}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${selected ? "border-herb bg-herb/10 text-herb" : "border-stone-200 bg-white text-ink"}`}
                        onClick={() => setServiceType(option.value)}
                        type="button"
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={16} />
                          {option.label}
                        </span>
                        {selected ? <span className="text-xs uppercase tracking-wide">Activo</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Metodo de pago</span>
                <select className="input" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "EFECTIVO" | "PASARELA")}>
                  {paymentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-5 space-y-3">
              {Object.entries(cart).map(([id, qty]) => {
                const product = products.find((item) => item.id === id);
                if (!product) return null;
                return (
                  <div key={id} className="rounded-2xl border border-stone-200 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{product.nombre}</p>
                        <p className="text-xs text-stone-500">BOB {product.precio.toFixed(2)} c/u</p>
                      </div>
                      <button className="text-stone-400 transition hover:text-tomato" onClick={() => removeFromCart(id)} type="button">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="btn-secondary h-9 w-9 rounded-2xl p-0" onClick={() => changeQty(id, -1)} type="button"><Minus size={15} /></button>
                        <span className="min-w-8 text-center text-lg font-black">{qty}</span>
                        <button className="btn-primary h-9 w-9 rounded-2xl p-0" onClick={() => changeQty(id, 1)} type="button"><Plus size={15} /></button>
                      </div>
                      <b>BOB {(qty * product.precio).toFixed(2)}</b>
                    </div>
                  </div>
                );
              })}

              {!Object.keys(cart).length ? (
                <p className="text-sm text-stone-500">
                  {activeOrder
                    ? "Tienes un pedido activo. Si sigue pendiente, puedes cargarlo al editor para corregirlo."
                    : "Agrega productos para confirmar tu pedido desde la mesa."}
                </p>
              ) : null}
            </div>

            <div className="mt-5 border-t border-stone-100 pt-4">
              <div className="mb-2 flex items-center justify-between text-sm text-stone-500">
                <span>Productos seleccionados</span>
                <span>{cartCount}</span>
              </div>
              <div className="flex items-center justify-between text-xl font-black">
                <span>Total</span>
                <span>BOB {total.toFixed(2)}</span>
              </div>
            </div>

            {Object.keys(cart).length ? (
              <button className="btn-secondary mt-4 w-full rounded-2xl" onClick={clearCart} type="button">
                <Trash2 size={16} />
                Vaciar seleccion
              </button>
            ) : null}

            <button className="btn-primary mt-4 w-full rounded-2xl" disabled={!mesa || (!token && !isDemoSession) || !Object.keys(cart).length || submitting || Boolean(activeOrder)} onClick={submitOrder}>
              <ReceiptText size={17} />
              {submitting ? "Confirmando pedido..." : activeOrder ? "Tienes un pedido activo" : "Confirmar mi pedido"}
            </button>

            {activeOrder && Object.keys(cart).length ? <p className="mt-3 text-xs text-stone-500">Para enviar una version nueva del pedido, primero edita o cancela el pedido activo.</p> : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
