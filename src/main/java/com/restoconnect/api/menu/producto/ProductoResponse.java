package com.restoconnect.api.menu.producto;

import com.restoconnect.api.inventario.item.UnidadMedida;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductoResponse(
        UUID id,
        String nombre,
        String descripcion,
        BigDecimal precio,
        UUID categoriaId,
        String categoriaNombre,
        boolean activo,
        boolean disponible,
        String imagenUrl,
        List<RecetaResponse> receta
) {
}

