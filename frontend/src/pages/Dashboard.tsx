import { useEffect, useState } from "react";
import { Bell, PackageCheck } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { demoAlertas, demoMesas, demoPedidos, demoProductos, salesData } from "../data/demo";
import { connectNotifications } from "../lib/api";
import { Badge, PageHeader, StatCard } from "../components/ui";

export function Dashboard() {
  const [events, setEvents] = useState<string[]>([]);
  useEffect(() => {
    try {
      return connectNotifications((message) => setEvents((current) => [message, ...current].slice(0, 4)));
    } catch {
      return undefined;
    }
  }, []);

  const ventas = salesData.reduce((acc, item) => acc + item.ventas, 0);
  const ocupadas = demoMesas.filter((mesa) => mesa.estado === "OCUPADA").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard operativo" eyebrow="Hoy en sala, cocina e inventario" image="/images/restaurant-hero.jpg" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ventas semana" value={`BOB ${ventas}`} tone="herb" />
        <StatCard label="Pedidos activos" value={String(demoPedidos.length)} tone="tomato" />
        <StatCard label="Mesas ocupadas" value={`${ocupadas}/${demoMesas.length}`} tone="maize" />
        <StatCard label="Stock critico" value="3" tone="ink" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <section className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black">Ventas por dia</h2>
            <Badge tone="green">BOB</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece8df" />
                <XAxis dataKey="dia" />
                <Tooltip />
                <Area type="monotone" dataKey="ventas" stroke="#2f6f4e" fill="#2f6f4e" fillOpacity={0.16} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Bell size={19} /> Alertas</h2>
            <div className="space-y-3">
              {[...demoAlertas, ...events.map((event, index) => ({ id: `sse-${index}`, titulo: "Evento en vivo", descripcion: event, severidad: "INFO" as const }))].slice(0, 5).map((alerta) => (
                <div key={alerta.id} className="rounded-md border border-stone-200 p-3">
                  <p className="font-bold">{alerta.titulo}</p>
                  <p className="mt-1 text-sm text-stone-500">{alerta.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><PackageCheck size={19} /> Mas vendidos</h2>
            <div className="space-y-3">
              {demoProductos.slice(0, 4).map((producto, index) => (
                <div key={producto.id} className="flex items-center gap-3">
                  <img className="h-12 w-12 rounded-md object-cover" src={producto.imagenUrl} alt="" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{producto.nombre}</p>
                    <p className="text-sm text-stone-500">{42 - index * 7} vendidos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
