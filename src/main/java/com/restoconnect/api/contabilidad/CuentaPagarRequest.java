package com.restoconnect.api.contabilidad;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CuentaPagarRequest(
        UUID proveedorId,
        UUID ordenCompraId,
        @NotNull @DecimalMin("0.01") BigDecimal montoOriginal,
        @NotNull LocalDate fechaEmision,
        @NotNull LocalDate fechaVencimiento,
        String descripcion,
        String numeroComprobante
) {
}
