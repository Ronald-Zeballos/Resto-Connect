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
        String qrCuentaTitular,
        String qrCuentaBanco,
        String qrCuentaNumero,
        String qrCuentaTipo,
        String qrComercioCodigo,
        String logoUrl,
        String mensajePieFactura,
        String tipoServicio,
        BigDecimal propinaPorcentaje,
        Boolean propinaIncluida,
        String inventarioValoracion,
        Boolean controlarVencimientos,
        Boolean controlarLotes
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
                configuracion.getQrCuentaTitular(),
                configuracion.getQrCuentaBanco(),
                configuracion.getQrCuentaNumero(),
                configuracion.getQrCuentaTipo(),
                configuracion.getQrComercioCodigo(),
                configuracion.getLogoUrl(),
                configuracion.getMensajePieFactura(),
                configuracion.getTipoServicio(),
                configuracion.getPropinaPorcentaje(),
                configuracion.isPropinaIncluida(),
                configuracion.getInventarioValoracion(),
                configuracion.isControlarVencimientos(),
                configuracion.isControlarLotes()
        );
    }
}
