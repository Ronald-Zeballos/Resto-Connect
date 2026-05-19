import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { demoProductos } from "../data/demo";
import { Badge, PageHeader } from "../components/ui";

export function Menu() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const categories = ["Todas", ...Array.from(new Set(demoProductos.map((item) => item.categoria)))];
  const products = useMemo(() => demoProductos.filter((item) => (category === "Todas" || item.categoria === category) && item.nombre.toLowerCase().includes(query.toLowerCase())), [category, query]);

  return (
    <div className="space-y-6">
      <PageHeader title="Menu visual" eyebrow="Catalogo conectado al inventario" action={<button className="btn-primary">Nuevo producto</button>} />
      <div className="card grid gap-3 p-4 md:grid-cols-[1fr_240px]">
        <label className="relative">
          <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
          <input className="input pl-10" placeholder="Buscar producto" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className="relative">
          <SlidersHorizontal className="absolute left-3 top-2.5 text-stone-400" size={18} />
          <select className="input pl-10" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((producto) => (
          <article key={producto.id} className="card overflow-hidden">
            <img className="h-44 w-full object-cover" src={producto.imagenUrl} alt={producto.nombre} />
            <div className="p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="font-black">{producto.nombre}</h2>
                <Badge tone={producto.disponible ? "green" : "red"}>{producto.disponible ? "Disponible" : "Pausado"}</Badge>
              </div>
              <p className="min-h-10 text-sm text-stone-500">{producto.descripcion}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-black">BOB {producto.precio.toFixed(2)}</span>
                <Badge>{producto.categoria}</Badge>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
