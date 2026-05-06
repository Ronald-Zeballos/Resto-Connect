package com.restoconnect.api.inventario.prediccion;

import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.inventario.movimiento.MovimientoInventario;
import com.restoconnect.api.inventario.parametros.ParametroInventario;
import com.restoconnect.api.shared.domain.MoneyUtils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class MotorPrediccionReglas implements MotorPrediccionInventario {

    @Override
    public PrediccionCalculada calcular(ItemInventario item, List<MovimientoInventario> salidasHistoricas, ParametroInventario parametros) {
        BigDecimal totalSalidas = salidasHistoricas.stream()
                .map(MovimientoInventario::getCantidad)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal diasAnalisis = BigDecimal.valueOf(Math.max(parametros.getDiasAnalisisConsumo(), 1));
        BigDecimal consumoPromedio;
        BigDecimal confianza;
        String motivo;

        if (salidasHistoricas.isEmpty()) {
            consumoPromedio = item.getStockMinimo().max(BigDecimal.ONE)
                    .divide(BigDecimal.valueOf(30), 4, RoundingMode.HALF_UP);
            confianza = BigDecimal.valueOf(35);
            motivo = "Sin historial suficiente, se aplicaron reglas basadas en stock minimo.";
        } else if (salidasHistoricas.size() < 7) {
            consumoPromedio = totalSalidas.divide(BigDecimal.valueOf(salidasHistoricas.size()), 4, RoundingMode.HALF_UP);
            confianza = BigDecimal.valueOf(60);
            motivo = "Historial parcial, se uso promedio simple por salidas recientes.";
        } else {
            consumoPromedio = totalSalidas.divide(diasAnalisis, 4, RoundingMode.HALF_UP);
            confianza = BigDecimal.valueOf(85);
            motivo = "Prediccion basada en promedio movil de salidas recientes.";
        }

        if (consumoPromedio.compareTo(BigDecimal.ZERO) <= 0) {
            consumoPromedio = BigDecimal.valueOf(0.10);
        }

        BigDecimal diasHastaAgotamiento = item.getStockActual()
                .divide(consumoPromedio, 2, RoundingMode.HALF_UP);
        LocalDate fechaAgotamiento = LocalDate.now().plusDays(Math.max(diasHastaAgotamiento.longValue(), 0L));

        BigDecimal coberturaTotal = BigDecimal.valueOf(item.getTiempoEntregaProveedorDias() + parametros.getDiasCoberturaDeseada());
        BigDecimal baseCompra = consumoPromedio.multiply(coberturaTotal);
        BigDecimal margen = BigDecimal.ONE.add(parametros.getPorcentajeMargenSeguridad().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        BigDecimal sugerida = baseCompra.multiply(margen).subtract(item.getStockActual());
        if (sugerida.compareTo(BigDecimal.ZERO) < 0) {
            sugerida = BigDecimal.ZERO;
        }

        NivelRiesgoPrediccion riesgo = diasHastaAgotamiento.compareTo(BigDecimal.ONE) <= 0 || item.getStockActual().compareTo(BigDecimal.ZERO) <= 0
                ? NivelRiesgoPrediccion.CRITICO
                : diasHastaAgotamiento.compareTo(BigDecimal.valueOf(item.getTiempoEntregaProveedorDias())) <= 0
                ? NivelRiesgoPrediccion.ALTO
                : item.getStockActual().compareTo(item.getPuntoReorden()) <= 0
                ? NivelRiesgoPrediccion.MEDIO
                : NivelRiesgoPrediccion.BAJO;

        return new PrediccionCalculada(
                consumoPromedio,
                MoneyUtils.scale(diasHastaAgotamiento),
                fechaAgotamiento,
                MoneyUtils.scale(sugerida),
                riesgo,
                confianza,
                motivo
        );
    }
}

