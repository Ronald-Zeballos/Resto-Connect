package com.restoconnect.api.facturacion;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FacturaResponse(
        UUID id,
        UUID pedidoId,
        String numeroFactura,
        String razonSocial,
        String nitCi,
        String email,
        BigDecimal total,
        LocalDate fechaEmision
) {
    public static FacturaResponse from(Factura factura) {
        return new FacturaResponse(
                factura.getId(),
                factura.getPedido().getId(),
                factura.getNumeroFactura(),
                factura.getRazonSocial(),
                factura.getNitCi(),
                factura.getEmail(),
                factura.getTotal(),
                factura.getFechaEmision()
        );
    }
}

