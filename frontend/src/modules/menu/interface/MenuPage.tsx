import { PencilLine, Power, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, ApiError, withDemoFallback } from "../../../core/http/httpClient";
import { mapCategories, mapProducts } from "../../../core/http/mappers";
import { Badge, InlineFeedback, ModulePanel, PageHeader, SafeImage } from "../../../shared/ui/primitives";
import { demoCategorias, demoProductos } from "../../../data/demo";
import type { Categoria, Producto } from "../../../types";

const emptyForm = {
  id: "",
  nombre: "",
  descripcion: "",
  precio: "0",
  categoriaId: "",
  imagenUrl: "",
  activo: true
};

export function MenuPage() {
  const [products, setProducts] = useState<Producto[]>(demoProductos);
  const [categories, setCategories] = useState<Categoria[]>(demoCategorias);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [editing, setEditing] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCatalog() {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await withDemoFallback(async () => {
        const [productsRaw, categoriesRaw] = await Promise.all([api.productos(), api.categorias()]);
        return {
          products: mapProducts(productsRaw),
          categories: mapCategories(categoriesRaw)
        };
      }, async () => ({
        products: demoProductos,
        categories: demoCategorias
      }));

      setProducts(snapshot.products);
      setCategories(snapshot.categories);
      if (!editing.id && snapshot.products[0]) {
        const first = snapshot.products[0];
        setEditing({
          id: first.id,
          nombre: first.nombre,
          descripcion: first.descripcion,
          precio: String(first.precio),
          categoriaId: first.categoriaId || snapshot.categories[0]?.id || "",
          imagenUrl: first.imagenUrl,
          activo: first.activo
        });
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cargar el menu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCatalog();
  }, []);

  const categoryOptions = useMemo(() => ["Todas", ...Array.from(new Set(products.map((item) => item.categoria)))], [products]);
  const filteredProducts = useMemo(() => {
    return products.filter((item) => (category === "Todas" || item.categoria === category) && item.nombre.toLowerCase().includes(query.toLowerCase()));
  }, [category, products, query]);

  function startEditing(product: Producto) {
    setEditing({
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: String(product.precio),
      categoriaId: product.categoriaId || categories[0]?.id || "",
      imagenUrl: product.imagenUrl,
      activo: product.activo
    });
  }

  async function saveProduct() {
    if (!editing.id) return;
    setSaving(true);
    setError(null);
    try {
      try {
        await api.actualizarProducto(editing.id, {
          nombre: editing.nombre,
          descripcion: editing.descripcion,
          precio: Number(editing.precio),
          categoriaId: editing.categoriaId,
          imagenUrl: editing.imagenUrl,
          activo: editing.activo
        });
        await loadCatalog();
      } catch (reason) {
        if (reason instanceof ApiError) throw reason;
        setProducts((current) => current.map((product) => product.id === editing.id ? {
          ...product,
          nombre: editing.nombre,
          descripcion: editing.descripcion,
          precio: Number(editing.precio),
          categoriaId: editing.categoriaId,
          categoria: categories.find((item) => item.id === editing.categoriaId)?.nombre || product.categoria,
          imagenUrl: editing.imagenUrl,
          activo: editing.activo,
          disponible: editing.activo ? product.disponible : false
        } : product));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo actualizar el producto.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(product: Producto) {
    setSaving(true);
    setError(null);
    try {
      try {
        if (product.activo) {
          await api.desactivarProducto(product.id);
        } else {
          await api.activarProducto(product.id);
        }
        await loadCatalog();
      } catch (reason) {
        if (reason instanceof ApiError) throw reason;
        setProducts((current) => current.map((item) => item.id === product.id ? { ...item, activo: !item.activo, disponible: item.activo ? false : true } : item));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cambiar la disponibilidad del producto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Carta y precios" eyebrow="Actualiza precios, fotos y disponibilidad en tiempo real" action={<button className="btn-primary rounded-2xl" onClick={loadCatalog}>Actualizar carta</button>} />
      <InlineFeedback loading={loading || saving} error={error} />

      <ModulePanel title="Buscar en la carta" port="Catálogo comercial" description="Revisa productos, precios y disponibilidad antes de publicar cambios al equipo.">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="relative">
            <Search className="absolute left-3 top-3 text-stone-400" size={18} />
            <input className="input pl-10" placeholder="Buscar producto" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label className="relative">
            <SlidersHorizontal className="absolute left-3 top-3 text-stone-400" size={18} />
            <select className="input pl-10" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categoryOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </ModulePanel>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <article key={product.id} className="card overflow-hidden">
              <SafeImage className="h-44 w-full object-cover" src={product.imagenUrl} alt={product.nombre} fallback="/images/restaurant-hero.png" />
              <div className="p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-black">{product.nombre}</h2>
                    <p className="mt-1 text-sm text-stone-500">{product.descripcion}</p>
                  </div>
                  <Badge tone={product.disponible ? "green" : "red"}>{product.disponible ? "Disponible" : "Sin stock"}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-black">BOB {product.precio.toFixed(2)}</span>
                  <Badge>{product.categoria}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button className="btn-secondary rounded-2xl" onClick={() => startEditing(product)}><PencilLine size={16} /> Editar</button>
                  <button className="btn-secondary rounded-2xl" onClick={() => toggleActive(product)}><Power size={16} /> {product.activo ? "Desactivar" : "Activar"}</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="card h-max p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Editor del menu</p>
          <h2 className="mt-2 text-xl font-black">Precio, imagen y estado</h2>
          <div className="mt-4 space-y-4">
            <label>
              <span className="mb-1 block text-sm font-bold">Nombre</span>
              <input className="input" value={editing.nombre} onChange={(event) => setEditing((current) => ({ ...current, nombre: event.target.value }))} />
            </label>
            <label>
              <span className="mb-1 block text-sm font-bold">Descripcion</span>
              <textarea className="input min-h-24" value={editing.descripcion} onChange={(event) => setEditing((current) => ({ ...current, descripcion: event.target.value }))} />
            </label>
            <label>
              <span className="mb-1 block text-sm font-bold">Precio</span>
              <input className="input" type="number" min="0.01" step="0.01" value={editing.precio} onChange={(event) => setEditing((current) => ({ ...current, precio: event.target.value }))} />
            </label>
            <label>
              <span className="mb-1 block text-sm font-bold">Categoria</span>
              <select className="input" value={editing.categoriaId} onChange={(event) => setEditing((current) => ({ ...current, categoriaId: event.target.value }))}>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-sm font-bold">URL de imagen</span>
              <input className="input" value={editing.imagenUrl} onChange={(event) => setEditing((current) => ({ ...current, imagenUrl: event.target.value }))} />
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3">
              <input type="checkbox" checked={editing.activo} onChange={(event) => setEditing((current) => ({ ...current, activo: event.target.checked }))} />
              <span className="text-sm font-bold">Producto activo</span>
            </label>
            <button className="btn-primary w-full rounded-2xl" disabled={!editing.id || saving} onClick={saveProduct}>Guardar cambios</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
