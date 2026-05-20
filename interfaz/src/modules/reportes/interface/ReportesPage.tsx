import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { api, asString, withDemoFallback } from "../../../core/http/httpClient";
import { mapConsumptionPrediction, mapPaymentMix, mapSalesDetail, mapTopProducts } from "../../../core/http/mappers";
import { InlineFeedback, ModulePanel, PageHeader } from "../../../shared/ui/primitives";
import type { ConsumoVsPrediccion, ProductoVendido, VentaDiaria, VentaMetodo } from "../../../types";

const today = new Date();
const lastWeek = new Date();
lastWeek.setDate(today.getDate() - 7);

const fallbackSales: VentaDiaria[] = [
  { fecha: "2026-05-12", monto: 880, transacciones: 12 },
  { fecha: "2026-05-13", monto: 1240, transacciones: 18 },
  { fecha: "2026-05-14", monto: 980, transacciones: 15 },
  { fecha: "2026-05-15", monto: 1460, transacciones: 21 },
  { fecha: "2026-05-16", monto: 1920, transacciones: 24 },
  { fecha: "2026-05-17", monto: 2340, transacciones: 29 },
  { fecha: "2026-05-18", monto: 1680, transacciones: 20 }
];

const fallbackPaymentMix: VentaMetodo[] = [
  { name: "EFECTIVO", value: 52, transacciones: 18 },
  { name: "PASARELA", value: 48, transacciones: 14 }
];

const fallbackTopProducts: ProductoVendido[] = [
  { productoId: "1", nombreProducto: "Hamburguesa con queso", cantidadVendida: 52, ingresos: 1040 },
  { productoId: "2", nombreProducto: "Combo burger", cantidadVendida: 39, ingresos: 1092 },
  { productoId: "3", nombreProducto: "Taco de carne", cantidadVendida: 27, ingresos: 459 }
];

const fallbackConsumptionVsPrediction: ConsumoVsPrediccion[] = [
  { itemInventarioId: "401", nombreItem: "Pan hamburguesa", consumoReal: 88, consumoPredicho: 84, diferencia: 4, desviacionPorcentual: 4.76, nivelRiesgo: "BAJO", confianzaPrediccion: 78 },
  { itemInventarioId: "402", nombreItem: "Carne hamburguesa", consumoReal: 110, consumoPredicho: 98, diferencia: 12, desviacionPorcentual: 12.24, nivelRiesgo: "MEDIO", confianzaPrediccion: 82 },
  { itemInventarioId: "410", nombreItem: "Jarabe gaseosa", consumoReal: 32, consumoPredicho: 25, diferencia: 7, desviacionPorcentual: 28, nivelRiesgo: "ALTO", confianzaPrediccion: 74 }
];

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function ReportesPage() {
  const [desde, setDesde] = useState(toDateInput(lastWeek));
  const [hasta, setHasta] = useState(toDateInput(today));
  const [sales, setSales] = useState<VentaDiaria[]>(fallbackSales);
  const [paymentMix, setPaymentMix] = useState<VentaMetodo[]>(fallbackPaymentMix);
  const [topProducts, setTopProducts] = useState<ProductoVendido[]>(fallbackTopProducts);
  const [forecast, setForecast] = useState<ConsumoVsPrediccion[]>(fallbackConsumptionVsPrediction);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisObjective, setAnalysisObjective] = useState("Resume ventas, metodos de pago, riesgos y acciones recomendadas para esta semana.");
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [analysisModel, setAnalysisModel] = useState<string>("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [chartWidth, setChartWidth] = useState(520);

  async function loadReports() {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await withDemoFallback(async () => {
        const params = { desde, hasta };
        const [salesRaw, paymentRaw, topProductsRaw, forecastRaw] = await Promise.all([
          api.ventasRango(params),
          api.ventasMetodos(params),
          api.ventasProductos(params),
          api.consumoVsPrediccion(params)
        ]);
        return {
          sales: mapSalesDetail((salesRaw.detalleDiario as unknown[]) ?? []),
          paymentMix: mapPaymentMix(paymentRaw),
          topProducts: mapTopProducts(topProductsRaw),
          forecast: mapConsumptionPrediction(forecastRaw)
        };
      }, async () => ({
        sales: fallbackSales,
        paymentMix: fallbackPaymentMix,
        topProducts: fallbackTopProducts,
        forecast: fallbackConsumptionVsPrediction
      }));

      setSales(snapshot.sales);
      setPaymentMix(snapshot.paymentMix);
      setTopProducts(snapshot.topProducts);
      setForecast(snapshot.forecast);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  useEffect(() => {
    const updateChartWidth = () => setChartWidth(Math.max(280, Math.min(620, window.innerWidth - 120)));
    updateChartWidth();
    window.addEventListener("resize", updateChartWidth);
    return () => window.removeEventListener("resize", updateChartWidth);
  }, []);

  const salesChart = sales.map((item) => ({ dia: item.fecha.slice(5), ventas: item.monto, transacciones: item.transacciones }));

  async function runGrokAnalysis() {
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const result = await withDemoFallback(async () => api.analizarConGrok({
        objetivo: analysisObjective,
        datos: {
          periodo: { desde, hasta },
          ventas: sales,
          metodosPago: paymentMix,
          productosTop: topProducts,
          consumoVsPrediccion: forecast
        }
      }), async () => ({
        modelo: "demo-local",
        analisis: [
          "Ventas con mejor rendimiento al cierre de semana.",
          "Conviene empujar QR y controlar los items con mayor desviacion frente al pronostico.",
          "Revisa especialmente los insumos con riesgo MEDIO o ALTO antes del siguiente pico de demanda."
        ].join("\n")
      }));

      setAnalysisModel(asString(result.modelo, ""));
      setAnalysisResult(asString(result.analisis, "No se recibio analisis de la IA."));
    } catch (reason) {
      setAnalysisError(reason instanceof Error ? reason.message : "No se pudo ejecutar el analisis con Grok.");
    } finally {
      setAnalysisLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Analisis del negocio" eyebrow="Ventas historicas y proyeccion para planificar mejor" action={<button className="btn-primary rounded-2xl" onClick={() => void loadReports()}>Actualizar analisis</button>} />
      <InlineFeedback loading={loading} error={error} />

      <ModulePanel title="Rango de consulta" port="Periodo analizado" description="Consulta historicos reales para evaluar ventas, formas de cobro y desvios frente al pronostico.">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_180px]">
          <label><span className="mb-1 block text-sm font-bold">Desde</span><input className="input" type="date" value={desde} onChange={(event) => setDesde(event.target.value)} /></label>
          <label><span className="mb-1 block text-sm font-bold">Hasta</span><input className="input" type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} /></label>
          <button className="btn-primary rounded-2xl md:self-end" onClick={() => void loadReports()}>Aplicar rango</button>
        </div>
      </ModulePanel>

      <ModulePanel title="Analisis con Grok" port="IA configurada por variables de entorno" description="Usa la clave guardada en `APP_GROK_API_KEY` dentro del archivo .env para pedir un resumen ejecutivo de lo que esta pasando en el restaurante.">
        <div className="grid gap-4">
          <label>
            <span className="mb-1 block text-sm font-bold">Que quieres que analice la IA</span>
            <textarea className="input min-h-28 resize-y" value={analysisObjective} onChange={(event) => setAnalysisObjective(event.target.value)} placeholder="Ejemplo: detecta riesgos, tendencias de venta y acciones concretas para la proxima semana." />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-primary rounded-2xl" disabled={analysisLoading} onClick={() => void runGrokAnalysis()}>
              {analysisLoading ? "Analizando..." : "Analizar con Grok"}
            </button>
            {analysisModel ? <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">Modelo: {analysisModel}</span> : null}
          </div>
          {analysisError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{analysisError}</div> : null}
          {analysisResult ? <pre className="overflow-x-auto whitespace-pre-wrap rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-700">{analysisResult}</pre> : null}
        </div>
      </ModulePanel>

      <div className="grid gap-5 xl:grid-cols-2">
        <ModulePanel title="Ventas por periodo" port="Ingresos diarios" description="Historico diario de ingresos y transacciones cobradas.">
          <div className="flex min-w-0 justify-center overflow-x-auto">
            <BarChart width={chartWidth} height={288} data={salesChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ventas" fill="#2f6f4e" radius={[10, 10, 0, 0]} />
            </BarChart>
          </div>
        </ModulePanel>

        <ModulePanel title="Metodos de pago" port="Participacion por metodo" description="Distribucion del ingreso entre efectivo, QR, tarjeta y otros medios.">
          <div className="flex min-w-0 justify-center overflow-x-auto">
            <PieChart width={chartWidth} height={288}>
              <Pie data={paymentMix} dataKey="value" nameKey="name" fill="#c7442f" label />
              <Legend />
              <Tooltip />
            </PieChart>
          </div>
        </ModulePanel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <ModulePanel title="Productos mas vendidos" port="Preferencias del cliente" description="Ayuda a ajustar precios, promociones y reposicion segun demanda real.">
          <div className="space-y-3">
            {topProducts.map((product) => (
              <div key={product.productoId} className="rounded-2xl border border-stone-200 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <b>{product.nombreProducto}</b>
                  <span className="text-sm text-stone-500">{product.cantidadVendida} vendidos</span>
                </div>
                <p className="mt-2 text-sm text-stone-500">Ingresos: BOB {product.ingresos.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </ModulePanel>

        <ModulePanel title="Consumo real vs pronostico" port="Precision del abastecimiento" description="Compara lo vendido con lo estimado para corregir compras y planificacion.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr><th className="p-4">Item</th><th>Real</th><th>Pronostico</th><th>Diferencia</th><th>Riesgo</th><th>Confianza</th></tr>
              </thead>
              <tbody>
                {forecast.map((item) => (
                  <tr key={item.itemInventarioId} className="border-t border-stone-100">
                    <td className="p-4"><b>{item.nombreItem}</b><p className="text-stone-500">{asString(item.nivelRiesgo)}</p></td>
                    <td>{item.consumoReal}</td>
                    <td>{item.consumoPredicho}</td>
                    <td className={item.diferencia > 0 ? "text-red-600" : "text-herb"}>{item.diferencia}</td>
                    <td>{item.nivelRiesgo}</td>
                    <td>{item.confianzaPrediccion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModulePanel>
      </div>
    </div>
  );
}
