package com.restoconnect.api.almacen;

import java.util.UUID;

public record AlmacenResponse(
        UUID id,
        String nombre,
        String ubicacion,
        boolean activo
) {
    public static AlmacenResponse from(Almacen almacen) {
        return new AlmacenResponse(
                almacen.getId(),
                almacen.getNombre(),
                almacen.getUbicacion(),
                almacen.isActivo()
        );
    }
}
