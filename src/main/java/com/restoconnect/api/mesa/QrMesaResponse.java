package com.restoconnect.api.mesa;

import java.util.UUID;

public record QrMesaResponse(
        UUID id,
        Integer numero,
        String codigoQr
) {
}

