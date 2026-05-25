package com.restoconnect.api.contabilidad;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContabilidadIngresoRequest(
        @NotNull LocalDate fechaIngreso,
        @NotBlank String descripcion,
        @NotBlank String categoriaIngreso,
        @NotNull @DecimalMin("0.01") BigDecimal monto,
        String metodoPago,
        String comprobante,
        UUID clienteId,
        String observaciones
) {
}
