package com.restoconnect.api.inventario.item;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record CrearItemInventarioRequest(
        @NotBlank(message = "El nombre es obligatorio.") String nombre,
        @NotBlank(message = "La descripcion es obligatoria.") String descripcion,
        @NotNull(message = "La unidad de medida es obligatoria.") UnidadMedida unidadMedida,
        @NotNull(message = "El stock actual es obligatorio.") @DecimalMin(value = "0.0", inclusive = true) BigDecimal stockActual,
        @NotNull(message = "El stock minimo es obligatorio.") @DecimalMin(value = "0.0", inclusive = true) BigDecimal stockMinimo,
        @NotNull(message = "El stock maximo es obligatorio.") @DecimalMin(value = "0.0", inclusive = true) BigDecimal stockMaximo,
        @NotNull(message = "El punto de reorden es obligatorio.") @DecimalMin(value = "0.0", inclusive = true) BigDecimal puntoReorden,
        @NotNull(message = "El costo unitario es obligatorio.") @DecimalMin(value = "0.0", inclusive = true) BigDecimal costoUnitario,
        UUID proveedorPreferidoId,
        @NotNull(message = "El tiempo de entrega es obligatorio.") Integer tiempoEntregaProveedorDias,
        ClasificacionAbc clasificacionAbc
) {
}

