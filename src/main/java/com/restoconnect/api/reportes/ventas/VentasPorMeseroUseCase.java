package com.restoconnect.api.reportes.ventas;

import com.restoconnect.api.pago.EstadoPago;
import com.restoconnect.api.pago.Pago;
import com.restoconnect.api.pago.PagoRepository;
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
public class VentasPorMeseroUseCase {

    private final PagoRepository pagoRepository;

    public List<VentaPorMeseroResponse> ejecutar(LocalDate desde, LocalDate hasta) {
        RangoFechasReporte rango = ReportesDateRangeSupport.resolver(desde, hasta);
        List<Pago> pagos = pagoRepository.findByEstadoAndFechaPagoBetweenOrderByFechaPagoAsc(
                EstadoPago.PAGADO,
                rango.desde(),
                rango.hasta()
        );

        Map<UUID, VentaPorMeseroResponse> agrupado = new HashMap<>();
        for (Pago pago : pagos) {
            UUID meseroId = pago.getPedido().getMeseroValidador() != null
                    ? pago.getPedido().getMeseroValidador().getId()
                    : new UUID(0L, 0L);
            String nombre = pago.getPedido().getMeseroValidador() != null
                    ? pago.getPedido().getMeseroValidador().getNombre()
                    : "Sin asignar";
            VentaPorMeseroResponse actual = agrupado.getOrDefault(
                    meseroId,
                    new VentaPorMeseroResponse(meseroId, nombre, 0L, BigDecimal.ZERO)
            );
            agrupado.put(meseroId, new VentaPorMeseroResponse(
                    meseroId,
                    nombre,
                    actual.pedidosCobrados() + 1,
                    actual.montoTotal().add(pago.getMonto())
            ));
        }

        return agrupado.values().stream()
                .sorted(Comparator.comparing(VentaPorMeseroResponse::montoTotal).reversed())
                .map(item -> new VentaPorMeseroResponse(
                        item.usuarioId(),
                        item.nombreMesero(),
                        item.pedidosCobrados(),
                        item.montoTotal().setScale(2, RoundingMode.HALF_UP)
                ))
                .toList();
    }

    public record VentaPorMeseroResponse(
            UUID usuarioId,
            String nombreMesero,
            Long pedidosCobrados,
            BigDecimal montoTotal
    ) {
    }
}

