package com.restoconnect.api.caja;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CajaGastoRequest(
        @NotBlank String descripcion,
        @NotBlank String categoriaGasto,
        @NotNull @DecimalMin(value = "0.01") BigDecimal monto,
        String metodoPago,
        String comprobante
) {}
