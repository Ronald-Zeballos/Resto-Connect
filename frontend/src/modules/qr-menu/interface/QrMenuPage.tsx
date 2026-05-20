import { Minus, Plus, QrCode, ReceiptText, ShoppingBag, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api, ApiError, apiFetchWithToken } from "../../../core/http/httpClient";
import { mapMesa, mapPedido, mapProducts } from "../../../core/http/mappers";
import { Badge, InlineFeedback, SafeImage } from "../../../shared/ui/primitives";
import { demoMesas, demoProductos } from "../../../data/demo";
import type { Mesa, Pedido, Producto } from "../../../types";

const paymentOptions = [
  { value: "EFECTIVO", label: "Pagar en caja" },
  { value: "PASARELA", label: "Pagar por QR" }
] as const;

export function QrMenuPage() {
  const { codigoQr = "" } = useParams();
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<Producto[]>(demoProductos);
  const [activeOrder, setActiveOrder] = useState<Pedido | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentOptions)[number]["value"]>("PASARELA");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [receiptMessage, setReceiptMessage] = useState<string>("");

  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      setLoading(true);
      setError(null);
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
        const demoMesa = demoMesas.find((item) => item.codigoQr === codigoQr) ?? demoMesas[0] ?? null;
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
  }, [codigoQr]);

  useEffect(() => {
    if (!mesa || !token) return undefined;
    let alive = true;
    const currentMesa = mesa;

    async function loadActiveOrder() {
      try {
        const raw = await apiFetchWithToken<Record<string, unknown>>(`/api/pedidos/mesa/${currentMesa.id}/activo`, token);
        if (!alive) return;
        setActiveOrder(mapPedido(raw, 0));
      } catch (reason) {
        if (!alive) return;
        if (reason instanceof ApiError && reason.status === 404) {
          setActiveOrder(null);
          return;
        }
      }
    }

    loadActiveOrder();
    const interval = window.setInterval(loadActiveOrder, 8000);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [mesa, token]);

  function changeQty(productId: string, delta: number) {
    setCart((current) => {
      const next = Math.max(0, (current[productId] ?? 0) + delta);
      const copy = { ...current, [productId]: next };
      if (!next) delete copy[productId];
      return copy;
    });
  }

  const availableProducts = useMemo(() => products.filter((product) => product.disponible), [products]);
  const total = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => sum + (products.find((product) => product.id === id)?.precio ?? 0) * qty, 0);
  }, [cart, products]);

  async function submitOrder() {
    if (!mesa || !token) return;
    setSubmitting(true);
    setReceiptMessage("");
    try {
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
        setActiveOrder(mapPedido(created, 0));
      } catch (reason) {
        if (reason instanceof ApiError) throw reason;
        setActiveOrder({
          id: `demo-${Date.now()}`,
          mesaNumero: mesa.numero,
          estado: "PENDIENTE_VALIDACION",
          metodoPago: paymentMethod,
          total,
          minutos: 0,
          items: Object.entries(cart).map(([productoId, cantidad]) => ({
            producto: products.find((item) => item.id === productoId)?.nombre ?? "Producto",
            cantidad
          }))
        });
      }
      setCart({});
      setReceiptMessage("Pedido enviado. El restaurante debe validarlo antes de cocina o cobro.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo registrar el pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  async function payOrder() {
    if (!token || !activeOrder) return;
    setPaying(true);
    setReceiptMessage("");
    try {
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
        setActiveOrder((current) => current ? { ...current, estado: "PAGADO" } : current);
      }
      setReceiptMessage("Pago QR registrado correctamente. La factura ya fue emitida.");
      try {
        const updated = await apiFetchWithToken<Record<string, unknown>>(`/api/pedidos/${activeOrder.id}`, token);
        setActiveOrder(mapPedido(updated, 0));
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
              <h1 className="text-3xl font-black text-ink sm:text-4xl">RestoConnect Pro</h1>
              <p className="mt-3 max-w-2xl text-sm text-stone-500">Escanea, revisa disponibilidad real y registra tu pedido para la mesa sin depender de un login manual.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Badge tone="blue">{mesa ? `Mesa ${mesa.numero}` : "Resolviendo mesa..."}</Badge>
                {mesa ? <Badge tone={mesa.estado === "LIBRE" ? "green" : mesa.estado === "OCUPADA" ? "yellow" : "red"}>{mesa.estado}</Badge> : null}
                <Badge>{paymentOptions.find((option) => option.value === paymentMethod)?.label}</Badge>
              </div>
            </div>
            <SafeImage className="h-56 w-full object-cover lg:h-full" src="/images/restaurant-hero.png" alt="Restaurante" fallback="/images/restaurant-hero.png" />
          </div>
        </section>

        <InlineFeedback loading={loading} error={error} />
        {receiptMessage ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{receiptMessage}</div> : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            {activeOrder ? (
              <section className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Pedido activo</p>
                    <h2 className="mt-2 text-2xl font-black">Estado: {activeOrder.estado}</h2>
                    <p className="mt-2 text-sm text-stone-500">Tu pedido ya fue registrado para la mesa {activeOrder.mesaNumero}. Aqui puedes seguir su estado en tiempo real.</p>
                  </div>
                  <Badge tone={activeOrder.estado === "PAGADO" ? "green" : activeOrder.estado === "PENDIENTE_VALIDACION" ? "yellow" : "blue"}>{activeOrder.metodoPago || paymentMethod}</Badge>
                </div>

                <div className="mt-5 space-y-3">
                  {activeOrder.items.map((item) => (
                    <div key={`${activeOrder.id}-${item.producto}`} className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
                      <span>{item.cantidad} x {item.producto}</span>
                      <span className="font-bold">Preparando servicio</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 text-xl font-black">
                  <span>Total</span>
                  <span>BOB {activeOrder.total.toFixed(2)}</span>
                </div>

                {activeOrder.estado !== "PENDIENTE_VALIDACION" && activeOrder.estado !== "CANCELADO" && activeOrder.estado !== "PAGADO" ? (
                  <button className="btn-primary mt-5 w-full rounded-2xl" disabled={paying} onClick={payOrder}>
                    <Wallet size={17} />
                    {paying ? "Procesando pago..." : "Pagar pedido por QR"}
                  </button>
                ) : null}
              </section>
            ) : (
              <>
                <section className="card p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Disponibilidad real</p>
                      <h2 className="mt-2 text-2xl font-black">Menu listo para pedir</h2>
                    </div>
                    <label>
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Metodo de pago</span>
                      <select className="input" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "EFECTIVO" | "PASARELA")}>
                        {paymentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </label>
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
              </>
            )}
          </section>

          <aside className="card h-max p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-herb/10 p-3 text-herb"><ShoppingBag size={20} /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Resumen</p>
                <h2 className="text-xl font-black">Tu pedido</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {Object.entries(cart).map(([id, qty]) => {
                const product = products.find((item) => item.id === id);
                if (!product) return null;
                return (
                  <div key={id} className="flex items-center justify-between text-sm">
                    <span>{qty} x {product.nombre}</span>
                    <b>BOB {(qty * product.precio).toFixed(2)}</b>
                  </div>
                );
              })}
              {!Object.keys(cart).length ? <p className="text-sm text-stone-500">Agrega productos para registrar el pedido desde la mesa.</p> : null}
            </div>
            <div className="mt-5 border-t border-stone-100 pt-4">
              <div className="flex items-center justify-between text-xl font-black">
                <span>Total</span>
                <span>BOB {total.toFixed(2)}</span>
              </div>
            </div>
            <button className="btn-primary mt-5 w-full rounded-2xl" disabled={!mesa || !token || !Object.keys(cart).length || submitting || Boolean(activeOrder)} onClick={submitOrder}>
              <ReceiptText size={17} />
              {submitting ? "Enviando pedido..." : "Confirmar pedido"}
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
