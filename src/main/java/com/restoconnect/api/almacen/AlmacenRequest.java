package com.restoconnect.api.almacen;

import jakarta.validation.constraints.NotBlank;

public record AlmacenRequest(
        @NotBlank(message = "El nombre es obligatorio.") String nombre,
        String ubicacion
) {
}
