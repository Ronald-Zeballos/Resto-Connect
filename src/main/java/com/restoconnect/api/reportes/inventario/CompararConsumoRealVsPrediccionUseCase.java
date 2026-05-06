package com.restoconnect.api.reportes.inventario;

import com.restoconnect.api.inventario.movimiento.MovimientoInventario;
import com.restoconnect.api.inventario.movimiento.MovimientoInventarioRepository;
import com.restoconnect.api.inventario.movimiento.TipoMovimientoInventario;
import com.restoconnect.api.inventario.prediccion.NivelRiesgoPrediccion;
import com.restoconnect.api.inventario.prediccion.PrediccionReposicion;
import com.restoconnect.api.inventario.prediccion.PrediccionReposicionRepository;
import com.restoconnect.api.reportes.RangoFechasReporte;
import com.restoconnect.api.reportes.ReportesDateRangeSupport;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompararConsumoRealVsPrediccionUseCase {

    private final MovimientoInventarioRepository movimientoInventarioRepository;
    private final PrediccionReposicionRepository prediccionReposicionRepository;

    public List<ComparacionConsumoResponse> ejecutar(LocalDate desde, LocalDate hasta) {
        RangoFechasReporte rango = ReportesDateRangeSupport.resolver(desde, hasta);
        List<MovimientoInventario> movimientos = movimientoInventarioRepository.findByTipoMovimientoAndFechaMovimientoBetweenOrderByFechaMovimientoAsc(
                TipoMovimientoInventario.SALIDA,
                rango.desde(),
                rango.hasta()
        );

        Map<UUID, BigDecimal> consumoReal = new HashMap<>();
        Map<UUID, String> nombres = new HashMap<>();
        for (MovimientoInventario movimiento : movimientos) {
            consumoReal.merge(movimiento.getItemInventario().getId(), movimiento.getCantidad(), BigDecimal::add);
            nombres.put(movimiento.getItemInventario().getId(), movimiento.getItemInventario().getNombre());
        }

        Map<UUID, PrediccionReposicion> ultimasPredicciones = new LinkedHashMap<>();
        for (PrediccionReposicion prediccion : prediccionReposicionRepository.findAllByOrderByFechaGeneracionDesc()) {
            ultimasPredicciones.putIfAbsent(prediccion.getItemInventario().getId(), prediccion);
            nombres.putIfAbsent(prediccion.getItemInventario().getId(), prediccion.getItemInventario().getNombre());
        }

        return nombres.keySet().stream()
                .map(itemId -> {
                    BigDecimal real = consumoReal.getOrDefault(itemId, BigDecimal.ZERO);
                    PrediccionReposicion prediccion = ultimasPredicciones.get(itemId);
                    BigDecimal predicho = prediccion != null
                            ? prediccion.getConsumoPromedioDiario().multiply(BigDecimal.valueOf(rango.dias()))
                            : BigDecimal.ZERO;
                    BigDecimal diferencia = real.subtract(predicho);
                    BigDecimal desviacion = predicho.compareTo(BigDecimal.ZERO) == 0
                            ? (real.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO : BigDecimal.valueOf(100))
                            : diferencia.multiply(BigDecimal.valueOf(100)).divide(predicho, 2, RoundingMode.HALF_UP);
                    return new ComparacionConsumoResponse(
                            itemId,
                            nombres.get(itemId),
                            real.setScale(2, RoundingMode.HALF_UP),
                            predicho.setScale(2, RoundingMode.HALF_UP),
                            diferencia.setScale(2, RoundingMode.HALF_UP),
                            desviacion,
                            prediccion != null ? prediccion.getNivelRiesgo() : NivelRiesgoPrediccion.BAJO,
                            prediccion != null ? prediccion.getConfianza().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                    );
                })
                .sorted(Comparator.comparing((ComparacionConsumoResponse item) -> item.diferencia().abs()).reversed())
                .toList();
    }

    public record ComparacionConsumoResponse(
            UUID itemInventarioId,
            String nombreItem,
            BigDecimal consumoReal,
            BigDecimal consumoPredicho,
            BigDecimal diferencia,
            BigDecimal desviacionPorcentual,
            NivelRiesgoPrediccion nivelRiesgo,
            BigDecimal confianzaPrediccion
    ) {
    }
}

