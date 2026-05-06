package com.restoconnect.api.pedido;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PedidoResponse(
        UUID id,
        Integer mesaNumero,
        String estado,
        String metodoPago,
        BigDecimal total,
        String meseroValidador,
        List<DetalleResponse> detalles
) {
    public static PedidoResponse from(Pedido pedido) {
        return new PedidoResponse(
                pedido.getId(),
                pedido.getMesa().getNumero(),
                pedido.getEstado().name(),
                pedido.getMetodoPago().name(),
                pedido.getTotal(),
                pedido.getMeseroValidador() != null ? pedido.getMeseroValidador().getNombre() : null,
                pedido.getDetalles().stream()
                        .map(detalle -> new DetalleResponse(
                                detalle.getProducto().getNombre(),
                                detalle.getCantidad(),
                                detalle.getPrecioUnitario(),
                                detalle.getSubtotal()
                        )).toList()
        );
    }

    public record DetalleResponse(
            String producto,
            Integer cantidad,
            BigDecimal precioUnitario,
            BigDecimal subtotal
    ) {
    }
}

