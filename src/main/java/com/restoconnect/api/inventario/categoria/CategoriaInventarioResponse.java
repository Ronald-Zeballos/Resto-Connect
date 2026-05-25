package com.restoconnect.api.inventario.categoria;

import java.util.UUID;

public record CategoriaInventarioResponse(
        UUID id,
        String nombre,
        String descripcion,
        boolean activo
) {
    public static CategoriaInventarioResponse from(CategoriaInventario categoria) {
        return new CategoriaInventarioResponse(
                categoria.getId(),
                categoria.getNombre(),
                categoria.getDescripcion(),
                categoria.isActivo()
        );
    }
}
