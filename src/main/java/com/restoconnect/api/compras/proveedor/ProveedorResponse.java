package com.restoconnect.api.compras.proveedor;

import java.util.UUID;

public record ProveedorResponse(
        UUID id,
        String nombre,
        String nit,
        String telefono,
        String email,
        String direccion,
        boolean activo,
        String personaContacto,
        String paginaWeb
) {
    public static ProveedorResponse from(Proveedor proveedor) {
        return new ProveedorResponse(
                proveedor.getId(),
                proveedor.getNombre(),
                proveedor.getNit(),
                proveedor.getTelefono(),
                proveedor.getEmail(),
                proveedor.getDireccion(),
                proveedor.isActivo(),
                proveedor.getPersonaContacto(),
                proveedor.getPaginaWeb()
        );
    }
}

