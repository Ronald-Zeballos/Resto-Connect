package com.restoconnect.api.caja;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public record CierreCajaRequest(
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal saldoInicial,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal saldoRealDeclarado,
        String observaciones
) {}
