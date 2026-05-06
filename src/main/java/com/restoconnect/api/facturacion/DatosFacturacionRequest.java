package com.restoconnect.api.facturacion;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record DatosFacturacionRequest(
        @NotBlank(message = "La razon social es obligatoria.") String razonSocial,
        @NotBlank(message = "El NIT/CI es obligatorio.") String nitCi,
        @NotBlank(message = "El email es obligatorio.") @Email(message = "El email no es valido.") String email
) {
}

