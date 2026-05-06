package com.restoconnect.api.pedido.cancelar;

import com.restoconnect.api.mesa.EstadoMesa;
import com.restoconnect.api.pedido.EstadoPedido;
import com.restoconnect.api.pedido.Pedido;
import com.restoconnect.api.pedido.PedidoRepository;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CancelarPedidoUseCase {

    private final PedidoRepository pedidoRepository;

    @Transactional
    public CancelarPedidoResponse ejecutar(UUID pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado."));
        if (pedido.getEstado() != EstadoPedido.PENDIENTE_VALIDACION) {
            throw new BusinessException("Solo se pueden cancelar pedidos pendientes de validacion.");
        }
        pedido.setEstado(EstadoPedido.CANCELADO);
        pedido.getMesa().setEstado(EstadoMesa.LIBRE);
        return CancelarPedidoResponse.from(pedidoRepository.save(pedido));
    }
}
