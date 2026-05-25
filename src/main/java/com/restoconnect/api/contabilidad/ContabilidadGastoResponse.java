package com.restoconnect.api.contabilidad;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContabilidadGastoResponse(
        UUID id,
        LocalDate fechaGasto,
        String descripcion,
        String categoriaGasto,
        BigDecimal monto,
        String metodoPago,
        String comprobante,
        UUID proveedorId,
        String proveedorNombre,
        UUID usuarioId,
        String usuarioNombre,
        String observaciones
) {
    public static ContabilidadGastoResponse from(ContabilidadGasto g) {
        return new ContabilidadGastoResponse(
                g.getId(),
                g.getFechaGasto(),
                g.getDescripcion(),
                g.getCategoriaGasto(),
                g.getMonto(),
                g.getMetodoPago(),
                g.getComprobante(),
                g.getProveedor() != null ? g.getProveedor().getId() : null,
                g.getProveedor() != null ? g.getProveedor().getNombre() : null,
                g.getUsuario() != null ? g.getUsuario().getId() : null,
                g.getUsuario() != null ? g.getUsuario().getNombre() : null,
                g.getObservaciones()
        );
    }
}
