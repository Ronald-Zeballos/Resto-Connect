package com.restoconnect.api.mesa;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CrearMesaRequest(
        @NotNull(message = "El numero es obligatorio.") @Min(value = 1, message = "El numero debe ser mayor a 0.") Integer numero,
        EstadoMesa estado
) {
}

