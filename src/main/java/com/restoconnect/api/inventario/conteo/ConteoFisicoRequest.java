package com.restoconnect.api.inventario.conteo;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record ConteoFisicoRequest(
        @NotNull UUID itemInventarioId,
        @NotNull BigDecimal cantidadFisica,
        String observaciones,
        String lotesDetalle
) {}
