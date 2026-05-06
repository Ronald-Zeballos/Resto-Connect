package com.restoconnect.api.pedido.estado;

import com.restoconnect.api.pedido.EstadoPedido;
import com.restoconnect.api.pedido.Pedido;
import com.restoconnect.api.pedido.PedidoRepository;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActualizarEstadoPedidoUseCase {

    private final PedidoRepository pedidoRepository;

    @Transactional
    public EstadoPedidoResponse ejecutar(UUID pedidoId, CambiarEstadoPedidoRequest request) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado."));
        if (request.estado() == EstadoPedido.PAGADO) {
            throw new BusinessException("El estado PAGADO se gestiona desde el modulo de pagos.");
        }
        pedido.setEstado(request.estado());
        return EstadoPedidoResponse.from(pedidoRepository.save(pedido));
    }

    public record CambiarEstadoPedidoRequest(@NotNull EstadoPedido estado) {
    }
}
