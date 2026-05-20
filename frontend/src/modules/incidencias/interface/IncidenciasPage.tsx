import { useEffect, useState } from "react";
import { Badge, InlineFeedback, ModulePanel, PageHeader } from "../../../shared/ui/primitives";
import { useIncidenciasViewModel } from "../application/useIncidenciasViewModel";
import { incidenciasPort } from "../adapters/incidenciasRepository";
import type { Incidencia } from "../../../types";

export function IncidenciasPage() {
  const { data, loading, error, reload } = useIncidenciasViewModel();
  const [incidents, setIncidents] = useState<Incidencia[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftCategory, setDraftCategory] = useState("OPERATIVA");
  const [notice, setNotice] = useState<string>("");

  useEffect(() => {
    setIncidents(data);
  }, [data]);

  async function createIncident() {
    if (!draftTitle.trim()) return;
    try {
      const created = await incidenciasPort.create({
        titulo: draftTitle.trim(),
        descripcion: draftDescription.trim() || draftTitle.trim(),
        categoria: draftCategory,
        prioridad: "MEDIA"
      });
      setIncidents((current) => [created, ...current]);
      setDraftTitle("");
      setDraftDescription("");
      setDraftCategory("OPERATIVA");
      setShowForm(false);
      setNotice("Novedad registrada.");
      reload();
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo registrar la novedad.");
    }
  }

  async function toggleResolved(id: string) {
    const current = incidents.find((incident) => incident.id === id);
    if (!current) return;
    const nextState = current.estado === "RESUELTA" ? "ABIERTA" : "RESUELTA";
    try {
      const updated = await incidenciasPort.updateStatus(id, nextState);
      setIncidents((items) => items.map((incident) => incident.id === id ? updated : incident));
      setNotice("Estado de la novedad actualizado.");
      reload();
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo actualizar la novedad.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Novedades operativas" eyebrow="Seguimiento de incidentes, tareas y pendientes del turno" action={<div className="flex gap-2"><button className="btn-secondary rounded-2xl" onClick={() => void reload()}>Actualizar</button><button className="btn-primary rounded-2xl" onClick={() => setShowForm((current) => !current)}>{showForm ? "Cerrar formulario" : "Registrar novedad"}</button></div>} />
      <InlineFeedback loading={loading} error={error} />
      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}
      <ModulePanel title="Pendientes del turno" port="Registro operativo" description="Centraliza incidencias de sala, cocina y operacion para que el equipo actue rapido.">
        {showForm ? (
          <div className="mb-4 grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 md:grid-cols-[1fr_220px_180px]">
            <input className="input" placeholder="Describe la novedad" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} />
            <input className="input md:col-span-3" placeholder="Detalle operativo" value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} />
            <select className="input" value={draftCategory} onChange={(event) => setDraftCategory(event.target.value)}>
              <option value="OPERATIVA">Operativa</option>
              <option value="SALA">Sala</option>
              <option value="COCINA">Cocina</option>
              <option value="INVENTARIO">Inventario</option>
            </select>
            <button className="btn-primary rounded-2xl" disabled={!draftTitle.trim()} onClick={() => void createIncident()}>Guardar</button>
          </div>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-3">
          {incidents.map((incident) => (
            <article key={incident.id} className="rounded-3xl border border-stone-200 bg-oatmeal p-5">
              <div className="mb-4 flex justify-between gap-3">
                <h2 className="font-black">{incident.titulo}</h2>
                <Badge tone={incident.prioridad === "ALTA" || incident.prioridad === "CRITICA" ? "red" : "yellow"}>{incident.prioridad}</Badge>
              </div>
              <p className="text-sm text-stone-500">{incident.categoria} · {incident.estado}</p>
              <button className="btn-secondary mt-5 rounded-2xl" onClick={() => void toggleResolved(incident.id)}>{incident.estado === "RESUELTA" ? "Reabrir" : "Marcar resuelta"}</button>
            </article>
          ))}
        </div>
      </ModulePanel>
    </div>
  );
}
