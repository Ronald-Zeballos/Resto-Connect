import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../core/http/httpClient";
import { Badge, ModulePanel, PageHeader } from "../../../shared/ui/primitives";
import type { Cliente } from "../../../types";

const emptyForm = { nombre: "", nitCi: "", telefono: "", email: "", direccion: "", tipoDocumento: "CI" };

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.clientes().then((data) => setClientes(data as unknown as Cliente[]));
  }, []);

  function openEdit(cliente: Cliente | null) {
    setEditando(cliente);
    setShowForm(true);
    setForm(cliente ? {
      nombre: cliente.nombre,
      nitCi: cliente.nitCi || "",
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      direccion: cliente.direccion || "",
      tipoDocumento: cliente.tipoDocumento || "CI"
    } : emptyForm);
  }

  function closeForm() {
    setShowForm(false);
    setEditando(null);
    setForm(emptyForm);
  }

  async function guardar() {
    try {
      const payload = { ...form };
      if (editando) {
        await api.actualizarCliente(editando.id, payload as unknown as Record<string, unknown>);
      } else {
        await api.crearCliente(payload as unknown as Record<string, unknown>);
      }
      closeForm();
      setClientes(await api.clientes() as unknown as Cliente[]);
      setNotice(editando ? "Cliente actualizado." : "Cliente creado.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo guardar el cliente.");
    }
  }

  async function eliminar(cliente: Cliente) {
    try {
      await api.desactivarCliente(cliente.id);
      setClientes(await api.clientes() as unknown as Cliente[]);
      setNotice("Cliente desactivado.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo eliminar el cliente.");
    }
  }

  const filtrados = useMemo(() => {
    const needle = busqueda.toLowerCase();
    return clientes.filter((cliente) => cliente.nombre.toLowerCase().includes(needle) || (cliente.nitCi || "").includes(busqueda));
  }, [busqueda, clientes]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        eyebrow="Base comercial y facturacion"
        action={<button onClick={() => openEdit(null)} className="btn-primary rounded-2xl"><Plus className="h-4 w-4" /> Nuevo cliente</button>}
      />

      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}

      <ModulePanel
        title="Base de clientes"
        port="Relacion comercial"
        description="Busca clientes frecuentes, actualiza sus datos fiscales y mantén toda la información dentro del mismo bloque visual que usa el resto del sistema."
        action={<Badge tone="blue">{filtrados.length} visibles</Badge>}
      >
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              className="input pl-10"
              placeholder="Buscar por nombre o NIT/CI..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>
          <p className="text-sm text-stone-500">Gestiona facturacion, contacto y direccion sin salir del modulo.</p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-stone-200">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Telefono</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Direccion</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((cliente) => (
                <tr key={cliente.id} className="border-t border-stone-100 bg-white transition hover:bg-herb/5">
                  <td className="px-4 py-3 font-semibold text-ink">{cliente.nombre}</td>
                  <td className="px-4 py-3 text-stone-600">{cliente.nitCi || "-"}</td>
                  <td className="px-4 py-3 text-stone-600">{cliente.telefono || "-"}</td>
                  <td className="px-4 py-3 text-stone-600">{cliente.email || "-"}</td>
                  <td className="px-4 py-3 text-stone-600">{cliente.direccion || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(cliente)} className="btn-secondary rounded-2xl px-3 py-2 text-xs">
                        <Pencil className="h-4 w-4" /> Editar
                      </button>
                      <button onClick={() => eliminar(cliente)} className="rounded-2xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50">
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtrados.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-stone-500">No hay clientes que coincidan con esa búsqueda.</td>
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
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">Formulario de cliente</p>
                <h2 className="mt-2 text-2xl font-black text-ink">{editando ? "Editar cliente" : "Nuevo cliente"}</h2>
              </div>
              <Badge>{form.tipoDocumento}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input sm:col-span-2" placeholder="Nombre" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
              <input className="input" placeholder="NIT / CI" value={form.nitCi} onChange={(event) => setForm({ ...form, nitCi: event.target.value })} />
              <select className="input" value={form.tipoDocumento} onChange={(event) => setForm({ ...form, tipoDocumento: event.target.value })}>
                <option value="CI">CI</option>
                <option value="NIT">NIT</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
              <input className="input" placeholder="Telefono" value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} />
              <input className="input" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              <input className="input sm:col-span-2" placeholder="Direccion" value={form.direccion} onChange={(event) => setForm({ ...form, direccion: event.target.value })} />
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
