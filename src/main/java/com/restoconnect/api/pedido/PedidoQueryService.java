package com.restoconnect.api.pedido;

import com.restoconnect.api.shared.exception.NotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PedidoQueryService {

    private final PedidoRepository pedidoRepository;

    @Transactional(readOnly = true)
    public PedidoResponse obtener(UUID id) {
        return pedidoRepository.findById(id)
                .map(PedidoResponse::from)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado."));
    }

    @Transactional(readOnly = true)
    public PedidoResponse obtenerActivoPorMesa(UUID mesaId) {
        return pedidoRepository.findFirstByMesaIdAndEstadoIn(
                mesaId,
                List.of(EstadoPedido.PENDIENTE_VALIDACION, EstadoPedido.CONFIRMADO, EstadoPedido.EN_PREPARACION, EstadoPedido.LISTO, EstadoPedido.ENTREGADO)
        ).map(PedidoResponse::from)
                .orElseThrow(() -> new NotFoundException("No existe pedido activo para la mesa."));
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> pendientes() {
        return pedidoRepository.findByEstadoOrderByFechaCreacionDesc(EstadoPedido.PENDIENTE_VALIDACION)
                .stream()
                .map(PedidoResponse::from)
                .toList();
    }
}
