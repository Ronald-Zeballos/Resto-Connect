package com.restoconnect.api.inventario.prediccion;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PrediccionReposicionResponse(
        UUID id,
        UUID itemInventarioId,
        String itemInventarioNombre,
        BigDecimal consumoPromedioDiario,
        BigDecimal diasHastaAgotamiento,
        LocalDate fechaEstimadaAgotamiento,
        BigDecimal cantidadSugeridaCompra,
        NivelRiesgoPrediccion nivelRiesgo,
        BigDecimal confianza,
        String motivo,
        OffsetDateTime fechaGeneracion
) {
    public static PrediccionReposicionResponse from(PrediccionReposicion prediccion) {
        return new PrediccionReposicionResponse(
                prediccion.getId(),
                prediccion.getItemInventario().getId(),
                prediccion.getItemInventario().getNombre(),
                prediccion.getConsumoPromedioDiario(),
                prediccion.getDiasHastaAgotamiento(),
                prediccion.getFechaEstimadaAgotamiento(),
                prediccion.getCantidadSugeridaCompra(),
                prediccion.getNivelRiesgo(),
                prediccion.getConfianza(),
                prediccion.getMotivo(),
                prediccion.getFechaGeneracion()
        );
    }
}

