package com.restoconnect.api.mesa;

import java.util.UUID;

public record MesaResponse(
        UUID id,
        Integer numero,
        String codigoQr,
        EstadoMesa estado
) {
    public static MesaResponse from(Mesa mesa) {
        return new MesaResponse(mesa.getId(), mesa.getNumero(), mesa.getCodigoQr(), mesa.getEstado());
    }
}

