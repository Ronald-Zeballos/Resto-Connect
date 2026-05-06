package com.restoconnect.api.reportes.inventario;

import com.restoconnect.api.inventario.movimiento.MovimientoInventario;
import com.restoconnect.api.inventario.movimiento.MovimientoInventarioRepository;
import com.restoconnect.api.inventario.movimiento.TipoMovimientoInventario;
import com.restoconnect.api.reportes.RangoFechasReporte;
import com.restoconnect.api.reportes.ReportesDateRangeSupport;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConsumoInventarioPorPeriodoUseCase {

    private final MovimientoInventarioRepository movimientoInventarioRepository;

    public List<ConsumoInventarioResponse> ejecutar(LocalDate desde, LocalDate hasta) {
        RangoFechasReporte rango = ReportesDateRangeSupport.resolver(desde, hasta);
        List<MovimientoInventario> movimientos = movimientoInventarioRepository.findByTipoMovimientoAndFechaMovimientoBetweenOrderByFechaMovimientoAsc(
                TipoMovimientoInventario.SALIDA,
                rango.desde(),
                rango.hasta()
        );

        Map<UUID, ConsumoInventarioResponse> agrupado = new HashMap<>();
        for (MovimientoInventario movimiento : movimientos) {
            BigDecimal costoMovimiento = movimiento.getCantidad().multiply(movimiento.getItemInventario().getCostoUnitario());
            ConsumoInventarioResponse actual = agrupado.getOrDefault(
                    movimiento.getItemInventario().getId(),
                    new ConsumoInventarioResponse(
                            movimiento.getItemInventario().getId(),
                            movimiento.getItemInventario().getNombre(),
                            movimiento.getItemInventario().getUnidadMedida().name(),
                            BigDecimal.ZERO,
                            0L,
                            BigDecimal.ZERO
                    )
            );
            agrupado.put(movimiento.getItemInventario().getId(), new ConsumoInventarioResponse(
                    actual.itemInventarioId(),
                    actual.nombreItem(),
                    actual.unidadMedida(),
                    actual.cantidadConsumida().add(movimiento.getCantidad()),
                    actual.movimientos() + 1,
                    actual.costoEstimado().add(costoMovimiento)
            ));
        }

        return agrupado.values().stream()
                .sorted(Comparator.comparing(ConsumoInventarioResponse::cantidadConsumida).reversed())
                .map(item -> new ConsumoInventarioResponse(
                        item.itemInventarioId(),
                        item.nombreItem(),
                        item.unidadMedida(),
                        item.cantidadConsumida().setScale(2, RoundingMode.HALF_UP),
                        item.movimientos(),
                        item.costoEstimado().setScale(2, RoundingMode.HALF_UP)
                ))
                .toList();
    }

    public record ConsumoInventarioResponse(
            UUID itemInventarioId,
            String nombreItem,
            String unidadMedida,
            BigDecimal cantidadConsumida,
            Long movimientos,
            BigDecimal costoEstimado
    ) {
    }
}

