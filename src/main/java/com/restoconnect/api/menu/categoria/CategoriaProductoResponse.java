package com.restoconnect.api.menu.categoria;

import java.util.UUID;

public record CategoriaProductoResponse(
        UUID id,
        String nombre,
        String descripcion,
        boolean activo
) {
    public static CategoriaProductoResponse from(CategoriaProducto categoriaProducto) {
        return new CategoriaProductoResponse(
                categoriaProducto.getId(),
                categoriaProducto.getNombre(),
                categoriaProducto.getDescripcion(),
                categoriaProducto.isActivo()
        );
    }
}

