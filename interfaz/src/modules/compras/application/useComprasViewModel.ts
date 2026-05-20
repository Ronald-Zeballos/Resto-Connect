import { demoOrdenes, demoPredicciones } from "../../../data/demo";
import { useAsyncViewModel } from "../../../core/hooks/useAsyncViewModel";
import { comprasPort } from "../adapters/comprasRepository";

const initialData = { predicciones: demoPredicciones, ordenes: demoOrdenes };

export function useComprasViewModel() {
  return useAsyncViewModel(() => comprasPort.getSnapshot(), initialData, []);
}
