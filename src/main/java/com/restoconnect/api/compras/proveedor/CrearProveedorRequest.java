package com.restoconnect.api.compras.proveedor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CrearProveedorRequest(
        @NotBlank(message = "El nombre es obligatorio.") String nombre,
        @NotBlank(message = "El NIT es obligatorio.") String nit,
        @NotBlank(message = "El telefono es obligatorio.") String telefono,
        @NotBlank(message = "El email es obligatorio.") @Email(message = "El email no es valido.") String email,
        @NotBlank(message = "La direccion es obligatoria.") String direccion
) {
}

