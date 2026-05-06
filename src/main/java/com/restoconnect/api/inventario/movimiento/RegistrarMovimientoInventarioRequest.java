package com.restoconnect.api.inventario.movimiento;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record RegistrarMovimientoInventarioRequest(
        @NotNull(message = "El item es obligatorio.") UUID itemInventarioId,
        @NotNull(message = "La cantidad es obligatoria.") @DecimalMin(value = "0.0", inclusive = false) BigDecimal cantidad,
        @NotBlank(message = "El motivo es obligatorio.") String motivo,
        @NotBlank(message = "La referencia es obligatoria.") String referencia
) {
}

