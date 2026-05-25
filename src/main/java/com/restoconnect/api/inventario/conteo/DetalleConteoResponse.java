package com.restoconnect.api.inventario.conteo;

import java.math.BigDecimal;
import java.util.UUID;

public record DetalleConteoResponse(
        UUID id,
        UUID conteoId,
        UUID itemInventarioId,
        String itemInventarioNombre,
        BigDecimal cantidadSistema,
        BigDecimal cantidadFisica,
        BigDecimal diferencia,
        BigDecimal costoUnitario,
        BigDecimal ajusteValor,
        String observaciones
) {
    public static DetalleConteoResponse from(DetalleConteoFisico detalle) {
        return new DetalleConteoResponse(
                detalle.getId(),
                detalle.getConteo().getId(),
                detalle.getItemInventario().getId(),
                detalle.getItemInventario().getNombre(),
                detalle.getCantidadSistema(),
                detalle.getCantidadFisica(),
                detalle.getDiferencia(),
                detalle.getCostoUnitario(),
                detalle.getAjusteValor(),
                detalle.getObservaciones()
        );
    }
}
