package com.restoconnect.api.pago;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PagoResponse(
        UUID id,
        UUID pedidoId,
        String metodo,
        String estado,
        BigDecimal monto,
        OffsetDateTime fechaPago,
        String referenciaTransaccion
) {
    public static PagoResponse from(Pago pago) {
        return new PagoResponse(
                pago.getId(),
                pago.getPedido().getId(),
                pago.getMetodo().name(),
                pago.getEstado().name(),
                pago.getMonto(),
                pago.getFechaPago(),
                pago.getReferenciaTransaccion()
        );
    }
}

