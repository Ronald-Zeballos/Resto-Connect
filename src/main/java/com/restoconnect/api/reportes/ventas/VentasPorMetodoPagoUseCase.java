package com.restoconnect.api.reportes.ventas;

import com.restoconnect.api.pago.EstadoPago;
import com.restoconnect.api.pago.MetodoPago;
import com.restoconnect.api.pago.Pago;
import com.restoconnect.api.pago.PagoRepository;
import com.restoconnect.api.reportes.RangoFechasReporte;
import com.restoconnect.api.reportes.ReportesDateRangeSupport;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VentasPorMetodoPagoUseCase {

    private final PagoRepository pagoRepository;

    public List<VentaMetodoPagoResponse> ejecutar(LocalDate desde, LocalDate hasta) {
        RangoFechasReporte rango = ReportesDateRangeSupport.resolver(desde, hasta);
        List<Pago> pagos = pagoRepository.findByEstadoAndFechaPagoBetweenOrderByFechaPagoAsc(
                EstadoPago.PAGADO,
                rango.desde(),
                rango.hasta()
        );

        Map<MetodoPago, VentaMetodoPagoResponse> agrupado = new EnumMap<>(MetodoPago.class);
        for (Pago pago : pagos) {
            VentaMetodoPagoResponse actual = agrupado.getOrDefault(
                    pago.getMetodo(),
                    new VentaMetodoPagoResponse(pago.getMetodo(), 0L, BigDecimal.ZERO)
            );
            agrupado.put(pago.getMetodo(), new VentaMetodoPagoResponse(
                    pago.getMetodo(),
                    actual.transacciones() + 1,
                    actual.montoTotal().add(pago.getMonto())
            ));
        }

        return agrupado.values().stream()
                .sorted(Comparator.comparing(VentaMetodoPagoResponse::montoTotal).reversed())
                .map(item -> new VentaMetodoPagoResponse(
                        item.metodoPago(),
                        item.transacciones(),
                        item.montoTotal().setScale(2, RoundingMode.HALF_UP)
                ))
                .toList();
    }

    public record VentaMetodoPagoResponse(
            MetodoPago metodoPago,
            Long transacciones,
            BigDecimal montoTotal
    ) {
    }
}

