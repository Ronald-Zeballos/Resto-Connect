import { salesData } from "../../../data/demo";
import { useAsyncViewModel } from "../../../core/hooks/useAsyncViewModel";
import { reportesPort } from "../adapters/reportesRepository";

const initialData = {
  sales: salesData,
  paymentMix: [
    { name: "Efectivo", value: 52 },
    { name: "Tarjeta", value: 31 },
    { name: "QR", value: 17 }
  ]
};

export function useReportesViewModel() {
  return useAsyncViewModel(() => reportesPort.getSnapshot(), initialData, []);
}
