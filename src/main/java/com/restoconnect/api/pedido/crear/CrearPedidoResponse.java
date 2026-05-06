package com.restoconnect.api.pedido.crear;

import com.restoconnect.api.pedido.Pedido;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CrearPedidoResponse(
        UUID id,
        UUID mesaId,
        Integer numeroMesa,
        String estado,
        String metodoPago,
        BigDecimal total,
        List<DetallePedidoResponse> detalles
) {
    public static CrearPedidoResponse from(Pedido pedido) {
        return new CrearPedidoResponse(
                pedido.getId(),
                pedido.getMesa().getId(),
                pedido.getMesa().getNumero(),
                pedido.getEstado().name(),
                pedido.getMetodoPago().name(),
                pedido.getTotal(),
                pedido.getDetalles().stream()
                        .map(detalle -> new DetallePedidoResponse(
                                detalle.getProducto().getId(),
                                detalle.getProducto().getNombre(),
                                detalle.getCantidad(),
                                detalle.getPrecioUnitario(),
                                detalle.getSubtotal()
                        ))
                        .toList()
        );
    }

    public record DetallePedidoResponse(
            UUID productoId,
            String productoNombre,
            Integer cantidad,
            BigDecimal precioUnitario,
            BigDecimal subtotal
    ) {
    }
}

