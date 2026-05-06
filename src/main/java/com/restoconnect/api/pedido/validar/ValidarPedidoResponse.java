package com.restoconnect.api.pedido.validar;

import com.restoconnect.api.pedido.Pedido;
import java.util.UUID;

public record ValidarPedidoResponse(
        UUID pedidoId,
        String estado,
        UUID meseroValidadorId,
        String meseroValidadorNombre
) {
    public static ValidarPedidoResponse from(Pedido pedido) {
        return new ValidarPedidoResponse(
                pedido.getId(),
                pedido.getEstado().name(),
                pedido.getMeseroValidador() != null ? pedido.getMeseroValidador().getId() : null,
                pedido.getMeseroValidador() != null ? pedido.getMeseroValidador().getNombre() : null
        );
    }
}

