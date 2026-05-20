import { Link } from "react-router-dom";
import { ExternalLink, QrCode, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, InlineFeedback, PageHeader } from "../../../shared/ui/primitives";
import { useMesasViewModel } from "../application/useMesasViewModel";
import { mesasPort } from "../adapters/mesasRepository";
import { TableQrPreview } from "./TableQrPreview";
import type { Mesa } from "../../../types";

const tone = { LIBRE: "green", OCUPADA: "yellow", RESERVADA: "blue", BLOQUEADA: "red", INACTIVA: "neutral" } as const;
const statusSequence: Mesa["estado"][] = ["LIBRE", "OCUPADA", "RESERVADA", "BLOQUEADA", "INACTIVA"];

export function MesasPage() {
  const { data, loading, error, reload } = useMesasViewModel();
  const [tables, setTables] = useState<Mesa[]>([]);
  const [copied, setCopied] = useState<string>("");
  const [notice, setNotice] = useState<string>("");

  useEffect(() => {
    setTables(data);
  }, [data]);

  async function copyQrLink(codigoQr: string) {
    const url = `${window.location.origin}/qr/${codigoQr}`;
    await navigator.clipboard?.writeText(url);
    setCopied(codigoQr);
    setNotice("Enlace QR copiado.");
    window.setTimeout(() => setCopied(""), 1800);
  }

  async function rotateStatus(id: string) {
    const mesa = tables.find((item) => item.id === id);
    if (!mesa) return;
    const nextIndex = (statusSequence.indexOf(mesa.estado) + 1) % statusSequence.length;
    const nextEstado = statusSequence[nextIndex];

    try {
      const updated = await mesasPort.changeStatus(id, nextEstado);
      setTables((current) => current.map((item) => item.id === id ? { ...item, estado: updated.estado } : item));
      setNotice("Estado de mesa actualizado.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo actualizar la mesa.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Sala y mesas" eyebrow="Estado del salon y acceso por QR para cada mesa" image="/images/qr-table.png" action={<button className="btn-primary rounded-2xl" onClick={() => void reload()}><RefreshCw size={16} /> Actualizar mesas</button>} />
      <InlineFeedback loading={loading} error={error} />
      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {tables.map((mesa) => (
          <article key={mesa.id} className="card p-4">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">Mesa</p>
                <h2 className="text-4xl font-black">{mesa.numero}</h2>
              </div>
              <Badge tone={tone[mesa.estado]}>{mesa.estado}</Badge>
            </div>
            <TableQrPreview value={`${window.location.origin}/qr/${mesa.codigoQr}`} alt={`QR mesa ${mesa.numero}`} />
            <p className="mb-4 rounded-2xl bg-oatmeal px-3 py-2 text-xs text-stone-500">{mesa.codigoQr}</p>
            <div className="grid gap-2">
              <Link className="btn-secondary rounded-2xl" to={`/qr/${mesa.codigoQr}`} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Ver menu QR</Link>
              <button className="btn-secondary rounded-2xl" onClick={() => copyQrLink(mesa.codigoQr)}><QrCode size={16} /> {copied === mesa.codigoQr ? "Enlace copiado" : "Copiar enlace QR"}</button>
              <button className="btn-secondary rounded-2xl" onClick={() => void rotateStatus(mesa.id)}><RefreshCw size={16} /> Cambiar estado</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
