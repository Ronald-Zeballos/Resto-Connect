import { ExternalLink, Plus, Search, Store, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, ModulePanel, PageHeader, StatCard } from "../../../shared/ui/primitives";

type BenchmarkEntry = {
  id: string;
  producto: string;
  categoria: string;
  canal: "PEDIDOS_YA" | "DELIVERY" | "INSTAGRAM";
  competidor: string;
  miPrecio: number;
  precioCompetencia: number;
  fuenteUrl: string;
  capturadoEn: string;
  notas: string;
};

const benchmarkSeed: BenchmarkEntry[] = [
  {
    id: "bench-1",
    producto: "Hamburguesa con queso",
    categoria: "Hamburguesas",
    canal: "PEDIDOS_YA",
    competidor: "Burger House Centro",
    miPrecio: 20,
    precioCompetencia: 24,
    fuenteUrl: "https://www.pedidosya.com.bo/",
    capturadoEn: "2026-05-24",
    notas: "Incluye papas en combo sugerido, pero la pieza individual esta mas alta."
  },
  {
    id: "bench-2",
    producto: "Taco de pollo",
    categoria: "Tacos y wraps",
    canal: "PEDIDOS_YA",
    competidor: "Taqueria Urbana",
    miPrecio: 16,
    precioCompetencia: 15,
    fuenteUrl: "https://www.pedidosya.com.bo/",
    capturadoEn: "2026-05-24",
    notas: "Precio un poco mas agresivo; revisar margen o propuesta de valor."
  },
  {
    id: "bench-3",
    producto: "Ensalada cesar",
    categoria: "Ensaladas",
    canal: "PEDIDOS_YA",
    competidor: "Green Bowl House",
    miPrecio: 22,
    precioCompetencia: 26,
    fuenteUrl: "https://www.pedidosya.com.bo/",
    capturadoEn: "2026-05-24",
    notas: "La competencia cobra mas por toppings premium."
  },
  {
    id: "bench-4",
    producto: "Refresco regular",
    categoria: "Bebidas",
    canal: "DELIVERY",
    competidor: "Fast Combo Norte",
    miPrecio: 6,
    precioCompetencia: 7,
    fuenteUrl: "https://www.pedidosya.com.bo/",
    capturadoEn: "2026-05-24",
    notas: "Sin mayor diferencia competitiva."
  }
];

const channelLabels: Record<BenchmarkEntry["canal"], string> = {
  PEDIDOS_YA: "PedidosYa",
  DELIVERY: "Delivery local",
  INSTAGRAM: "Instagram"
};

export function ComprasPage() {
  const [entries, setEntries] = useState<BenchmarkEntry[]>(benchmarkSeed);
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<"TODOS" | BenchmarkEntry["canal"]>("TODOS");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    producto: "",
    categoria: "Hamburguesas",
    canal: "PEDIDOS_YA" as BenchmarkEntry["canal"],
    competidor: "",
    miPrecio: "",
    precioCompetencia: "",
    fuenteUrl: "https://www.pedidosya.com.bo/",
    notas: ""
  });

  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (channel !== "TODOS" && entry.canal !== channel) return false;
      if (!needle) return true;
      return `${entry.producto} ${entry.competidor} ${entry.categoria}`.toLowerCase().includes(needle);
    });
  }, [channel, entries, query]);

  const summary = useMemo(() => {
    const cheaper = entries.filter((entry) => entry.precioCompetencia < entry.miPrecio).length;
    const moreExpensive = entries.filter((entry) => entry.precioCompetencia > entry.miPrecio).length;
    const avgGap = entries.length
      ? entries.reduce((sum, entry) => sum + (entry.precioCompetencia - entry.miPrecio), 0) / entries.length
      : 0;
    return { cheaper, moreExpensive, avgGap };
  }, [entries]);

  const comparisons = useMemo(() => {
    return filteredEntries.map((entry) => {
      const diff = entry.precioCompetencia - entry.miPrecio;
      return {
        ...entry,
        diff,
        status: diff < 0 ? "Competencia mas barata" : diff > 0 ? "Nosotros mas baratos" : "Empate"
      };
    });
  }, [filteredEntries]);

  function addEntry() {
    if (!form.producto || !form.competidor || !form.miPrecio || !form.precioCompetencia) return;
    setEntries((current) => [
      {
        id: `bench-${Date.now()}`,
        producto: form.producto,
        categoria: form.categoria,
        canal: form.canal,
        competidor: form.competidor,
        miPrecio: Number(form.miPrecio),
        precioCompetencia: Number(form.precioCompetencia),
        fuenteUrl: form.fuenteUrl,
        capturadoEn: new Date().toISOString().slice(0, 10),
        notas: form.notas
      },
      ...current
    ]);
    setShowForm(false);
    setForm({
      producto: "",
      categoria: "Hamburguesas",
      canal: "PEDIDOS_YA",
      competidor: "",
      miPrecio: "",
      precioCompetencia: "",
      fuenteUrl: "https://www.pedidosya.com.bo/",
      notas: ""
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Benchmarking competitivo"
        eyebrow="Radar de precios de la competencia"
        action={<button className="btn-primary rounded-2xl" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Nueva observacion</button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Productos monitoreados" value={String(entries.length)} tone="ink" />
        <StatCard label="Competencia mas barata" value={String(summary.cheaper)} tone="tomato" />
        <StatCard label="Nosotros mas baratos" value={String(summary.moreExpensive)} tone="herb" />
        <StatCard label="Brecha promedio" value={`${summary.avgGap >= 0 ? "+" : ""}Bs ${summary.avgGap.toFixed(2)}`} tone="maize" />
      </div>

      <ModulePanel
        title="Fuentes de benchmarking"
        port="Captura asistida"
        description="Esta vista reemplaza compras por monitoreo competitivo. Puedes guardar observaciones con enlaces reales de delivery y comparar precios sin mezclarlo con reposicion de inventario."
        action={<button className="btn-secondary rounded-2xl text-sm" onClick={() => window.open("https://www.pedidosya.com.bo/", "_blank", "noopener,noreferrer")}><ExternalLink className="h-4 w-4" /> Abrir PedidosYa</button>}
      >
        <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          Plataformas como PedidosYa cargan gran parte del catalogo de forma dinamica y a veces restringen scraping directo. Por eso aqui dejamos un benchmarking asistido: guardas el enlace, el precio observado y la decision comercial que quieras tomar.
        </div>
      </ModulePanel>

      <ModulePanel
        title="Comparador de mercado"
        port="Precios observados"
        description="Filtra por canal, revisa quien está mas barato y detecta donde conviene ajustar precio, combo o propuesta de valor."
      >
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input className="input pl-10" placeholder="Buscar producto, categoria o competidor..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["TODOS", "PEDIDOS_YA", "DELIVERY", "INSTAGRAM"] as const).map((item) => (
              <button
                key={item}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${channel === item ? "bg-herb text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                onClick={() => setChannel(item)}
              >
                {item === "TODOS" ? "Todos" : channelLabels[item]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {comparisons.map((entry) => (
            <article key={entry.id} className="rounded-3xl border border-stone-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">{entry.categoria}</p>
                  <h3 className="mt-2 text-xl font-black text-ink">{entry.producto}</h3>
                  <p className="mt-1 text-sm text-stone-500">{entry.competidor} · {channelLabels[entry.canal]}</p>
                </div>
                <Badge tone={entry.diff < 0 ? "red" : entry.diff > 0 ? "green" : "blue"}>{entry.status}</Badge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Nuestro precio</p>
                  <p className="mt-1 text-lg font-black">Bs {entry.miPrecio.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Competencia</p>
                  <p className="mt-1 text-lg font-black">Bs {entry.precioCompetencia.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
                <span className="text-sm text-stone-500">Brecha</span>
                <span className={`font-black ${entry.diff < 0 ? "text-red-600" : entry.diff > 0 ? "text-herb" : "text-ink"}`}>
                  {entry.diff >= 0 ? "+" : ""}Bs {entry.diff.toFixed(2)}
                </span>
              </div>

              <p className="mt-4 text-sm text-stone-500">{entry.notas}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-stone-400">Capturado el {entry.capturadoEn}</span>
                <a className="inline-flex items-center gap-2 font-semibold text-herb hover:underline" href={entry.fuenteUrl} rel="noreferrer" target="_blank">
                  Ver fuente <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {!comparisons.length ? <p className="mt-4 text-sm text-stone-500">No hay observaciones que coincidan con ese filtro.</p> : null}
      </ModulePanel>

      <ModulePanel
        title="Lectura rapida"
        port="Decision comercial"
        description="Resumen corto para decidir si toca ajustar precio, combo, porcion o simplemente comunicar mejor el valor del plato."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-3 text-herb">
              <TrendingUp className="h-5 w-5" />
              <p className="font-black">Donde vamos bien</p>
            </div>
            <p className="mt-3 text-sm text-stone-500">Tus ensaladas y bebidas demo están por debajo o muy cerca del mercado, así que ahí puedes competir sin tocar mucho margen.</p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-3 text-red-600">
              <TrendingDown className="h-5 w-5" />
              <p className="font-black">Donde vigilar</p>
            </div>
            <p className="mt-3 text-sm text-stone-500">Los tacos aparecen más sensibles al precio. Conviene revisar si ajustar Bs 1 o reforzar la percepción con salsa, combo o bebida.</p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-3 text-ink">
              <Store className="h-5 w-5" />
              <p className="font-black">Siguiente paso</p>
            </div>
            <p className="mt-3 text-sm text-stone-500">Añade observaciones nuevas por zona, horario o canal. Así el benchmarking deja de ser una foto y se vuelve un tablero vivo.</p>
          </div>
        </div>
      </ModulePanel>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-soft" onClick={(event) => event.stopPropagation()}>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Nueva observacion de mercado</p>
            <h2 className="mt-2 text-2xl font-black text-ink">Guardar precio de la competencia</h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input className="input" placeholder="Producto propio" value={form.producto} onChange={(event) => setForm({ ...form, producto: event.target.value })} />
              <input className="input" placeholder="Competidor" value={form.competidor} onChange={(event) => setForm({ ...form, competidor: event.target.value })} />
              <select className="input" value={form.categoria} onChange={(event) => setForm({ ...form, categoria: event.target.value })}>
                <option>Hamburguesas</option>
                <option>Tacos y wraps</option>
                <option>Ensaladas</option>
                <option>Bebidas</option>
              </select>
              <select className="input" value={form.canal} onChange={(event) => setForm({ ...form, canal: event.target.value as BenchmarkEntry["canal"] })}>
                <option value="PEDIDOS_YA">PedidosYa</option>
                <option value="DELIVERY">Delivery local</option>
                <option value="INSTAGRAM">Instagram</option>
              </select>
              <input className="input" type="number" step="0.01" placeholder="Mi precio" value={form.miPrecio} onChange={(event) => setForm({ ...form, miPrecio: event.target.value })} />
              <input className="input" type="number" step="0.01" placeholder="Precio competencia" value={form.precioCompetencia} onChange={(event) => setForm({ ...form, precioCompetencia: event.target.value })} />
              <input className="input sm:col-span-2" placeholder="URL de la fuente" value={form.fuenteUrl} onChange={(event) => setForm({ ...form, fuenteUrl: event.target.value })} />
              <textarea className="input min-h-28 sm:col-span-2" placeholder="Notas comerciales" value={form.notas} onChange={(event) => setForm({ ...form, notas: event.target.value })} />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-secondary rounded-2xl" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn-primary rounded-2xl" onClick={addEntry}>Guardar observacion</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
