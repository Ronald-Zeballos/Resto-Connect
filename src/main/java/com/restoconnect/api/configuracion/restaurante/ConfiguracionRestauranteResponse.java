package com.restoconnect.api.configuracion.restaurante;

import java.math.BigDecimal;
import java.util.UUID;

public record ConfiguracionRestauranteResponse(
        UUID id,
        String nombreComercial,
        String razonSocial,
        String nit,
        String telefono,
        String direccion,
        String email,
        String moneda,
        BigDecimal porcentajeImpuesto
) {
    public static ConfiguracionRestauranteResponse from(ConfiguracionRestaurante configuracion) {
        return new ConfiguracionRestauranteResponse(
                configuracion.getId(),
                configuracion.getNombreComercial(),
                configuracion.getRazonSocial(),
                configuracion.getNit(),
                configuracion.getTelefono(),
                configuracion.getDireccion(),
                configuracion.getEmail(),
                configuracion.getMoneda(),
                configuracion.getPorcentajeImpuesto()
        );
    }
}

