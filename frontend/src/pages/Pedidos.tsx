import { Minus, Plus, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { demoMesas, demoPedidos, demoProductos } from "../data/demo";
import { Badge, PageHeader } from "../components/ui";

export function Pedidos() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const total = useMemo(() => Object.entries(cart).reduce((sum, [id, qty]) => sum + (demoProductos.find((p) => p.id === id)?.precio ?? 0) * qty, 0), [cart]);

  function add(id: string, delta: number) {
    setCart((current) => {
      const next = Math.max(0, (current[id] ?? 0) + delta);
      const copy = { ...current, [id]: next };
      if (!next) delete copy[id];
      return copy;
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Toma de pedido" eyebrow="Flujo para mesero en tablet" image="/images/restaurant-hero.jpg" />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <div className="card flex gap-2 overflow-x-auto p-3">
            {demoMesas.map((mesa) => <button key={mesa.id} className={`btn ${mesa.estado === "BLOQUEADA" ? "bg-red-100 text-red-800" : "bg-white border border-stone-200"}`}>Mesa {mesa.numero}</button>)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {demoProductos.map((producto) => (
              <article key={producto.id} className="card overflow-hidden">
                <img className="h-32 w-full object-cover" src={producto.imagenUrl} alt="" />
                <div className="p-3">
                  <div className="flex justify-between gap-3">
                    <h2 className="font-black">{producto.nombre}</h2>
                    <span className="font-black">BOB {producto.precio}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <button className="btn-secondary h-9 w-9 p-0" onClick={() => add(producto.id, -1)}><Minus size={16} /></button>
                    <span className="font-black">{cart[producto.id] ?? 0}</span>
                    <button className="btn-primary h-9 w-9 p-0" onClick={() => add(producto.id, 1)}><Plus size={16} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <aside className="card h-max p-5">
          <h2 className="mb-4 text-lg font-black">Carrito</h2>
          <div className="space-y-3">
            {Object.entries(cart).map(([id, qty]) => {
              const product = demoProductos.find((item) => item.id === id);
              if (!product) return null;
              return <div key={id} className="flex justify-between gap-3 text-sm"><span>{qty} x {product.nombre}</span><b>BOB {(qty * product.precio).toFixed(2)}</b></div>;
            })}
            {!Object.keys(cart).length ? <p className="text-sm text-stone-500">Selecciona productos para iniciar un pedido.</p> : null}
          </div>
          <div className="my-5 border-t border-stone-200 pt-4">
            <div className="flex justify-between text-xl font-black"><span>Total</span><span>BOB {total.toFixed(2)}</span></div>
          </div>
          <button className="btn-primary w-full"><Send size={17} /> Enviar pedido</button>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="btn-secondary">Validar</button>
            <button className="btn-secondary">Cancelar</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function Cocina() {
  const columns = ["PENDIENTE", "EN_PREPARACION", "LISTO"];
  return (
    <div className="space-y-6">
      <PageHeader title="Panel de cocina" eyebrow="Kitchen display system" image="/images/kitchen-pass.jpg" />
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <section key={column} className="card min-h-96 p-4">
            <h2 className="mb-4 text-lg font-black">{column.replace("_", " ")}</h2>
            <div className="space-y-3">
              {demoPedidos.filter((pedido) => pedido.estado === column).map((pedido) => (
                <article key={pedido.id} className="rounded-lg border border-stone-200 bg-cream p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <b>Mesa {pedido.mesaNumero}</b>
                    <Badge tone={pedido.minutos > 18 ? "red" : "yellow"}>{pedido.minutos} min</Badge>
                  </div>
                  {pedido.items.map((item) => <p key={item.producto} className="text-sm">{item.cantidad} x {item.producto}</p>)}
                  <button className="btn-primary mt-4 w-full">Avanzar estado</button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
