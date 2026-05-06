package com.restoconnect.api.pedido.cancelar;

import com.restoconnect.api.pedido.Pedido;
import java.util.UUID;

public record CancelarPedidoResponse(
        UUID pedidoId,
        String estado
) {
    public static CancelarPedidoResponse from(Pedido pedido) {
        return new CancelarPedidoResponse(pedido.getId(), pedido.getEstado().name());
    }
}

