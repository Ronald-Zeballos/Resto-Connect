import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../core/http/httpClient";
import { Badge, ModulePanel, PageHeader } from "../../../shared/ui/primitives";
import type { Personal } from "../../../types";

const emptyForm = { nombre: "", username: "", password: "", rol: "MESERO" };

export function PersonalPage() {
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Personal | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.personal().then((data) => setPersonal(data as unknown as Personal[]));
  }, []);

  function openEdit(miembro: Personal | null) {
    setEditando(miembro);
    setShowForm(true);
    setForm(miembro ? { nombre: miembro.nombre, username: miembro.username, password: "", rol: miembro.rol } : emptyForm);
  }

  function closeForm() {
    setShowForm(false);
    setEditando(null);
    setForm(emptyForm);
  }

  async function guardar() {
    try {
      if (editando) {
        await api.actualizarPersonal(editando.id, form as unknown as Record<string, unknown>);
      } else {
        await api.crearPersonal(form as unknown as Record<string, unknown>);
      }
      closeForm();
      setPersonal(await api.personal() as unknown as Personal[]);
      setNotice(editando ? "Personal actualizado." : "Personal creado.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "Error al guardar.");
    }
  }

  async function eliminar(miembro: Personal) {
    try {
      await api.desactivarPersonal(miembro.id);
      setPersonal(await api.personal() as unknown as Personal[]);
      setNotice("Personal desactivado.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "Error al desactivar.");
    }
  }

  const filtrados = useMemo(() => {
    const needle = busqueda.toLowerCase();
    return personal.filter((miembro) => miembro.nombre.toLowerCase().includes(needle) || miembro.username.includes(busqueda) || miembro.rol.includes(busqueda.toUpperCase()));
  }, [busqueda, personal]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personal"
        eyebrow="Usuarios y roles operativos"
        action={<button onClick={() => openEdit(null)} className="btn-primary rounded-2xl"><Plus className="h-4 w-4" /> Nuevo usuario</button>}
      />

      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}

      <ModulePanel
        title="Equipo del restaurante"
        port="Accesos y permisos"
        description="Administra usuarios, roles y estado operativo con el mismo layout limpio del resto de modulos."
        action={<Badge tone="blue">{filtrados.length} visibles</Badge>}
      >
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              className="input pl-10"
              placeholder="Buscar por nombre, usuario o rol..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>
          <p className="text-sm text-stone-500">Controla meseros, cocina, caja, inventario y administracion desde una sola vista.</p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-stone-200">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((miembro) => (
                <tr key={miembro.id} className={`border-t border-stone-100 bg-white transition hover:bg-herb/5 ${!miembro.activo ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3 font-semibold text-ink">{miembro.nombre}</td>
                  <td className="px-4 py-3 text-stone-600">{miembro.username}</td>
                  <td className="px-4 py-3"><Badge tone="neutral">{miembro.rol}</Badge></td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone={miembro.activo ? "green" : "red"}>{miembro.activo ? "Activo" : "Inactivo"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(miembro)} className="btn-secondary rounded-2xl px-3 py-2 text-xs">
                        <Pencil className="h-4 w-4" /> Editar
                      </button>
                      {miembro.activo ? (
                        <button onClick={() => eliminar(miembro)} className="rounded-2xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50">
                          <Trash2 className="h-4 w-4" /> Desactivar
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtrados.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-stone-500">No hay personal que coincida con esa busqueda.</td>
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
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Formulario de usuario</p>
                <h2 className="mt-2 text-2xl font-black text-ink">{editando ? "Editar personal" : "Nuevo personal"}</h2>
              </div>
              <Badge>{form.rol}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input sm:col-span-2" placeholder="Nombre completo" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
              <input className="input" placeholder="Usuario" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
              <input className="input" type="password" placeholder={editando ? "Dejar vacio = sin cambios" : "Contrasena"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              <select className="input sm:col-span-2" value={form.rol} onChange={(event) => setForm({ ...form, rol: event.target.value })}>
                <option value="ADMIN">Admin</option>
                <option value="GERENTE">Gerente</option>
                <option value="CAJERO">Cajero</option>
                <option value="MESERO">Mesero</option>
                <option value="COCINA">Cocina</option>
                <option value="INVENTARIO">Inventario</option>
                <option value="CONTADOR">Contador</option>
              </select>
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
