package com.restoconnect.api.caja;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CierreCajaResponse(
        UUID id,
        OffsetDateTime fechaApertura,
        OffsetDateTime fechaCierre,
        String estado,
        String usuarioAperturaNombre,
        String usuarioCierreNombre,
        BigDecimal saldoInicial,
        BigDecimal saldoEsperado,
        BigDecimal saldoRealDeclarado,
        BigDecimal diferencia,
        String observaciones,
        String detallePagos,
        Integer totalPedidos,
        BigDecimal totalVentas,
        BigDecimal totalImpuesto,
        BigDecimal totalPropinas,
        BigDecimal totalDescuentos,
        BigDecimal totalGastos
) {
    public static CierreCajaResponse from(CierreCaja cierre) {
        return new CierreCajaResponse(
                cierre.getId(),
                cierre.getFechaApertura(),
                cierre.getFechaCierre(),
                cierre.getEstado().name(),
                cierre.getUsuarioApertura().getNombre(),
                cierre.getUsuarioCierre() != null ? cierre.getUsuarioCierre().getNombre() : null,
                cierre.getSaldoInicial(),
                cierre.getSaldoEsperado(),
                cierre.getSaldoRealDeclarado(),
                cierre.getDiferencia(),
                cierre.getObservaciones(),
                cierre.getDetallePagos(),
                cierre.getTotalPedidos(),
                cierre.getTotalVentas(),
                cierre.getTotalImpuesto(),
                cierre.getTotalPropinas(),
                cierre.getTotalDescuentos(),
                cierre.getTotalGastos()
        );
    }
}
