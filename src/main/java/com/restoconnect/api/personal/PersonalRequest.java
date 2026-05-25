package com.restoconnect.api.personal;

import com.restoconnect.api.auth.RolUsuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PersonalRequest(
    @NotBlank String nombre,
    @NotBlank String username,
    @NotBlank String password,
    @NotNull RolUsuario rol
) {}
