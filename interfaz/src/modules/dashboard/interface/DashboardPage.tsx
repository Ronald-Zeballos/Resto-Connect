import { Bell, PackageCheck } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useSession } from "../../../core/auth/sessionStore";
import { moduleCatalog } from "../../../core/modules/moduleCatalog";
import { Badge, InlineFeedback, ModulePanel, PageHeader, SafeImage, StatCard } from "../../../shared/ui/primitives";
import { useDashboardViewModel } from "../application/useDashboardViewModel";

export function DashboardPage() {
  const { role } = useSession();
  const { data, alerts, loading, error, metrics } = useDashboardViewModel();
  const visibleModules = moduleCatalog.filter((module) => module.roles.includes(role) && module.id !== "dashboard");

  return (
    <div className="space-y-6">
      <PageHeader title="Panorama del día" eyebrow="Ventas, alertas y productos con mayor movimiento" image="/images/restaurant-hero.png" />
      <InlineFeedback loading={loading} error={error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ventas semana" value={`BOB ${metrics.weeklySales}`} tone="herb" />
        <StatCard label="Pedidos activos" value={String(metrics.activeOrders)} tone="tomato" />
        <StatCard label="Mesas ocupadas" value={`${metrics.occupiedTables}/${metrics.tableCapacity}`} tone="maize" />
        <StatCard label="Stock critico" value={String(metrics.criticalStock)} tone="ink" />
      </div>

      <ModulePanel title="Áreas del restaurante" port="Vistas disponibles" description="Accede rápidamente a cada frente de trabajo según tu rol y el momento del turno.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleModules.map((module) => {
            const Icon = module.icon;
            return (
              <article key={module.id} className="rounded-3xl border border-stone-200 bg-oatmeal p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-white p-3 text-herb shadow-soft">
                    <Icon size={20} />
                  </div>
                  <Badge tone="blue">{module.port}</Badge>
                </div>
                <h3 className="mt-4 text-lg font-black">{module.title}</h3>
                <p className="mt-2 text-sm text-stone-500">{module.summary}</p>
              </article>
            );
          })}
        </div>
      </ModulePanel>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <ModulePanel title="Pulso comercial" port="Ventas recientes" description="Tendencia semanal de ingresos y actividad del restaurante.">
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={data.sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece8df" />
                <XAxis dataKey="dia" />
                <Tooltip />
                <Area type="monotone" dataKey="ventas" stroke="#2f6f4e" fill="#2f6f4e" fillOpacity={0.16} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ModulePanel>

        <div className="space-y-5">
          <ModulePanel title="Alertas del turno" port="Seguimiento en tiempo real" description="Novedades relevantes para actuar a tiempo en sala, cocina o inventario.">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-stone-200 bg-white p-3">
                  <p className="font-bold">{alert.titulo}</p>
                  <p className="mt-1 text-sm text-stone-500">{alert.descripcion}</p>
                </div>
              ))}
            </div>
          </ModulePanel>

          <ModulePanel title="Productos destacados" port="Venta destacada" description="Referencias rápidas de lo que más se está moviendo en la carta.">
            <div className="space-y-3">
              {data.featuredProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <SafeImage className="h-12 w-12 rounded-2xl object-cover" src={product.imagenUrl} alt={product.nombre} fallback="/images/restaurant-hero.png" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{product.nombre}</p>
                    <p className="text-sm text-stone-500">{42 - index * 7} vendidos</p>
                  </div>
                  <Badge tone="green">BOB {product.precio.toFixed(2)}</Badge>
                </div>
              ))}
            </div>
          </ModulePanel>
        </div>
      </div>
    </div>
  );
}
