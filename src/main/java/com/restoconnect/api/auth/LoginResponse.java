package com.restoconnect.api.auth;

public record LoginResponse(
        String token,
        String username,
        RolUsuario rol,
        String nombre
) {
}

