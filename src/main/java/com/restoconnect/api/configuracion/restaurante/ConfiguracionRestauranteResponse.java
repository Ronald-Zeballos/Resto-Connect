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
        BigDecimal porcentajeImpuesto,
        boolean pagosQrHabilitado,
        String proveedorQr,
        String paguiBaseUrl,
        String paguiEmail,
        String paguiPassword,
        Integer paguiBankId,
        String qrCuentaTitular,
        String qrCuentaBanco,
        String qrCuentaNumero,
        String qrCuentaTipo,
        String qrComercioCodigo,
        String grokApiKey,
        String grokModelo,
        String grokSystemPrompt
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
                configuracion.getPorcentajeImpuesto(),
                configuracion.isPagosQrHabilitado(),
                configuracion.getProveedorQr(),
                configuracion.getPaguiBaseUrl(),
                configuracion.getPaguiEmail(),
                configuracion.getPaguiPassword(),
                configuracion.getPaguiBankId(),
                configuracion.getQrCuentaTitular(),
                configuracion.getQrCuentaBanco(),
                configuracion.getQrCuentaNumero(),
                configuracion.getQrCuentaTipo(),
                configuracion.getQrComercioCodigo(),
                null,
                configuracion.getGrokModelo(),
                configuracion.getGrokSystemPrompt()
        );
    }
}
