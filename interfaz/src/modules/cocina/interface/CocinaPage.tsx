import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, InlineFeedback, ModulePanel, PageHeader } from "../../../shared/ui/primitives";
import { useCocinaViewModel } from "../application/useCocinaViewModel";
import { cocinaPort } from "../adapters/cocinaRepository";
import type { Pedido } from "../../../types";

const columns = [
  { key: "CONFIRMADO", label: "POR PREPARAR" },
  { key: "EN_PREPARACION", label: "EN PREPARACION" },
  { key: "LISTO", label: "LISTO" }
];

export function CocinaPage() {
  const { data, loading, error, reload } = useCocinaViewModel();
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [notice, setNotice] = useState<string>("");

  useEffect(() => {
    setOrders(data);
  }, [data]);

  function nextActionLabel(status: string) {
    if (status === "CONFIRMADO" || status === "PENDIENTE") return "Iniciar preparacion";
    if (status === "EN_PREPARACION") return "Marcar listo";
    return "Despachar pedido";
  }

  async function advanceOrder(id: string) {
    const currentOrder = orders.find((pedido) => pedido.id === id);
    if (!currentOrder) return;

    const nextStatus = currentOrder.estado === "CONFIRMADO" || currentOrder.estado === "PENDIENTE"
      ? "EN_PREPARACION"
      : currentOrder.estado === "EN_PREPARACION"
        ? "LISTO"
        : "ENTREGADO";

    try {
      await cocinaPort.changeStatus(id, nextStatus);
      if (nextStatus === "ENTREGADO") {
        setOrders((current) => current.filter((pedido) => pedido.id !== id));
        setNotice(`Pedido de la mesa ${currentOrder.mesaNumero} despachado.`);
        return;
      }
      setOrders((current) => current.map((pedido) => pedido.id === id ? { ...pedido, estado: nextStatus } : pedido));
      setNotice(`Pedido de la mesa ${currentOrder.mesaNumero} actualizado.`);
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo actualizar el pedido.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Produccion" eyebrow="Seguimiento de pedidos en preparacion y listos para salir" image="/images/kitchen-pass.png" action={<button className="btn-primary rounded-2xl" onClick={() => void reload()}><RefreshCw size={16} /> Actualizar</button>} />
      <InlineFeedback loading={loading} error={error} />
      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}
      <ModulePanel title="Flujo de cocina" port="Pedidos en proceso" description="Organiza lo pendiente, lo que esta en preparacion y lo que ya puede salir a mesa.">
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((column) => (
            <section key={column.key} className="rounded-3xl border border-stone-200 bg-oatmeal p-4">
              <h2 className="mb-4 text-lg font-black">{column.label}</h2>
              <div className="space-y-3">
                {orders.filter((pedido) => pedido.estado === column.key).map((pedido) => (
                  <article key={pedido.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <b>Mesa {pedido.mesaNumero}</b>
                      <Badge tone={pedido.minutos > 18 ? "red" : "yellow"}>{pedido.minutos} min</Badge>
                    </div>
                    {pedido.items.length ? pedido.items.map((item) => <p key={item.producto} className="text-sm">{item.cantidad} x {item.producto}</p>) : <p className="text-sm text-stone-500">Pedido listo para seguimiento en cocina.</p>}
                    <button className="btn-primary mt-4 w-full rounded-2xl" onClick={() => void advanceOrder(pedido.id)}>{nextActionLabel(pedido.estado)}</button>
                  </article>
                ))}
                {!orders.some((pedido) => pedido.estado === column.key) ? <p className="rounded-2xl border border-dashed border-stone-200 bg-white px-4 py-6 text-sm text-stone-500">Sin pedidos en esta etapa.</p> : null}
              </div>
            </section>
          ))}
        </div>
      </ModulePanel>
    </div>
  );
}
