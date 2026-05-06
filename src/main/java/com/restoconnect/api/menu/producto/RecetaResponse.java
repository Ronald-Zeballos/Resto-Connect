package com.restoconnect.api.menu.producto;

import com.restoconnect.api.inventario.item.UnidadMedida;
import java.math.BigDecimal;
import java.util.UUID;

public record RecetaResponse(
        UUID itemInventarioId,
        String itemInventarioNombre,
        BigDecimal cantidadNecesaria,
        UnidadMedida unidadMedida
) {
}

