package com.restoconnect.api.personal;

import com.restoconnect.api.auth.RolUsuario;
import com.restoconnect.api.auth.Usuario;
import java.time.OffsetDateTime;
import java.util.UUID;

public record UsuarioPersonalResponse(
        UUID id,
        String nombre,
        String username,
        RolUsuario rol,
        boolean activo,
        OffsetDateTime fechaCreacion
) {
    public static UsuarioPersonalResponse from(Usuario usuario) {
        return new UsuarioPersonalResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getUsername(),
                usuario.getRol(),
                usuario.isActivo(),
                usuario.getFechaCreacion()
        );
    }
}

