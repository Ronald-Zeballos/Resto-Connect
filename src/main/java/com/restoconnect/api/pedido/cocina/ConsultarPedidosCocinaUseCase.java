package com.restoconnect.api.pedido.cocina;

import com.restoconnect.api.pedido.EstadoPedido;
import com.restoconnect.api.pedido.Pedido;
import com.restoconnect.api.pedido.PedidoRepository;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConsultarPedidosCocinaUseCase {

    private final PedidoRepository pedidoRepository;

    public List<PedidoCocinaResponse> ejecutar() {
        return pedidoRepository.findByEstadoInOrderByFechaCreacionDesc(
                        List.of(EstadoPedido.CONFIRMADO, EstadoPedido.EN_PREPARACION, EstadoPedido.LISTO)
                ).stream()
                .map(this::map)
                .toList();
    }

    private PedidoCocinaResponse map(Pedido pedido) {
        long minutosEspera = Duration.between(pedido.getFechaCreacion(), OffsetDateTime.now(ZoneOffset.UTC)).toMinutes();
        return new PedidoCocinaResponse(
                pedido.getId(),
                pedido.getMesa().getNumero(),
                pedido.getEstado().name(),
                pedido.getTotal(),
                minutosEspera,
                pedido.getDetalles().stream()
                        .map(detalle -> new PedidoCocinaDetalleResponse(
                                detalle.getProducto().getNombre(),
                                detalle.getCantidad()
                        ))
                        .toList()
        );
    }

    public record PedidoCocinaResponse(
            java.util.UUID pedidoId,
            Integer mesaNumero,
            String estado,
            java.math.BigDecimal total,
            Long minutosEspera,
            List<PedidoCocinaDetalleResponse> detalles
    ) {
    }

    public record PedidoCocinaDetalleResponse(
            String producto,
            Integer cantidad
    ) {
    }
}

