import { Check, ClipboardCheck, CreditCard, FileText } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { demoAlertas, demoIncidencias, demoInventario, demoOrdenes, demoPredicciones, salesData } from "../data/demo";
import { Badge, PageHeader, Progress, StatCard } from "../components/ui";

export function Pagos() {
  return (
    <div className="space-y-6">
      <PageHeader title="Pagos y facturacion" eyebrow="Cobro, pasarela y factura imprimible" />
      <div className="grid gap-4 lg:grid-cols-3">
        {["Pedido p-1001", "Pedido p-1002", "Pedido p-1003"].map((pedido, index) => (
          <article key={pedido} className="card p-5">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-black">{pedido}</h2><Badge tone="yellow">Pendiente</Badge></div>
            <p className="text-3xl font-black">BOB {[66, 41, 29][index]}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="btn-primary"><CreditCard size={16} /> Cobrar</button>
              <button className="btn-secondary"><FileText size={16} /> Factura</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function Inventario() {
  return (
    <div className="space-y-6">
      <PageHeader title="Inventario inteligente" eyebrow="Stock, movimientos y alertas" image="/images/inventory-shelves.jpg" action={<button className="btn-primary">Registrar movimiento</button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Items activos" value={String(demoInventario.length)} />
        <StatCard label="Bajo reorden" value="3" tone="maize" />
        <StatCard label="Alertas abiertas" value={String(demoAlertas.length)} tone="tomato" />
      </div>
      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr><th className="p-4">Item</th><th>ABC</th><th>Stock</th><th>Reorden</th><th>Costo</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {demoInventario.map((item) => {
                const percent = (item.stockActual / item.stockMaximo) * 100;
                const low = item.stockActual <= item.puntoReorden;
                return (
                  <tr key={item.id} className="border-t border-stone-100">
                    <td className="p-4"><b>{item.nombre}</b><p className="text-stone-500">{item.descripcion}</p></td>
                    <td><Badge tone={item.clasificacionAbc === "ALTA" ? "green" : item.clasificacionAbc === "MEDIA" ? "yellow" : "neutral"}>{item.clasificacionAbc}</Badge></td>
                    <td className="w-64"><Progress value={percent} /><p className="mt-1 text-xs">{item.stockActual} / {item.stockMaximo} {item.unidadMedida}</p></td>
                    <td>{item.puntoReorden}</td>
                    <td>BOB {item.costoUnitario}</td>
                    <td><Badge tone={low ? "red" : "green"}>{low ? "Reordenar" : "OK"}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function Compras() {
  return (
    <div className="space-y-6">
      <PageHeader title="Prediccion y compras" eyebrow="Reposicion sugerida por consumo" action={<button className="btn-primary">Generar prediccion</button>} />
      <div className="grid gap-4 lg:grid-cols-3">
        {demoPredicciones.map((prediccion) => (
          <article key={prediccion.id} className="card p-5">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-black">{prediccion.item}</h2><Badge tone={prediccion.nivelRiesgo === "ALTO" ? "red" : prediccion.nivelRiesgo === "MEDIO" ? "yellow" : "green"}>{prediccion.nivelRiesgo}</Badge></div>
            <p className="text-sm text-stone-500">Dias hasta agotamiento</p>
            <p className="text-3xl font-black">{prediccion.diasHastaAgotamiento}</p>
            <p className="mt-3 text-sm">Sugerido: <b>{prediccion.cantidadSugeridaCompra}</b> · Confianza <b>{prediccion.confianza}%</b></p>
            <button className="btn-secondary mt-4 w-full">Crear orden</button>
          </article>
        ))}
      </div>
      <section className="card p-5">
        <h2 className="mb-4 text-lg font-black">Ordenes de compra</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {demoOrdenes.map((orden) => <div key={orden.id} className="rounded-md border border-stone-200 p-4"><div className="flex justify-between"><b>{orden.proveedor}</b><Badge>{orden.estado}</Badge></div><p className="mt-2 text-sm text-stone-500">{orden.fecha} · BOB {orden.total}</p></div>)}
        </div>
      </section>
    </div>
  );
}

export function Incidencias() {
  return (
    <div className="space-y-6">
      <PageHeader title="Incidencias" eyebrow="Seguimiento operativo" action={<button className="btn-primary">Nueva incidencia</button>} />
      <div className="grid gap-4 lg:grid-cols-3">
        {demoIncidencias.map((incidencia) => (
          <article key={incidencia.id} className="card p-5">
            <div className="mb-4 flex justify-between gap-3"><h2 className="font-black">{incidencia.titulo}</h2><Badge tone={incidencia.prioridad === "ALTA" ? "red" : "yellow"}>{incidencia.prioridad}</Badge></div>
            <p className="text-sm text-stone-500">{incidencia.categoria}</p>
            <button className="btn-secondary mt-5"><Check size={16} /> Resolver</button>
          </article>
        ))}
      </div>
    </div>
  );
}

export function Reportes() {
  const pie = [{ name: "Efectivo", value: 52 }, { name: "Tarjeta", value: 31 }, { name: "QR", value: 17 }];
  return (
    <div className="space-y-6">
      <PageHeader title="Reportes" eyebrow="Ventas, productos, meseros e inventario" />
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="card p-5"><h2 className="mb-4 text-lg font-black">Ventas por rango</h2><div className="h-72"><ResponsiveContainer><BarChart data={salesData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="dia" /><YAxis /><Tooltip /><Bar dataKey="ventas" fill="#2f6f4e" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></section>
        <section className="card p-5"><h2 className="mb-4 text-lg font-black">Metodos de pago</h2><div className="h-72"><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" nameKey="name" fill="#c7442f" label /><Legend /><Tooltip /></PieChart></ResponsiveContainer></div></section>
      </div>
    </div>
  );
}

export function Configuracion() {
  return (
    <div className="space-y-6">
      <PageHeader title="Configuracion" eyebrow="Datos fiscales y operativos" />
      <form className="card grid gap-4 p-5 md:grid-cols-2">
        {["Nombre comercial", "Razon social", "NIT", "Telefono", "Direccion", "Email", "Moneda", "Impuesto %"].map((field) => <label key={field}><span className="mb-1 block text-sm font-bold">{field}</span><input className="input" defaultValue={field === "Nombre comercial" ? "RestoConnect Pro" : field === "Moneda" ? "BOB" : field === "Impuesto %" ? "13.00" : ""} /></label>)}
        <button className="btn-primary md:col-span-2" type="button"><ClipboardCheck size={17} /> Guardar configuracion</button>
      </form>
    </div>
  );
}
