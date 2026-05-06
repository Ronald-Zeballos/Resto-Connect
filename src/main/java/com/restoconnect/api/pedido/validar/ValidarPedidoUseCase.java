package com.restoconnect.api.pedido.validar;

import com.restoconnect.api.auth.Usuario;
import com.restoconnect.api.auth.UsuarioRepository;
import com.restoconnect.api.menu.producto.ProductoDisponibilidadService;
import com.restoconnect.api.menu.producto.RecetaProducto;
import com.restoconnect.api.menu.producto.RecetaProductoRepository;
import com.restoconnect.api.pedido.EstadoPedido;
import com.restoconnect.api.pedido.Pedido;
import com.restoconnect.api.pedido.PedidoDetalle;
import com.restoconnect.api.pedido.PedidoRepository;
import com.restoconnect.api.inventario.movimiento.RegistrarSalidaInventarioUseCase;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import com.restoconnect.api.shared.notification.NotificationService;
import com.restoconnect.api.shared.notification.SeveridadNotificacion;
import com.restoconnect.api.shared.notification.TipoNotificacion;
import com.restoconnect.api.auth.RolUsuario;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ValidarPedidoUseCase {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoDisponibilidadService productoDisponibilidadService;
    private final RecetaProductoRepository recetaProductoRepository;
    private final RegistrarSalidaInventarioUseCase registrarSalidaInventarioUseCase;
    private final NotificationService notificationService;

    @Transactional
    public ValidarPedidoResponse ejecutar(UUID pedidoId, UUID meseroId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado."));
        if (pedido.getEstado() != EstadoPedido.PENDIENTE_VALIDACION) {
            throw new BusinessException("Solo se pueden validar pedidos pendientes.");
        }

        for (PedidoDetalle detalle : pedido.getDetalles()) {
            if (!productoDisponibilidadService.puedePrepararse(detalle.getProducto(), detalle.getCantidad())) {
                throw new BusinessException("No hay stock suficiente para " + detalle.getProducto().getNombre() + ".");
            }
        }

        for (PedidoDetalle detalle : pedido.getDetalles()) {
            List<RecetaProducto> recetas = recetaProductoRepository.findByProductoId(detalle.getProducto().getId());
            for (RecetaProducto receta : recetas) {
                registrarSalidaInventarioUseCase.registrarDesdePedido(
                        receta.getItemInventario(),
                        receta.getCantidadNecesaria().multiply(BigDecimal.valueOf(detalle.getCantidad())),
                        "PED-" + pedido.getId()
                );
            }
        }

        Usuario mesero = usuarioRepository.findById(meseroId)
                .orElseThrow(() -> new NotFoundException("Mesero no encontrado."));
        pedido.setEstado(EstadoPedido.CONFIRMADO);
        pedido.setMeseroValidador(mesero);
        Pedido persisted = pedidoRepository.save(pedido);
        notificationService.emitir(
                TipoNotificacion.PEDIDO_PENDIENTE_VALIDACION,
                "Pedido validado",
                "El pedido " + pedido.getId() + " fue validado y enviado a cocina.",
                SeveridadNotificacion.INFO,
                RolUsuario.COCINA,
                "Pedido",
                pedido.getId()
        );
        return ValidarPedidoResponse.from(persisted);
    }
}
