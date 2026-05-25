import { useEffect, useState, type ChangeEvent } from "react";
import { api } from "../../../core/http/httpClient";
import type { Producto } from "../../../types";
import { Pencil, Trash2, Plus, Search, ImagePlus } from "lucide-react";
import { SafeImage } from "../../../shared/ui/primitives";
import { fileToOptimizedDataUrl, IMAGE_UPLOAD_HELPER_TEXT } from "../../../shared/media/imageUpload";

export function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    nombre: "", descripcion: "", precio: 0, categoriaId: "", imagenUrl: "",
    codigoInterno: "", costo: 0, esVenta: true, esInsumo: false, impuestoAplicable: 0, unidadMedida: "UNIDAD"
  });

  useEffect(() => {
    api.productos().then((d) => setProductos(d as unknown as Producto[]));
    api.categorias().then((d) => setCategorias(d as unknown as { id: string; nombre: string }[]));
  }, []);

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.codigoInterno || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  function openEdit(p: Producto | null) {
    setEditando(p);
    setShowForm(true);
    setForm(p ? {
      nombre: p.nombre, descripcion: p.descripcion, precio: p.precio,
      categoriaId: p.categoriaId || "", imagenUrl: p.imagenUrl || "",
      codigoInterno: p.codigoInterno || "", costo: p.costo || 0,
      esVenta: p.esVenta !== false, esInsumo: p.esInsumo || false,
      impuestoAplicable: p.impuestoAplicable || 0, unidadMedida: p.unidadMedida || "UNIDAD"
    } : {
      nombre: "", descripcion: "", precio: 0, categoriaId: categorias[0]?.id || "",
      imagenUrl: "", codigoInterno: "", costo: 0, esVenta: true, esInsumo: false,
      impuestoAplicable: 0, unidadMedida: "UNIDAD"
    });
  }

  function closeForm() {
    setShowForm(false);
    setEditando(null);
    setUploadingImage(false);
  }

  async function handleImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const imageDataUrl = await fileToOptimizedDataUrl(file);
      setForm((current) => ({ ...current, imagenUrl: imageDataUrl }));
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function guardar() {
    const payload = { ...form, receta: [] };
    if (editando) {
      await api.actualizarProducto(editando.id, payload as unknown as Record<string, unknown>);
    } else {
      await api.crearProducto(payload as unknown as Record<string, unknown>);
    }
    closeForm();
    setProductos(await api.productos() as unknown as Producto[]);
  }

  async function toggleActivo(p: Producto) {
    if (p.activo) {
      await api.desactivarProducto(p.id);
    } else {
      await api.activarProducto(p.id);
    }
    setProductos(await api.productos() as unknown as Producto[]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-lighter" />
          <input className="pl-10 pr-4 py-2 w-full border border-ink-200 rounded-lg text-sm" placeholder="Buscar por nombre o codigo..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        <button onClick={() => openEdit(null)} className="ml-auto flex items-center gap-1 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium"><Plus className="w-4 h-4" /> Nuevo</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center" onClick={closeForm}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{editando ? "Editar" : "Nuevo"} producto</h2>
            <div className="grid grid-cols-2 gap-4">
              <input className="input" placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              <input className="input" placeholder="Codigo interno" value={form.codigoInterno} onChange={e => setForm({ ...form, codigoInterno: e.target.value })} />
              <textarea className="input col-span-2" placeholder="Descripcion" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              <div className="col-span-2 space-y-3">
                <SafeImage className="h-48 w-full rounded-xl border border-ink-200 object-cover" src={form.imagenUrl} alt={form.nombre || "Vista previa"} fallback="/images/restaurant-hero.png" />
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 px-4 py-3 text-sm font-medium text-ink">
                  <ImagePlus className="w-4 h-4" />
                  {uploadingImage ? "Procesando imagen..." : "Subir imagen"}
                  <input className="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleImageSelected} />
                </label>
                <p className="text-xs text-ink-lighter">{IMAGE_UPLOAD_HELPER_TEXT}</p>
              </div>
              <label className="col-span-2 flex items-center gap-4 text-sm font-medium">
                <label className="flex items-center gap-1"><input type="checkbox" checked={form.esVenta} onChange={e => setForm({ ...form, esVenta: e.target.checked })} /> Venta</label>
                <label className="flex items-center gap-1"><input type="checkbox" checked={form.esInsumo} onChange={e => setForm({ ...form, esInsumo: e.target.checked })} /> Insumo</label>
              </label>
              <div><label className="text-sm">Precio venta</label>
                <input type="number" className="input" value={form.precio} onChange={e => setForm({ ...form, precio: Number(e.target.value) })} /></div>
              <div><label className="text-sm">Costo</label>
                <input type="number" className="input" value={form.costo} onChange={e => setForm({ ...form, costo: Number(e.target.value) })} /></div>
              <div><label className="text-sm">Categoria</label>
                <select className="input" value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })}>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select></div>
              <div><label className="text-sm">Unidad medida</label>
                <input className="input" value={form.unidadMedida} onChange={e => setForm({ ...form, unidadMedida: e.target.value })} /></div>
              <div><label className="text-sm">Impuesto %</label>
                <input type="number" className="input" value={form.impuestoAplicable} onChange={e => setForm({ ...form, impuestoAplicable: Number(e.target.value) })} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn btn-secondary" onClick={closeForm}>Cancelar</button>
              <button className="btn btn-primary" disabled={uploadingImage} onClick={guardar}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {filtrados.map(p => (
          <div key={p.id} className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-ink-200">
            {p.imagenUrl && <img src={p.imagenUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{p.nombre}</span>
                {p.codigoInterno && <span className="text-xs text-ink-lighter font-mono">{p.codigoInterno}</span>}
                <span className={`text-xs px-2 py-0.5 rounded ${p.disponible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{p.disponible ? "Disponible" : "No disponible"}</span>
              </div>
              <div className="text-sm text-ink-lighter">
                <span>Bs {p.precio.toFixed(2)}</span>
                {(p.costo || 0) > 0 && <span className="ml-3">Costo: Bs {p.costo!.toFixed(2)}</span>}
                {p.esVenta && <span className="ml-3 text-blue-600">Venta</span>}
                {p.esInsumo && <span className="ml-3 text-amber-600">Insumo</span>}
                <span className="ml-3">{p.categoria}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEdit(p)} className="p-2 text-ink-lighter hover:text-accent"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => toggleActivo(p)} className="p-2 text-ink-lighter hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
