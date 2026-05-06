package com.restoconnect.api.personal;

import com.restoconnect.api.auth.RolUsuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearUsuarioPersonalRequest(
        @NotBlank(message = "El nombre es obligatorio.") String nombre,
        @NotBlank(message = "El username es obligatorio.") String username,
        @NotBlank(message = "La password es obligatoria.") @Size(min = 6, message = "La password debe tener al menos 6 caracteres.") String password,
        @NotNull(message = "El rol es obligatorio.") RolUsuario rol
) {
}

