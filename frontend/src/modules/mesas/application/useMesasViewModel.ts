import { demoMesas } from "../../../data/demo";
import { useAsyncViewModel } from "../../../core/hooks/useAsyncViewModel";
import { mesasPort } from "../adapters/mesasRepository";

export function useMesasViewModel() {
  return useAsyncViewModel(() => mesasPort.list(), demoMesas, []);
}
