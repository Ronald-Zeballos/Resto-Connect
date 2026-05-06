package com.restoconnect.api.mesa;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoMesaRequest(
        @NotNull(message = "El estado es obligatorio.") EstadoMesa estado
) {
}

