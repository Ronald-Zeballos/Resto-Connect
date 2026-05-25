import { useAsyncViewModel } from "../../../core/hooks/useAsyncViewModel";
import { cajaPort } from "../adapters/cajaRepository";

export function useCajaViewModel() {
  const state = useAsyncViewModel(() => cajaPort.getSnapshot(), { abierto: null, historial: [] }, []);
  return {
    ...state,
    abierto: state.data.abierto,
    historial: state.data.historial,
  };
}
