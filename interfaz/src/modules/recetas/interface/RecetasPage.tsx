import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ChefHat, ImagePlus, Plus, Search, Trash2 } from "lucide-react";
import { api } from "../../../core/http/httpClient";
import { mapCategories, mapInventoryItems, mapProducts } from "../../../core/http/mappers";
import type { Categoria, InventarioItem, Producto, RecetaItem } from "../../../types";
import { SafeImage } from "../../../shared/ui/primitives";
import { fileToOptimizedDataUrl, IMAGE_UPLOAD_HELPER_TEXT } from "../../../shared/media/imageUpload";

type IngredienteDraft = {
  itemInventarioId: string;
  cantidadNecesaria: number;
};

type NuevaRecetaForm = {
  nombre: string;
  descripcion: string;
  precio: string;
  categoriaId: string;
  codigoInterno: string;
  imagenUrl: string;
  receta: Array<{ itemInventarioId: string; cantidadNecesaria: string }>;
};

const emptyIngredientDraft: IngredienteDraft = { itemInventarioId: "", cantidadNecesaria: 0 };

function createEmptyRecipeForm(categoriaId = ""): NuevaRecetaForm {
  return {
    nombre: "",
    descripcion: "",
    precio: "",
    categoriaId,
    codigoInterno: "",
    imagenUrl: "",
    receta: [{ itemInventarioId: "", cantidadNecesaria: "" }]
  };
}

export function RecetasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [items, setItems] = useState<InventarioItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [recetas, setRecetas] = useState<Record<string, RecetaItem[]>>({});
  const [abierto, setAbierto] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, IngredienteDraft>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [newRecipeForm, setNewRecipeForm] = useState<NuevaRecetaForm>(createEmptyRecipeForm());

  useEffect(() => {
    loadWorkspace();
  }, []);

  async function loadWorkspace() {
    try {
      const [productsRaw, categoriesRaw, inventoryRaw] = await Promise.all([
        api.productos(),
        api.categorias(),
        api.inventario()
      ]);
      const mappedProducts = mapProducts(productsRaw);
      const mappedCategories = mapCategories(categoriesRaw);
      const mappedItems = mapInventoryItems(inventoryRaw);
      setProductos(mappedProducts);
      setCategorias(mappedCategories);
      setItems(mappedItems);
      setNewRecipeForm((current) => current.categoriaId ? current : createEmptyRecipeForm(mappedCategories[0]?.id || ""));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudieron cargar productos e insumos.");
    }
  }

  async function cargarRecetas(productoId: string) {
    try {
      const data = await api.recetasPorProducto(productoId) as unknown as RecetaItem[];
      setRecetas((prev) => ({ ...prev, [productoId]: data }));
    } catch {
      setRecetas((prev) => ({ ...prev, [productoId]: [] }));
    }
  }

  function toggle(productoId: string) {
    setNotice("");
    setError("");
    if (abierto === productoId) {
      setAbierto(null);
      return;
    }
    setAbierto(productoId);
    setDrafts((current) => ({ ...current, [productoId]: current[productoId] ?? emptyIngredientDraft }));
    if (!recetas[productoId]) void cargarRecetas(productoId);
  }

  function updateDraft(productoId: string, patch: Partial<IngredienteDraft>) {
    setDrafts((current) => ({
      ...current,
      [productoId]: { ...(current[productoId] ?? emptyIngredientDraft), ...patch }
    }));
  }

  async function agregarIngrediente(productoId: string) {
    const draft = drafts[productoId] ?? emptyIngredientDraft;
    if (!draft.itemInventarioId || draft.cantidadNecesaria <= 0) return;
    setError("");
    try {
      await api.agregarReceta(productoId, draft as unknown as Record<string, unknown>);
      setDrafts((current) => ({ ...current, [productoId]: emptyIngredientDraft }));
      await cargarRecetas(productoId);
      setNotice("Ingrediente agregado correctamente.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo agregar el ingrediente.");
    }
  }

  async function eliminarIngrediente(productoId: string, receta: RecetaItem) {
    if (!receta.id) {
      setError("No pudimos identificar el ingrediente de la receta para eliminarlo.");
      return;
    }
    setError("");
    try {
      await api.eliminarReceta(productoId, receta.id);
      await cargarRecetas(productoId);
      setNotice("Ingrediente eliminado.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo eliminar el ingrediente.");
    }
  }

  async function handleImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError("");
    try {
      const imageDataUrl = await fileToOptimizedDataUrl(file);
      setNewRecipeForm((current) => ({ ...current, imagenUrl: imageDataUrl }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cargar la imagen.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  function addRecipeLine() {
    setNewRecipeForm((current) => ({
      ...current,
      receta: [...current.receta, { itemInventarioId: "", cantidadNecesaria: "" }]
    }));
  }

  function removeRecipeLine(index: number) {
    setNewRecipeForm((current) => ({
      ...current,
      receta: current.receta.length === 1 ? current.receta : current.receta.filter((_, lineIndex) => lineIndex !== index)
    }));
  }

  function updateRecipeLine(index: number, patch: Partial<{ itemInventarioId: string; cantidadNecesaria: string }>) {
    setNewRecipeForm((current) => ({
      ...current,
      receta: current.receta.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line)
    }));
  }

  function resetCreateForm() {
    setShowCreateForm(false);
    setUploadingImage(false);
    setNewRecipeForm(createEmptyRecipeForm(categorias[0]?.id || ""));
  }

  async function crearNuevaReceta() {
    const recetaLimpia = newRecipeForm.receta
      .filter((line) => line.itemInventarioId && Number(line.cantidadNecesaria) > 0)
      .map((line) => ({
        itemInventarioId: line.itemInventarioId,
        cantidadNecesaria: Number(line.cantidadNecesaria)
      }));

    if (!newRecipeForm.nombre.trim() || !newRecipeForm.descripcion.trim() || Number(newRecipeForm.precio) <= 0 || !newRecipeForm.categoriaId || !recetaLimpia.length) {
      setError("Completa nombre, descripcion, precio, categoria y al menos un ingrediente.");
      return;
    }

    setSavingCreate(true);
    setError("");
    setNotice("");
    try {
      await api.crearProducto({
        nombre: newRecipeForm.nombre.trim(),
        descripcion: newRecipeForm.descripcion.trim(),
        precio: Number(newRecipeForm.precio),
        categoriaId: newRecipeForm.categoriaId,
        imagenUrl: newRecipeForm.imagenUrl,
        codigoInterno: newRecipeForm.codigoInterno.trim(),
        costo: 0,
        esVenta: true,
        esInsumo: false,
        impuestoAplicable: 0,
        unidadMedida: "PLATO",
        receta: recetaLimpia
      });
      await loadWorkspace();
      resetCreateForm();
      setNotice("Nueva receta creada correctamente.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo crear la receta.");
    } finally {
      setSavingCreate(false);
    }
  }

  const filtrados = useMemo(() => productos.filter((producto) => producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) && producto.activo), [busqueda, productos]);

  return (
    <div className="space-y-4">
      {(notice || error) ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
          {error || notice}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Recetas y combos</h1>
          <p className="text-sm text-ink-lighter">Edita ingredientes o crea un plato nuevo con su receta completa.</p>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-lighter" />
          <input className="pl-10 pr-4 py-2 w-full border border-ink-200 rounded-lg text-sm" placeholder="Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        <button onClick={() => setShowCreateForm(true)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium">
          <ChefHat className="w-4 h-4" />
          Nueva receta
        </button>
      </div>

      {showCreateForm ? (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={resetCreateForm}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[92vh] overflow-y-auto space-y-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Crear plato con receta</h2>
                <p className="text-sm text-ink-lighter">Define el producto y los insumos necesarios para prepararlo.</p>
              </div>
              <button className="text-sm text-ink-lighter hover:text-ink" onClick={resetCreateForm}>Cerrar</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input" placeholder="Nombre del plato" value={newRecipeForm.nombre} onChange={(event) => setNewRecipeForm((current) => ({ ...current, nombre: event.target.value }))} />
              <input className="input" placeholder="Codigo interno opcional" value={newRecipeForm.codigoInterno} onChange={(event) => setNewRecipeForm((current) => ({ ...current, codigoInterno: event.target.value }))} />
              <textarea className="input md:col-span-2 min-h-24" placeholder="Descripcion" value={newRecipeForm.descripcion} onChange={(event) => setNewRecipeForm((current) => ({ ...current, descripcion: event.target.value }))} />
              <input className="input" type="number" min="0.01" step="0.01" placeholder="Precio" value={newRecipeForm.precio} onChange={(event) => setNewRecipeForm((current) => ({ ...current, precio: event.target.value }))} />
              <select className="input" value={newRecipeForm.categoriaId} onChange={(event) => setNewRecipeForm((current) => ({ ...current, categoriaId: event.target.value }))}>
                <option value="">Seleccionar categoria...</option>
                {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <span className="block text-sm font-bold">Imagen del producto</span>
              <SafeImage className="h-52 w-full rounded-2xl border border-ink-200 object-cover" src={newRecipeForm.imagenUrl} alt={newRecipeForm.nombre || "Vista previa"} fallback="/images/restaurant-hero.png" />
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 px-4 py-3 text-sm font-medium text-ink">
                <ImagePlus className="w-4 h-4" />
                {uploadingImage ? "Procesando imagen..." : "Subir imagen"}
                <input className="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleImageSelected} />
              </label>
              <p className="text-xs text-ink-lighter">{IMAGE_UPLOAD_HELPER_TEXT}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Ingredientes de la receta</h3>
                  <p className="text-sm text-ink-lighter">Agrega todos los insumos que se consumen al preparar el plato.</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium" onClick={addRecipeLine}>
                  <Plus className="w-4 h-4" />
                  Agregar linea
                </button>
              </div>

              {newRecipeForm.receta.map((linea, index) => (
                <div key={`linea-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-3 rounded-xl border border-ink-100 p-3">
                  <select className="input text-sm" value={linea.itemInventarioId} onChange={(event) => updateRecipeLine(index, { itemInventarioId: event.target.value })}>
                    <option value="">Seleccionar insumo...</option>
                    {items.map((item) => <option key={item.id} value={item.id}>{item.nombre} ({item.unidadMedida})</option>)}
                  </select>
                  <input className="input text-sm" type="number" min="0.01" step="0.01" placeholder="Cantidad" value={linea.cantidadNecesaria} onChange={(event) => updateRecipeLine(index, { cantidadNecesaria: event.target.value })} />
                  <button className="flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600" onClick={() => removeRecipeLine(index)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={resetCreateForm}>Cancelar</button>
              <button className="btn btn-primary" disabled={savingCreate || uploadingImage} onClick={crearNuevaReceta}>
                {savingCreate ? "Guardando..." : "Crear receta"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3">
        {filtrados.map((producto) => {
          const draft = drafts[producto.id] ?? emptyIngredientDraft;
          return (
            <div key={producto.id} className="bg-white rounded-lg border border-ink-200 shadow-sm">
              <button onClick={() => toggle(producto.id)} className="flex items-center w-full px-4 py-3 text-left gap-3 hover:bg-ink-50 transition-colors">
                <span className="font-medium">{producto.nombre}</span>
                <span className="text-sm text-ink-lighter">Bs {producto.precio.toFixed(2)}</span>
                <span className="text-xs ml-auto text-ink-lighter">
                  {recetas[producto.id] ? `${recetas[producto.id].length} ingredientes` : "Sin receta"}
                </span>
              </button>

              {abierto === producto.id ? (
                <div className="px-4 pb-4 border-t border-ink-100 pt-3 space-y-3">
                  {recetas[producto.id]?.length ? recetas[producto.id].map((receta) => (
                    <div key={receta.id ?? `${producto.id}-${receta.itemInventarioId}`} className="flex items-center gap-3 text-sm">
                      <span className="flex-1">{receta.itemInventarioNombre}</span>
                      <span className="text-ink-lighter">{receta.cantidadNecesaria} {receta.unidadMedida}</span>
                      <button onClick={() => void eliminarIngrediente(producto.id, receta)} className="p-1 text-red-500 hover:text-red-700">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )) : <p className="text-sm text-ink-lighter">Este producto todavia no tiene ingredientes cargados.</p>}

                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 pt-2 border-t border-dashed border-ink-200">
                    <select className="input flex-1 text-sm" value={draft.itemInventarioId} onChange={(event) => updateDraft(producto.id, { itemInventarioId: event.target.value })}>
                      <option value="">Seleccionar insumo...</option>
                      {items.map((item) => <option key={item.id} value={item.id}>{item.nombre} ({item.unidadMedida})</option>)}
                    </select>
                    <input
                      type="number"
                      className="input w-full md:w-28 text-sm"
                      placeholder="Cant."
                      value={draft.cantidadNecesaria || ""}
                      onChange={(event) => updateDraft(producto.id, { cantidadNecesaria: Number(event.target.value) })}
                    />
                    <button onClick={() => void agregarIngrediente(producto.id)} className="flex items-center justify-center gap-1 px-3 py-2 bg-accent text-white rounded-lg text-sm">
                      <Plus className="w-3.5 h-3.5" />
                      Agregar
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
