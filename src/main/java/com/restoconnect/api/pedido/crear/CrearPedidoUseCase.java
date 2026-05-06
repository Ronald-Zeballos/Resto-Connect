package com.restoconnect.api.pedido.crear;

import com.restoconnect.api.auth.RolUsuario;
import com.restoconnect.api.menu.producto.Producto;
import com.restoconnect.api.menu.producto.ProductoRepository;
import com.restoconnect.api.mesa.EstadoMesa;
import com.restoconnect.api.mesa.Mesa;
import com.restoconnect.api.mesa.MesaService;
import com.restoconnect.api.pago.MetodoPago;
import com.restoconnect.api.pedido.EstadoPedido;
import com.restoconnect.api.pedido.Pedido;
import com.restoconnect.api.pedido.PedidoDetalle;
import com.restoconnect.api.pedido.PedidoRepository;
import com.restoconnect.api.shared.domain.MoneyUtils;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import com.restoconnect.api.shared.notification.NotificationService;
import com.restoconnect.api.shared.notification.SeveridadNotificacion;
import com.restoconnect.api.shared.notification.TipoNotificacion;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CrearPedidoUseCase {

    private final PedidoRepository pedidoRepository;
    private final MesaService mesaService;
    private final ProductoRepository productoRepository;
    private final NotificationService notificationService;

    @Transactional
    public CrearPedidoResponse ejecutar(CrearPedidoRequest request) {
        Mesa mesa = mesaService.obtenerActiva(request.mesaId());
        pedidoRepository.findFirstByMesaIdAndEstadoIn(
                mesa.getId(),
                List.of(EstadoPedido.PENDIENTE_VALIDACION, EstadoPedido.CONFIRMADO, EstadoPedido.EN_PREPARACION, EstadoPedido.LISTO, EstadoPedido.ENTREGADO)
        ).ifPresent(existing -> {
            throw new BusinessException("La mesa ya tiene un pedido activo.");
        });

        Pedido pedido = new Pedido();
        pedido.setMesa(mesa);
        pedido.setEstado(EstadoPedido.PENDIENTE_VALIDACION);
        pedido.setMetodoPago(request.metodoPago());
        pedido.setTotal(BigDecimal.ZERO);

        BigDecimal total = BigDecimal.ZERO;
        for (DetallePedidoRequest detalleRequest : request.detalles()) {
            Producto producto = productoRepository.findById(detalleRequest.productoId())
                    .orElseThrow(() -> new NotFoundException("Producto no encontrado."));
            if (!producto.isActivo() || !producto.isDisponible()) {
                throw new BusinessException("El producto " + producto.getNombre() + " no esta disponible.");
            }
            PedidoDetalle detalle = new PedidoDetalle();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(detalleRequest.cantidad());
            detalle.setPrecioUnitario(MoneyUtils.scale(producto.getPrecio()));
            detalle.setSubtotal(MoneyUtils.scale(producto.getPrecio().multiply(BigDecimal.valueOf(detalleRequest.cantidad()))));
            pedido.getDetalles().add(detalle);
            total = total.add(detalle.getSubtotal());
        }

        pedido.setTotal(MoneyUtils.scale(total));
        Pedido persisted = pedidoRepository.save(pedido);
        mesa.setEstado(EstadoMesa.OCUPADA);
        notificationService.emitir(
                TipoNotificacion.PEDIDO_PENDIENTE_VALIDACION,
                "Pedido pendiente",
                "La mesa " + mesa.getNumero() + " registro un pedido pendiente de validacion.",
                SeveridadNotificacion.MEDIA,
                RolUsuario.MESERO,
                "Pedido",
                persisted.getId()
        );
        return CrearPedidoResponse.from(persisted);
    }

    public record CrearPedidoRequest(
            @NotNull(message = "La mesa es obligatoria.") UUID mesaId,
            @NotNull(message = "El metodo de pago es obligatorio.") MetodoPago metodoPago,
            @NotEmpty(message = "El pedido debe tener al menos un producto.") List<@Valid DetallePedidoRequest> detalles
    ) {
    }

    public record DetallePedidoRequest(
            @NotNull(message = "El producto es obligatorio.") UUID productoId,
            @NotNull(message = "La cantidad es obligatoria.") @Min(value = 1, message = "La cantidad debe ser mayor a cero.") Integer cantidad
    ) {
    }
}

