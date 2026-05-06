package com.restoconnect.api.pago.efectivo;

import com.restoconnect.api.auth.RolUsuario;
import com.restoconnect.api.facturacion.DatosFacturacionRequest;
import com.restoconnect.api.facturacion.FacturaResponse;
import com.restoconnect.api.facturacion.GenerarFacturaUseCase;
import com.restoconnect.api.mesa.EstadoMesa;
import com.restoconnect.api.pago.EstadoPago;
import com.restoconnect.api.pago.MetodoPago;
import com.restoconnect.api.pago.Pago;
import com.restoconnect.api.pago.PagoRepository;
import com.restoconnect.api.pago.PagoResponse;
import com.restoconnect.api.pedido.EstadoPedido;
import com.restoconnect.api.pedido.Pedido;
import com.restoconnect.api.pedido.PedidoRepository;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import com.restoconnect.api.shared.notification.NotificationService;
import com.restoconnect.api.shared.notification.SeveridadNotificacion;
import com.restoconnect.api.shared.notification.TipoNotificacion;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistrarPagoEfectivoUseCase {

    private final PedidoRepository pedidoRepository;
    private final PagoRepository pagoRepository;
    private final GenerarFacturaUseCase generarFacturaUseCase;
    private final NotificationService notificationService;

    @Transactional
    public RegistrarPagoEfectivoResponse ejecutar(RegistrarPagoEfectivoRequest request) {
        Pedido pedido = pedidoRepository.findById(request.pedidoId())
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado."));
        validarPedidoParaCobro(pedido, request.monto());

        Pago pago = pagoRepository.findTopByPedidoIdOrderByFechaCreacionDesc(pedido.getId()).orElseGet(Pago::new);
        pago.setPedido(pedido);
        pago.setMetodo(MetodoPago.EFECTIVO);
        pago.setMonto(request.monto());
        pago.setReferenciaTransaccion("EF-" + pedido.getId().toString().substring(0, 8).toUpperCase());

        FacturaResponse factura = null;
        if (request.confirmadoPorMesero()) {
            pago.setEstado(EstadoPago.PAGADO);
            pago.setFechaPago(OffsetDateTime.now(ZoneOffset.UTC));
            pedido.setEstado(EstadoPedido.PAGADO);
            pedido.getMesa().setEstado(EstadoMesa.LIBRE);
            factura = FacturaResponse.from(generarFacturaUseCase.generarInterna(
                    pedido,
                    request.datosFacturacion() != null
                            ? request.datosFacturacion()
                            : new DatosFacturacionRequest("Consumidor Final", "S/N", "facturacion@restoconnect.local")
            ));
        } else {
            pago.setEstado(EstadoPago.PENDIENTE_CONFIRMACION);
            notificationService.emitir(
                    TipoNotificacion.PAGO_EFECTIVO_PENDIENTE,
                    "Pago en efectivo pendiente",
                    "El pedido " + pedido.getId() + " espera confirmacion de pago en efectivo.",
                    SeveridadNotificacion.MEDIA,
                    RolUsuario.MESERO,
                    "Pedido",
                    pedido.getId()
            );
        }

        Pago persisted = pagoRepository.save(pago);
        pedidoRepository.save(pedido);
        return new RegistrarPagoEfectivoResponse(PagoResponse.from(persisted), factura);
    }

    private void validarPedidoParaCobro(Pedido pedido, BigDecimal monto) {
        if (pedido.getEstado() == EstadoPedido.CANCELADO || pedido.getEstado() == EstadoPedido.PENDIENTE_VALIDACION) {
            throw new BusinessException("El pedido aun no puede cobrarse.");
        }
        if (pedido.getEstado() == EstadoPedido.PAGADO) {
            throw new BusinessException("El pedido ya fue pagado.");
        }
        if (monto.compareTo(pedido.getTotal()) < 0) {
            throw new BusinessException("El monto en efectivo no cubre el total del pedido.");
        }
    }

    public record RegistrarPagoEfectivoRequest(
            @NotNull UUID pedidoId,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal monto,
            boolean confirmadoPorMesero,
            @Valid DatosFacturacionRequest datosFacturacion
    ) {
    }

    public record RegistrarPagoEfectivoResponse(
            PagoResponse pago,
            FacturaResponse factura
    ) {
    }
}
