package com.restoconnect.api.caja;

import java.math.BigDecimal;
import java.util.UUID;

public record CajaGastoResponse(
        UUID id,
        UUID cierreCajaId,
        String descripcion,
        String categoriaGasto,
        BigDecimal monto,
        String metodoPago,
        String comprobante
) {
    public static CajaGastoResponse from(CajaGasto gasto) {
        return new CajaGastoResponse(
                gasto.getId(),
                gasto.getCierreCaja().getId(),
                gasto.getDescripcion(),
                gasto.getCategoriaGasto(),
                gasto.getMonto(),
                gasto.getMetodoPago(),
                gasto.getComprobante()
        );
    }
}
