package com.restoconnect.api.contabilidad;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CuentaPagarResponse(
        UUID id,
        UUID proveedorId,
        String proveedorNombre,
        UUID ordenCompraId,
        BigDecimal montoOriginal,
        BigDecimal saldoPendiente,
        LocalDate fechaEmision,
        LocalDate fechaVencimiento,
        String estado,
        String descripcion,
        String numeroComprobante,
        LocalDate fechaUltimoPago
) {
    public static CuentaPagarResponse from(CuentaPagar cp) {
        return new CuentaPagarResponse(
                cp.getId(),
                cp.getProveedor() != null ? cp.getProveedor().getId() : null,
                cp.getProveedor() != null ? cp.getProveedor().getNombre() : null,
                cp.getOrdenCompra() != null ? cp.getOrdenCompra().getId() : null,
                cp.getMontoOriginal(),
                cp.getSaldoPendiente(),
                cp.getFechaEmision(),
                cp.getFechaVencimiento(),
                cp.getEstado(),
                cp.getDescripcion(),
                cp.getNumeroComprobante(),
                cp.getFechaUltimoPago()
        );
    }
}
