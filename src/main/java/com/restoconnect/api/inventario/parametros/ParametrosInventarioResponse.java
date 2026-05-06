package com.restoconnect.api.inventario.parametros;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

public record ParametrosInventarioResponse(
        UUID id,
        Integer diasAnalisisConsumo,
        Integer diasCoberturaDeseada,
        BigDecimal porcentajeMargenSeguridad,
        boolean activarPrediccionAutomatica,
        boolean activarAlertasEmail,
        boolean activarAlertasWebSocket,
        LocalTime horaEjecucionPrediccionDiaria,
        BigDecimal stockMinimoGlobalOpcional,
        MetodoPrediccion metodoPrediccion
) {
    public static ParametrosInventarioResponse from(ParametroInventario parametro) {
        return new ParametrosInventarioResponse(
                parametro.getId(),
                parametro.getDiasAnalisisConsumo(),
                parametro.getDiasCoberturaDeseada(),
                parametro.getPorcentajeMargenSeguridad(),
                parametro.isActivarPrediccionAutomatica(),
                parametro.isActivarAlertasEmail(),
                parametro.isActivarAlertasWebSocket(),
                parametro.getHoraEjecucionPrediccionDiaria(),
                parametro.getStockMinimoGlobalOpcional(),
                parametro.getMetodoPrediccion()
        );
    }
}

