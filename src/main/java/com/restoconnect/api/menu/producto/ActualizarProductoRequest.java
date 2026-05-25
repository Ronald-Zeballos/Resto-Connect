package com.restoconnect.api.menu.producto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record ActualizarProductoRequest(
        @NotBlank(message = "El nombre es obligatorio.") String nombre,
        @NotBlank(message = "La descripcion es obligatoria.") String descripcion,
        @NotNull(message = "El precio es obligatorio.") @DecimalMin(value = "0.0", inclusive = false) BigDecimal precio,
        @NotNull(message = "La categoria es obligatoria.") UUID categoriaId,
        String imagenUrl,
        boolean activo,
        String codigoInterno,
        BigDecimal costo,
        boolean esVenta,
        boolean esInsumo,
        BigDecimal impuestoAplicable,
        String unidadMedida
) {
}
