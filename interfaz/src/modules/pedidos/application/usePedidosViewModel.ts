import { useEffect, useMemo, useState } from "react";
import { demoMesas, demoProductos } from "../../../data/demo";
import { useAsyncViewModel } from "../../../core/hooks/useAsyncViewModel";
import { api, ApiError, toRecordArray } from "../../../core/http/httpClient";
import { mapPedido } from "../../../core/http/mappers";
import { pedidosPort } from "../adapters/pedidosRepository";
import type { Pedido } from "../../../types";

const initialData = { mesas: demoMesas, productos: demoProductos };

export function usePedidosViewModel() {
  const { data, loading, error, reload } = useAsyncViewModel(() => pedidosPort.loadWorkspace(), initialData, []);
  const [workspace, setWorkspace] = useState(initialData);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedMesaId, setSelectedMesaId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [validatingId, setValidatingId] = useState<string>("");
  const [notice, setNotice] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<Pedido | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Pedido[]>([]);

  useEffect(() => {
    setWorkspace(data);
  }, [data]);

  useEffect(() => {
    if (!selectedMesaId) {
      const firstAvailable = workspace.mesas.find((mesa) => mesa.estado !== "BLOQUEADA" && mesa.estado !== "INACTIVA");
      if (firstAvailable) setSelectedMesaId(firstAvailable.id);
    }
  }, [workspace.mesas, selectedMesaId]);

  useEffect(() => {
    loadPendingOrders();
  }, []);

  function add(id: string, delta: number) {
    setCart((current) => {
      const next = Math.max(0, (current[id] ?? 0) + delta);
      const copy = { ...current, [id]: next };
      if (!next) delete copy[id];
      return copy;
    });
  }

  function selectMesa(id: string) {
    setSelectedMesaId(id);
  }

  function selectNextMesa() {
    const available = workspace.mesas.filter((mesa) => mesa.estado !== "BLOQUEADA" && mesa.estado !== "INACTIVA");
    if (!available.length) return;
    const currentIndex = available.findIndex((mesa) => mesa.id === selectedMesaId);
    const next = available[(currentIndex + 1 + available.length) % available.length];
    setSelectedMesaId(next.id);
  }

  function clearCart() {
    setCart({});
    setNotice("Carrito reiniciado.");
  }

  const total = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => sum + (workspace.productos.find((product) => product.id === id)?.precio ?? 0) * qty, 0);
  }, [cart, workspace.productos]);

  const selectedMesa = useMemo(() => workspace.mesas.find((mesa) => mesa.id === selectedMesaId) ?? null, [workspace.mesas, selectedMesaId]);

  async function loadPendingOrders() {
    try {
      const raw = await api.pedidosPendientes();
      setPendingOrders(toRecordArray(raw).map((item, index) => mapPedido(item, index)));
    } catch (reason) {
      if (reason instanceof ApiError) {
        setPendingOrders([]);
      }
    }
  }

  async function validateOrder(pedidoId: string, mesaNumero?: number) {
    setValidatingId(pedidoId);
    setNotice(null);
    try {
      const validated = await api.validarPedido(pedidoId);
      setPendingOrders((current) => current.filter((item) => item.id !== pedidoId));
      if (mesaNumero) {
        setWorkspace((current) => ({
          ...current,
          mesas: current.mesas.map((mesa) => mesa.numero === mesaNumero ? { ...mesa, estado: "OCUPADA" } : mesa)
        }));
      }
      setLastOrder((current) => current && current.id === pedidoId ? { ...current, estado: String(validated.estado ?? "CONFIRMADO") } : current);
      setNotice(mesaNumero ? `Pedido de mesa ${mesaNumero} enviado a cocina.` : "Pedido validado y enviado a cocina.");
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo validar el pedido.");
    } finally {
      setValidatingId("");
    }
  }

  async function refreshWorkspace() {
    await reload();
    await loadPendingOrders();
  }

  async function submitOrder() {
    if (!selectedMesa || !Object.keys(cart).length) return;
    setSubmitting(true);
    setNotice(null);
    const details = Object.entries(cart).map(([productoId, cantidad]) => ({ productoId, cantidad }));

    try {
      const created = await api.crearPedido({
        mesaId: selectedMesa.id,
        metodoPago: "EFECTIVO",
        detalles: details
      });

      const createdOrder: Pedido = {
        id: String(created.id ?? `pedido-${Date.now()}`),
        mesaNumero: selectedMesa.numero,
        estado: String(created.estado ?? "PENDIENTE_VALIDACION"),
        total,
        minutos: 0,
        items: details.map((detail) => ({
          producto: workspace.productos.find((item) => item.id === detail.productoId)?.nombre ?? "Producto",
          cantidad: detail.cantidad
        }))
      };

      setLastOrder(createdOrder);
      setWorkspace((current) => ({
        ...current,
        mesas: current.mesas.map((mesa) => mesa.id === selectedMesa.id ? { ...mesa, estado: "OCUPADA" } : mesa)
      }));
      setCart({});
      await loadPendingOrders();
      await validateOrder(createdOrder.id, createdOrder.mesaNumero);
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "No se pudo registrar el pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    data: workspace,
    loading,
    error,
    cart,
    add,
    total,
    selectedMesaId,
    selectedMesa,
    selectMesa,
    selectNextMesa,
    clearCart,
    submitOrder,
    submitting,
    notice,
    lastOrder,
    pendingOrders,
    validatingId,
    validateOrder,
    refreshWorkspace
  };
}
