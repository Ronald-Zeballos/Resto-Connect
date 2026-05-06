package com.restoconnect.api.reportes.ventas;

import com.restoconnect.api.pago.EstadoPago;
import com.restoconnect.api.pago.Pago;
import com.restoconnect.api.pago.PagoRepository;
import com.restoconnect.api.pedido.PedidoDetalle;
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
public class ProductosMasVendidosUseCase {

    private final PagoRepository pagoRepository;

    public List<ProductoVendidoResponse> ejecutar(LocalDate desde, LocalDate hasta) {
        RangoFechasReporte rango = ReportesDateRangeSupport.resolver(desde, hasta);
        List<Pago> pagos = pagoRepository.findByEstadoAndFechaPagoBetweenOrderByFechaPagoAsc(
                EstadoPago.PAGADO,
                rango.desde(),
                rango.hasta()
        );

        Map<UUID, ProductoVendidoResponse> acumulado = new HashMap<>();
        for (Pago pago : pagos) {
            for (PedidoDetalle detalle : pago.getPedido().getDetalles()) {
                ProductoVendidoResponse actual = acumulado.getOrDefault(
                        detalle.getProducto().getId(),
                        new ProductoVendidoResponse(
                                detalle.getProducto().getId(),
                                detalle.getProducto().getNombre(),
                                0L,
                                BigDecimal.ZERO
                        )
                );
                acumulado.put(detalle.getProducto().getId(), new ProductoVendidoResponse(
                        actual.productoId(),
                        actual.nombreProducto(),
                        actual.cantidadVendida() + detalle.getCantidad(),
                        actual.ingresos().add(detalle.getSubtotal())
                ));
            }
        }

        return acumulado.values().stream()
                .sorted(Comparator.comparing(
                                ProductoVendidoResponse::cantidadVendida,
                                Comparator.reverseOrder()
                        ).thenComparing(
                                ProductoVendidoResponse::ingresos,
                                Comparator.reverseOrder()
                        ))
                .map(item -> new ProductoVendidoResponse(
                        item.productoId(),
                        item.nombreProducto(),
                        item.cantidadVendida(),
                        item.ingresos().setScale(2, RoundingMode.HALF_UP)
                ))
                .toList();
    }

    public record ProductoVendidoResponse(
            UUID productoId,
            String nombreProducto,
            Long cantidadVendida,
            BigDecimal ingresos
    ) {
    }
}
