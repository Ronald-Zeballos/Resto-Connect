import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../core/http/httpClient";
import { Badge, ModulePanel, PageHeader } from "../../../shared/ui/primitives";
import type { ProveedorFull } from "../../../types";

const emptyForm = { nombre: "", nit: "", telefono: "", email: "", direccion: "", personaContacto: "", paginaWeb: "" };

export function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<ProveedorFull[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<ProveedorFull | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.proveedores().then((data) => setProveedores(data as unknown as ProveedorFull[]));
  }, []);

  function openEdit(proveedor: ProveedorFull | null) {
    setEditando(proveedor);
    setShowForm(true);
    setForm(proveedor ? {
      nombre: proveedor.nombre,
      nit: proveedor.nit,
      telefono: proveedor.telefono,
      email: proveedor.email,
      direccion: proveedor.direccion,
      personaContacto: proveedor.personaContacto || "",
      paginaWeb: proveedor.paginaWeb || ""
    } : emptyForm);
  }

  function closeForm() {
    setShowForm(false);
    setEditando(null);
    setForm(emptyForm);
  }

  async function guardar() {
    try {
      if (editando) {
        await api.actualizarProveedor(editando.id, form as unknown as Record<string, unknown>);
      } else {
        await api.crearProveedor(form as unknown as Record<string, unknown>);
      }
      closeForm();
      setProveedores(await api.proveedores() as unknown as ProveedorFull[]);
      setNotice(editando ? "Proveedor actualizado." : "Proveedor creado.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo guardar el proveedor.");
    }
  }

  async function eliminar(proveedor: ProveedorFull) {
    try {
      await api.desactivarProveedor(proveedor.id);
      setProveedores(await api.proveedores() as unknown as ProveedorFull[]);
      setNotice("Proveedor desactivado.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo eliminar el proveedor.");
    }
  }

  const filtrados = useMemo(() => {
    const needle = busqueda.toLowerCase();
    return proveedores.filter((proveedor) => proveedor.nombre.toLowerCase().includes(needle) || proveedor.nit.includes(busqueda));
  }, [busqueda, proveedores]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proveedores"
        eyebrow="Red de abastecimiento"
        action={<button onClick={() => openEdit(null)} className="btn-primary rounded-2xl"><Plus className="h-4 w-4" /> Nuevo proveedor</button>}
      />

      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}

      <ModulePanel
        title="Base de proveedores"
        port="Contactos de compra"
        description="Centraliza proveedores, personas de contacto y canales comerciales con la misma estetica del resto de modulos."
        action={<Badge tone="blue">{filtrados.length} visibles</Badge>}
      >
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              className="input pl-10"
              placeholder="Buscar por nombre o NIT..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>
          <p className="text-sm text-stone-500">Revisa contacto, email y pagina web desde una sola tabla.</p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-stone-200">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">NIT</th>
                <th className="px-4 py-3">Telefono</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Web</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((proveedor) => (
                <tr key={proveedor.id} className="border-t border-stone-100 bg-white transition hover:bg-herb/5">
                  <td className="px-4 py-3 font-semibold text-ink">{proveedor.nombre}</td>
                  <td className="px-4 py-3 text-stone-600">{proveedor.nit}</td>
                  <td className="px-4 py-3 text-stone-600">{proveedor.telefono}</td>
                  <td className="px-4 py-3 text-stone-600">{proveedor.email}</td>
                  <td className="px-4 py-3 text-stone-600">{proveedor.personaContacto || "-"}</td>
                  <td className="px-4 py-3 text-stone-600">{proveedor.paginaWeb || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(proveedor)} className="btn-secondary rounded-2xl px-3 py-2 text-xs">
                        <Pencil className="h-4 w-4" /> Editar
                      </button>
                      <button onClick={() => eliminar(proveedor)} className="rounded-2xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50">
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtrados.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-stone-500">No hay proveedores que coincidan con esa busqueda.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </ModulePanel>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={closeForm}>
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-soft" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Formulario de proveedor</p>
                <h2 className="mt-2 text-2xl font-black text-ink">{editando ? "Editar proveedor" : "Nuevo proveedor"}</h2>
              </div>
              <Badge>{editando ? "Edicion" : "Alta"}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input sm:col-span-2" placeholder="Nombre" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
              <input className="input" placeholder="NIT" value={form.nit} onChange={(event) => setForm({ ...form, nit: event.target.value })} />
              <input className="input" placeholder="Telefono" value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} />
              <input className="input" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              <input className="input" placeholder="Direccion" value={form.direccion} onChange={(event) => setForm({ ...form, direccion: event.target.value })} />
              <input className="input" placeholder="Persona de contacto" value={form.personaContacto} onChange={(event) => setForm({ ...form, personaContacto: event.target.value })} />
              <input className="input" placeholder="Pagina web" value={form.paginaWeb} onChange={(event) => setForm({ ...form, paginaWeb: event.target.value })} />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-secondary rounded-2xl" onClick={closeForm}>Cancelar</button>
              <button className="btn-primary rounded-2xl" onClick={guardar}>Guardar</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
