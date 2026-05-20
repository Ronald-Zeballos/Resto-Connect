import { demoIncidencias } from "../../../data/demo";
import { useAsyncViewModel } from "../../../core/hooks/useAsyncViewModel";
import { incidenciasPort } from "../adapters/incidenciasRepository";

export function useIncidenciasViewModel() {
  return useAsyncViewModel(() => incidenciasPort.list(), demoIncidencias, []);
}
