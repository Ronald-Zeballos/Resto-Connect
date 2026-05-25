package com.restoconnect.api.configuracion.restaurante;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ConfiguracionRestauranteRequest(
        @NotBlank(message = "El nombre comercial es obligatorio.") String nombreComercial,
        @NotBlank(message = "La razon social es obligatoria.") String razonSocial,
        @NotBlank(message = "El NIT es obligatorio.") String nit,
        @NotBlank(message = "El telefono es obligatorio.") String telefono,
        @NotBlank(message = "La direccion es obligatoria.") String direccion,
        @NotBlank(message = "El email es obligatorio.") @Email(message = "El email no es valido.") String email,
        @NotBlank(message = "La moneda es obligatoria.") String moneda,
        @NotNull(message = "El porcentaje de impuesto es obligatorio.") @DecimalMin(value = "0.0", inclusive = true) BigDecimal porcentajeImpuesto,
        @NotNull(message = "Debes indicar si los pagos QR estan habilitados.") Boolean pagosQrHabilitado,
        @NotBlank(message = "El proveedor QR es obligatorio.") String proveedorQr,
        String qrCuentaTitular,
        String qrCuentaBanco,
        String qrCuentaNumero,
        String qrCuentaTipo,
        String qrComercioCodigo,
        Integer paginasPorCarta,
        String idiomaDefecto,
        String zonaHoraria,
        String formatoFecha,
        String logoUrl,
        String mensajePieFactura,
        String tipoServicio,
        BigDecimal propinaPorcentaje,
        Boolean propinaIncluida,
        String inventarioValoracion,
        Boolean controlarVencimientos,
        Boolean controlarLotes
) {
}
