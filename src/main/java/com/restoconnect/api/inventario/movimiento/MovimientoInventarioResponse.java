package com.restoconnect.api.inventario.movimiento;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record MovimientoInventarioResponse(
        UUID id,
        UUID itemInventarioId,
        String itemInventarioNombre,
        TipoMovimientoInventario tipoMovimiento,
        BigDecimal cantidad,
        String motivo,
        String referencia,
        OffsetDateTime fechaMovimiento,
        BigDecimal stockActual
) {
    public static MovimientoInventarioResponse from(MovimientoInventario movimientoInventario) {
        return new MovimientoInventarioResponse(
                movimientoInventario.getId(),
                movimientoInventario.getItemInventario().getId(),
                movimientoInventario.getItemInventario().getNombre(),
                movimientoInventario.getTipoMovimiento(),
                movimientoInventario.getCantidad(),
                movimientoInventario.getMotivo(),
                movimientoInventario.getReferencia(),
                movimientoInventario.getFechaMovimiento(),
                movimientoInventario.getItemInventario().getStockActual()
        );
    }
}

