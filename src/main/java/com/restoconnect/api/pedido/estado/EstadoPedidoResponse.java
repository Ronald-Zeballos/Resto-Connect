package com.restoconnect.api.pedido.estado;

import com.restoconnect.api.pedido.Pedido;
import java.util.UUID;

public record EstadoPedidoResponse(
        UUID pedidoId,
        String estado
) {
    public static EstadoPedidoResponse from(Pedido pedido) {
        return new EstadoPedidoResponse(pedido.getId(), pedido.getEstado().name());
    }
}

