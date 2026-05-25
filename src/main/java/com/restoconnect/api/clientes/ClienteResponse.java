package com.restoconnect.api.clientes;

import java.util.UUID;

public record ClienteResponse(
        UUID id,
        String nombre,
        String nitCi,
        String telefono,
        String email,
        String direccion,
        String tipoDocumento,
        boolean activo
) {
    public static ClienteResponse from(Cliente cliente) {
        return new ClienteResponse(
                cliente.getId(),
                cliente.getNombre(),
                cliente.getNitCi(),
                cliente.getTelefono(),
                cliente.getEmail(),
                cliente.getDireccion(),
                cliente.getTipoDocumento(),
                cliente.isActivo()
        );
    }
}
