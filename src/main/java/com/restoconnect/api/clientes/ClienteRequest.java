package com.restoconnect.api.clientes;

import jakarta.validation.constraints.NotBlank;

public record ClienteRequest(
        @NotBlank(message = "El nombre es obligatorio.") String nombre,
        String nitCi,
        String telefono,
        String email,
        String direccion,
        String tipoDocumento
) {
}
