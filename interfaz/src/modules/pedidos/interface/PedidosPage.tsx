import { CheckCircle2, Minus, Plus, RefreshCw, Send } from "lucide-react";
import { Badge, InlineFeedback, ModulePanel, PageHeader, SafeImage } from "../../../shared/ui/primitives";
import { usePedidosViewModel } from "../application/usePedidosViewModel";

export function PedidosPage() {
  const {
    data,
    loading,
    error,
    cart,
    add,
    total,
    selectedMesaId,
    selectedMesa,
    selectMesa,
    selectNextMesa,
    clearCart,
    submitOrder,
    submitting,
    notice,
    lastOrder,
    pendingOrders,
    validatingId,
    validateOrder,
    refreshWorkspace
  } = usePedidosViewModel();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tomar pedido"
        eyebrow="Arma la orden del cliente y enviala a cocina con stock real"
        image="/images/restaurant-hero.png"
        action={<button className="btn-primary rounded-2xl" onClick={() => void refreshWorkspace()}><RefreshCw size={16} /> Actualizar</button>}
      />
      <InlineFeedback loading={loading} error={error} />
      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <ModulePanel title="Selecciona la mesa" port="Servicio en sala" description="Elige la mesa que vas a atender antes de confirmar el pedido.">
            <div className="flex gap-2 overflow-x-auto">
              {data.mesas.map((mesa) => (
                <button
                  key={mesa.id}
                  onClick={() => selectMesa(mesa.id)}
                  disabled={mesa.estado === "BLOQUEADA" || mesa.estado === "INACTIVA"}
                  className={`btn rounded-2xl ${
                    selectedMesaId === mesa.id
                      ? "bg-herb text-white"
                      : mesa.estado === "BLOQUEADA" || mesa.estado === "INACTIVA"
                        ? "bg-red-100 text-red-800"
                        : "border border-stone-200 bg-white"
                  }`}
                >
                  Mesa {mesa.numero}
                </button>
              ))}
            </div>
          </ModulePanel>

          {pendingOrders.length ? (
            <ModulePanel title="Pedidos por validar" port="Control del turno" description="Estos pedidos aun no salieron a cocina ni descontaron inventario.">
              <div className="grid gap-3 lg:grid-cols-2">
                {pendingOrders.map((pedido) => (
                  <article key={pedido.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black">Mesa {pedido.mesaNumero}</p>
                        <p className="mt-1 text-sm text-stone-500">{pedido.items.map((item) => `${item.cantidad} x ${item.producto}`).join(" · ")}</p>
                      </div>
                      <Badge tone="yellow">{pedido.estado}</Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-bold">BOB {pedido.total.toFixed(2)}</span>
                      <button className="btn-primary rounded-2xl" disabled={validatingId === pedido.id} onClick={() => void validateOrder(pedido.id, pedido.mesaNumero)}>
                        <CheckCircle2 size={16} />
                        {validatingId === pedido.id ? "Validando..." : "Enviar a cocina"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </ModulePanel>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.productos.map((producto) => (
              <article key={producto.id} className="card overflow-hidden">
                <SafeImage className="h-32 w-full object-cover" src={producto.imagenUrl} alt={producto.nombre} fallback="/images/restaurant-hero.png" />
                <div className="p-3">
                  <div className="flex justify-between gap-3">
                    <h2 className="font-black">{producto.nombre}</h2>
                    <span className="font-black">BOB {producto.precio}</span>
                  </div>
                  <p className="mt-2 text-sm text-stone-500">{producto.categoria}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <button className="btn-secondary h-10 w-10 rounded-2xl p-0" onClick={() => add(producto.id, -1)}><Minus size={16} /></button>
                    <span className="font-black">{cart[producto.id] ?? 0}</span>
                    <button className="btn-primary h-10 w-10 rounded-2xl p-0" onClick={() => add(producto.id, 1)}><Plus size={16} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="card h-max p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">{selectedMesa ? `Mesa ${selectedMesa.numero} seleccionada` : "Selecciona una mesa"}</p>
          <h2 className="mt-2 text-lg font-black">Pedido en curso</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(cart).map(([id, qty]) => {
              const product = data.productos.find((item) => item.id === id);
              if (!product) return null;
              return <div key={id} className="flex justify-between gap-3 text-sm"><span>{qty} x {product.nombre}</span><b>BOB {(qty * product.precio).toFixed(2)}</b></div>;
            })}
            {!Object.keys(cart).length ? <p className="text-sm text-stone-500">Agrega productos para preparar la orden de esta mesa.</p> : null}
          </div>
          <div className="my-5 border-t border-stone-200 pt-4">
            <div className="flex justify-between text-xl font-black"><span>Total</span><span>BOB {total.toFixed(2)}</span></div>
          </div>
          <button className="btn-primary w-full rounded-2xl" disabled={!selectedMesa || !Object.keys(cart).length || submitting} onClick={() => void submitOrder()}><Send size={17} /> {submitting ? "Enviando..." : "Confirmar pedido"}</button>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="btn-secondary rounded-2xl" onClick={clearCart}>Vaciar</button>
            <button className="btn-secondary rounded-2xl" onClick={selectNextMesa}>Siguiente mesa</button>
          </div>
          {lastOrder ? (
            <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm">
              <p className="font-bold">Ultimo pedido enviado</p>
              <p className="mt-2 text-stone-500">Mesa {lastOrder.mesaNumero} · {lastOrder.items.length} productos · BOB {lastOrder.total.toFixed(2)} · {lastOrder.estado}</p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
