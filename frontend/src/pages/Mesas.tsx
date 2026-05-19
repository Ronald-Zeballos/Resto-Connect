import { QrCode, RefreshCw } from "lucide-react";
import { demoMesas } from "../data/demo";
import { Badge, PageHeader } from "../components/ui";

const tone = { LIBRE: "green", OCUPADA: "yellow", BLOQUEADA: "red", INACTIVA: "neutral" } as const;

export function Mesas() {
  return (
    <div className="space-y-6">
      <PageHeader title="Mapa de mesas" eyebrow="Sala y codigos QR" image="/images/qr-table.jpg" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {demoMesas.map((mesa) => (
          <article key={mesa.id} className="card p-4">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-500">Mesa</p>
                <h2 className="text-4xl font-black">{mesa.numero}</h2>
              </div>
              <Badge tone={tone[mesa.estado]}>{mesa.estado}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-secondary"><QrCode size={16} /> QR</button>
              <button className="btn-secondary"><RefreshCw size={16} /> Estado</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
