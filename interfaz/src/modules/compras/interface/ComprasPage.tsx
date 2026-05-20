import { MessageCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api, ApiError, toRecordArray, withDemoFallback } from "../../../core/http/httpClient";
import { mapPredictions } from "../../../core/http/mappers";
import { demoOrdenes, demoPredicciones } from "../../../data/demo";
import { Badge, InlineFeedback, ModulePanel, PageHeader } from "../../../shared/ui/primitives";
import type { OrdenCompra, Prediccion } from "../../../types";

const WHATSAPP_NUMBER = import.meta.env.VITE_PURCHASES_WHATSAPP_NUMBER?.replace(/\D/g, "") || "59165900645";

function mapOrders(value: unknown): OrdenCompra[] {
  return toRecordArray(value).map((item, index) => ({
    id: String(item.id ?? `orden-${index}`),
    proveedor: String(item.proveedorNombre ?? item.proveedor ?? `Proveedor ${index + 1}`),
    estado: String(item.estado ?? "BORRADOR") as OrdenCompra["estado"],
    total: Number(item.costoEstimado ?? item.total ?? 0),
    fecha: String(item.fechaRecepcion ?? item.fecha ?? "2026-05-11")
  }));
}

export function ComprasPage() {
  const [predictions, setPredictions] = useState<Prediccion[]>(demoPredicciones);
  const [orders, setOrders] = useState<OrdenCompra[]>(demoOrdenes);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await withDemoFallback(async () => {
        const [predRaw, orderRaw] = await Promise.all([api.predicciones(), api.ordenes()]);
        return {
          predictions: mapPredictions(predRaw),
          orders: mapOrders(orderRaw)
        };
      }, async () => ({ predictions: demoPredicciones, orders: demoOrdenes }));
      setPredictions(snapshot.predictions);
      setOrders(snapshot.orders);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cargar compras.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function appendDraftOrder(prediction: Prediccion) {
    setOrders((current) => [
      {
        id: `local-${prediction.id}-${Date.now()}`,
        proveedor: "Solicitud manual por WhatsApp",
        estado: "BORRADOR",
        total: Number(prediction.cantidadSugeridaCompra) * 10,
        fecha: new Date().toISOString().slice(0, 10)
      },
      ...current
    ]);
  }

  function openWhatsAppRequest(prediction: Prediccion) {
    const message = [
      "Hola, necesito una reposicion para el restaurante.",
      `Item: ${prediction.item}`,
      `Cantidad sugerida: ${prediction.cantidadSugeridaCompra}`,
      `Dias hasta agotamiento: ${prediction.diasHastaAgotamiento}`,
      `Riesgo: ${prediction.nivelRiesgo}`,
      prediction.motivo ? `Motivo: ${prediction.motivo}` : null,
      "Por favor confirmame disponibilidad, precio y tiempo de entrega."
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  async function generatePredictions() {
    setWorking(true);
    setError(null);
    try {
      try {
        const predRaw = await api.generarPredicciones();
        setPredictions(mapPredictions(predRaw));
        await loadData();
      } catch (reason) {
        if (reason instanceof ApiError) throw reason;
        setPredictions(demoPredicciones);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo generar la prediccion.");
    } finally {
      setWorking(false);
    }
  }

  async function generateOrder(predictionId: string) {
    setWorking(true);
    setError(null);
    try {
      try {
        await api.generarOrdenCompra(predictionId);
        await loadData();
      } catch (reason) {
        const prediction = predictions.find((item) => item.id === predictionId);
        if (reason instanceof ApiError) {
          if (reason.status === 400 && prediction) {
            appendDraftOrder(prediction);
            setError(`${reason.message} Te deje un borrador local y puedes enviarlo por WhatsApp.`);
            return;
          }
          throw reason;
        }

        if (prediction) {
          appendDraftOrder(prediction);
        }
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo crear la orden de compra.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compras y reposicion"
        eyebrow="Pronostico de consumo para anticipar faltantes"
        action={<button className="btn-primary rounded-2xl" onClick={generatePredictions}>Actualizar pronostico</button>}
      />
      <InlineFeedback loading={loading || working} error={error} />

      <ModulePanel
        title="Sugerencias de compra"
        port="Pronostico de abastecimiento"
        description="Calcula riesgo de faltante y propone compras para mantener la operacion cubierta."
      >
        <div className="mb-4 rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          Si la orden automatica no se puede crear, puedes mandar la solicitud por WhatsApp al numero configurado: <b>+591 65900645</b>.
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {predictions.map((prediction) => (
            <article key={prediction.id} className="rounded-3xl border border-stone-200 bg-oatmeal p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-black">{prediction.item}</h2>
                <Badge tone={prediction.nivelRiesgo === "ALTO" || prediction.nivelRiesgo === "CRITICO" ? "red" : prediction.nivelRiesgo === "MEDIO" ? "yellow" : "green"}>{prediction.nivelRiesgo}</Badge>
              </div>
              <p className="text-sm text-stone-500">Dias hasta agotamiento</p>
              <p className="text-3xl font-black">{prediction.diasHastaAgotamiento}</p>
              <p className="mt-3 text-sm">Sugerido: <b>{prediction.cantidadSugeridaCompra}</b> | Confianza <b>{prediction.confianza}%</b></p>
              <p className="mt-2 text-sm text-stone-500">{prediction.motivo}</p>
              <div className="mt-4 grid gap-2">
                <button className="btn-secondary w-full rounded-2xl" onClick={() => generateOrder(prediction.id)}>
                  <Sparkles size={16} /> Generar orden
                </button>
                <button className="btn-primary w-full rounded-2xl" onClick={() => openWhatsAppRequest(prediction)}>
                  <MessageCircle size={16} /> Pedir por WhatsApp
                </button>
              </div>
            </article>
          ))}
        </div>
      </ModulePanel>

      <ModulePanel
        title="Ordenes de compra"
        port="Seguimiento de abastecimiento"
        description="Consulta las ordenes creadas desde el pronostico y su estado actual."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-stone-200 p-4">
              <div className="flex justify-between">
                <b>{order.proveedor}</b>
                <Badge>{order.estado}</Badge>
              </div>
              <p className="mt-2 text-sm text-stone-500">{order.fecha} | BOB {order.total}</p>
            </div>
          ))}
        </div>
      </ModulePanel>
    </div>
  );
}
