package com.restoconnect.api.reportes.ventas;

import com.restoconnect.api.pago.EstadoPago;
import com.restoconnect.api.pago.Pago;
import com.restoconnect.api.pago.PagoRepository;
import com.restoconnect.api.reportes.RangoFechasReporte;
import com.restoconnect.api.reportes.ReportesDateRangeSupport;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VentasPorRangoUseCase {

    private final PagoRepository pagoRepository;

    public VentasPorRangoResponse ejecutar(LocalDate desde, LocalDate hasta) {
        RangoFechasReporte rango = ReportesDateRangeSupport.resolver(desde, hasta);
        List<Pago> pagos = pagoRepository.findByEstadoAndFechaPagoBetweenOrderByFechaPagoAsc(
                EstadoPago.PAGADO,
                rango.desde(),
                rango.hasta()
        );

        Map<LocalDate, DetalleDiarioResponse> diario = new LinkedHashMap<>();
        BigDecimal total = BigDecimal.ZERO;
        for (Pago pago : pagos) {
            LocalDate fecha = pago.getFechaPago().toLocalDate();
            DetalleDiarioResponse actual = diario.getOrDefault(
                    fecha,
                    new DetalleDiarioResponse(fecha, 0L, BigDecimal.ZERO)
            );
            BigDecimal nuevoMonto = actual.monto().add(pago.getMonto());
            diario.put(fecha, new DetalleDiarioResponse(fecha, actual.transacciones() + 1, nuevoMonto));
            total = total.add(pago.getMonto());
        }

        BigDecimal ticketPromedio = pagos.isEmpty()
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : total.divide(BigDecimal.valueOf(pagos.size()), 2, RoundingMode.HALF_UP);

        return new VentasPorRangoResponse(
                rango.desdeFecha(),
                rango.hastaFecha(),
                (long) pagos.size(),
                total.setScale(2, RoundingMode.HALF_UP),
                ticketPromedio,
                diario.values().stream()
                        .map(item -> new DetalleDiarioResponse(
                                item.fecha(),
                                item.transacciones(),
                                item.monto().setScale(2, RoundingMode.HALF_UP)
                        ))
                        .toList()
        );
    }

    public record VentasPorRangoResponse(
            LocalDate desde,
            LocalDate hasta,
            Long transacciones,
            BigDecimal montoTotal,
            BigDecimal ticketPromedio,
            List<DetalleDiarioResponse> detalleDiario
    ) {
    }

    public record DetalleDiarioResponse(
            LocalDate fecha,
            Long transacciones,
            BigDecimal monto
    ) {
    }
}

