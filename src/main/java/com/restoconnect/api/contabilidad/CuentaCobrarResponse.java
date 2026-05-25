package com.restoconnect.api.contabilidad;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CuentaCobrarResponse(
        UUID id,
        UUID clienteId,
        String clienteNombre,
        UUID pedidoId,
        BigDecimal montoOriginal,
        BigDecimal saldoPendiente,
        LocalDate fechaEmision,
        LocalDate fechaVencimiento,
        String estado,
        String descripcion,
        LocalDate fechaUltimoCobro
) {
    public static CuentaCobrarResponse from(CuentaCobrar cc) {
        return new CuentaCobrarResponse(
                cc.getId(),
                cc.getCliente() != null ? cc.getCliente().getId() : null,
                cc.getCliente() != null ? cc.getCliente().getNombre() : null,
                cc.getPedido() != null ? cc.getPedido().getId() : null,
                cc.getMontoOriginal(),
                cc.getSaldoPendiente(),
                cc.getFechaEmision(),
                cc.getFechaVencimiento(),
                cc.getEstado(),
                cc.getDescripcion(),
                cc.getFechaUltimoCobro()
        );
    }
}
