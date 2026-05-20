import { demoAlertas, demoInventario } from "../../../data/demo";
import { useAsyncViewModel } from "../../../core/hooks/useAsyncViewModel";
import { inventarioPort } from "../adapters/inventarioRepository";

const initialData = { items: demoInventario, alerts: demoAlertas };

export function useInventarioViewModel() {
  const state = useAsyncViewModel(() => inventarioPort.getSnapshot(), initialData, []);
  return {
    ...state,
    metrics: {
      items: state.data.items.length,
      reorder: state.data.items.filter((item) => item.stockActual <= item.puntoReorden).length,
      alerts: state.data.alerts.length
    }
  };
}
