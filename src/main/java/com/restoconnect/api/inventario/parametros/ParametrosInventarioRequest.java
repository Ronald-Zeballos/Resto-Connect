package com.restoconnect.api.inventario.parametros;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalTime;

public record ParametrosInventarioRequest(
        @NotNull Integer diasAnalisisConsumo,
        @NotNull Integer diasCoberturaDeseada,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal porcentajeMargenSeguridad,
        boolean activarPrediccionAutomatica,
        boolean activarAlertasEmail,
        boolean activarAlertasWebSocket,
        @NotNull LocalTime horaEjecucionPrediccionDiaria,
        BigDecimal stockMinimoGlobalOpcional,
        @NotNull MetodoPrediccion metodoPrediccion
) {
}

