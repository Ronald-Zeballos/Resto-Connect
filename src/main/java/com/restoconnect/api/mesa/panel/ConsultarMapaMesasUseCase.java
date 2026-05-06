package com.restoconnect.api.mesa.panel;

import com.restoconnect.api.mesa.Mesa;
import com.restoconnect.api.mesa.MesaRepository;
import com.restoconnect.api.pedido.EstadoPedido;
import com.restoconnect.api.pedido.Pedido;
import com.restoconnect.api.pedido.PedidoRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConsultarMapaMesasUseCase {

    private final MesaRepository mesaRepository;
    private final PedidoRepository pedidoRepository;

    public List<MapaMesaResponse> ejecutar() {
        return mesaRepository.findAllByOrderByNumeroAsc().stream()
                .map(this::map)
                .toList();
    }

    private MapaMesaResponse map(Mesa mesa) {
        Pedido pedidoActivo = pedidoRepository.findFirstByMesaIdAndEstadoIn(
                mesa.getId(),
                List.of(EstadoPedido.PENDIENTE_VALIDACION, EstadoPedido.CONFIRMADO, EstadoPedido.EN_PREPARACION, EstadoPedido.LISTO, EstadoPedido.ENTREGADO)
        ).orElse(null);

        return new MapaMesaResponse(
                mesa.getId(),
                mesa.getNumero(),
                mesa.getEstado().name(),
                pedidoActivo != null ? pedidoActivo.getId() : null,
                pedidoActivo != null ? pedidoActivo.getEstado().name() : null,
                pedidoActivo != null ? pedidoActivo.getTotal() : BigDecimal.ZERO,
                pedidoActivo != null ? pedidoActivo.getMetodoPago().name() : null
        );
    }

    public record MapaMesaResponse(
            java.util.UUID mesaId,
            Integer numeroMesa,
            String estadoMesa,
            java.util.UUID pedidoActivoId,
            String estadoPedido,
            BigDecimal totalPedido,
            String metodoPago
    ) {
    }
}

