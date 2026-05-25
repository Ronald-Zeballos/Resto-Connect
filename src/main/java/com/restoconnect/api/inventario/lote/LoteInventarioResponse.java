package com.restoconnect.api.inventario.lote;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LoteInventarioResponse(
        UUID id,
        UUID itemInventarioId,
        String itemInventarioNombre,
        String codigoLote,
        BigDecimal cantidadInicial,
        BigDecimal cantidadRestante,
        LocalDate fechaVencimiento,
        LocalDate fechaIngreso,
        BigDecimal costoUnitario,
        boolean activo,
        String estado
) {
    public static LoteInventarioResponse from(LoteInventario lote) {
        String estado = !lote.isActivo() ? "INACTIVO"
                : lote.getFechaVencimiento() != null && lote.getFechaVencimiento().isBefore(LocalDate.now()) ? "VENCIDO"
                : lote.getFechaVencimiento() != null && lote.getFechaVencimiento().minusDays(7).isBefore(LocalDate.now()) ? "POR_VENCER"
                : lote.getCantidadRestante().compareTo(BigDecimal.ZERO) <= 0 ? "AGOTADO"
                : "DISPONIBLE";

        return new LoteInventarioResponse(
                lote.getId(),
                lote.getItemInventario().getId(),
                lote.getItemInventario().getNombre(),
                lote.getCodigoLote(),
                lote.getCantidadInicial(),
                lote.getCantidadRestante(),
                lote.getFechaVencimiento(),
                lote.getFechaIngreso(),
                lote.getCostoUnitario(),
                lote.isActivo(),
                estado
        );
    }
}
