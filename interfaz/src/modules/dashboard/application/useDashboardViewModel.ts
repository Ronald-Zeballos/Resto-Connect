import { useEffect, useMemo, useState } from "react";
import { useAsyncViewModel } from "../../../core/hooks/useAsyncViewModel";
import { dashboardPort } from "../adapters/dashboardRepository";
import type { DashboardSnapshot } from "../ports/dashboardPort";
import { demoAlertas, demoMesas, demoPedidos, demoProductos, salesData } from "../../../data/demo";

const initialSnapshot: DashboardSnapshot = {
  sales: salesData,
  alerts: demoAlertas,
  tables: demoMesas,
  activeOrders: demoPedidos,
  featuredProducts: demoProductos.slice(0, 4)
};

export function useDashboardViewModel() {
  const { data, loading, error } = useAsyncViewModel(() => dashboardPort.getSnapshot(), initialSnapshot, []);
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => dashboardPort.subscribeToEvents((message) => {
    setEvents((current) => [message, ...current].slice(0, 4));
  }), []);

  const enrichedAlerts = useMemo(() => {
    const liveAlerts = events.map((event, index) => ({
      id: `sse-${index}`,
      titulo: "Evento en vivo",
      descripcion: event,
      severidad: "INFO" as const
    }));
    return [...liveAlerts, ...data.alerts].slice(0, 5);
  }, [data.alerts, events]);

  const weeklySales = useMemo(() => data.sales.reduce((acc, item) => acc + item.ventas, 0), [data.sales]);
  const occupiedTables = useMemo(() => data.tables.filter((table) => table.estado === "OCUPADA").length, [data.tables]);

  return {
    data,
    alerts: enrichedAlerts,
    loading,
    error,
    metrics: {
      weeklySales,
      occupiedTables,
      tableCapacity: data.tables.length,
      activeOrders: data.activeOrders.length,
      criticalStock: data.alerts.filter((alert) => alert.severidad === "CRITICA").length
    }
  };
}
