package com.restoconnect.api.inventario.conteo;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ConteoFisicoResponse(
        UUID id,
        LocalDate fechaConteo,
        Integer numeroConteo,
        String estado,
        String observaciones,
        String usuarioNombre,
        Integer totalItemsContados,
        Integer totalDiferencias,
        BigDecimal totalAjusteValor
) {
    public static ConteoFisicoResponse from(ConteoFisicoInventario conteo) {
        return new ConteoFisicoResponse(
                conteo.getId(),
                conteo.getFechaConteo(),
                conteo.getNumeroConteo(),
                conteo.getEstado().name(),
                conteo.getObservaciones(),
                conteo.getUsuario() != null ? conteo.getUsuario().getNombre() : null,
                conteo.getTotalItemsContados(),
                conteo.getTotalDiferencias(),
                conteo.getTotalAjusteValor()
        );
    }
}
