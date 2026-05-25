package com.restoconnect.api.personal;

import com.restoconnect.api.auth.RolUsuario;
import com.restoconnect.api.auth.Usuario;
import java.util.UUID;

public record PersonalResponse(
    UUID id,
    String nombre,
    String username,
    RolUsuario rol,
    boolean activo
) {
    public static PersonalResponse from(Usuario usuario) {
        return new PersonalResponse(
            usuario.getId(),
            usuario.getNombre(),
            usuario.getUsername(),
            usuario.getRol(),
            usuario.isActivo()
        );
    }
}
