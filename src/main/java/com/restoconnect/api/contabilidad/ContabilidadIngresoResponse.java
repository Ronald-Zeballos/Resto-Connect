package com.restoconnect.api.contabilidad;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContabilidadIngresoResponse(
        UUID id,
        LocalDate fechaIngreso,
        String descripcion,
        String categoriaIngreso,
        BigDecimal monto,
        String metodoPago,
        String comprobante,
        UUID clienteId,
        String clienteNombre,
        UUID usuarioId,
        String usuarioNombre,
        String observaciones
) {
    public static ContabilidadIngresoResponse from(ContabilidadIngreso i) {
        return new ContabilidadIngresoResponse(
                i.getId(),
                i.getFechaIngreso(),
                i.getDescripcion(),
                i.getCategoriaIngreso(),
                i.getMonto(),
                i.getMetodoPago(),
                i.getComprobante(),
                i.getCliente() != null ? i.getCliente().getId() : null,
                i.getCliente() != null ? i.getCliente().getNombre() : null,
                i.getUsuario() != null ? i.getUsuario().getId() : null,
                i.getUsuario() != null ? i.getUsuario().getNombre() : null,
                i.getObservaciones()
        );
    }
}
