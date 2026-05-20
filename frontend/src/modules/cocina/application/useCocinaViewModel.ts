import { demoPedidos } from "../../../data/demo";
import { useAsyncViewModel } from "../../../core/hooks/useAsyncViewModel";
import { cocinaPort } from "../adapters/cocinaRepository";

export function useCocinaViewModel() {
  return useAsyncViewModel(() => cocinaPort.list(), demoPedidos, []);
}
