package com.restoconnect.api.pago.pasarela;

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
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class ProcesarPagoPasarelaUseCase {

    private final PedidoRepository pedidoRepository;
    private final PagoRepository pagoRepository;
    private final GenerarFacturaUseCase generarFacturaUseCase;

    @Transactional
    public ProcesarPagoPasarelaResponse ejecutar(ProcesarPagoPasarelaRequest request) {
        Pedido pedido = pedidoRepository.findById(request.pedidoId())
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado."));
        if (pedido.getEstado() == EstadoPedido.CANCELADO || pedido.getEstado() == EstadoPedido.PENDIENTE_VALIDACION) {
            throw new BusinessException("El pedido aun no puede pagarse.");
        }
        if (pedido.getEstado() == EstadoPedido.PAGADO) {
            throw new BusinessException("El pedido ya fue pagado.");
        }
        if (request.monto().compareTo(pedido.getTotal()) < 0) {
            throw new BusinessException("El monto no cubre el total del pedido.");
        }

        Pago pago = new Pago();
        pago.setPedido(pedido);
        pago.setMetodo(MetodoPago.PASARELA);
        pago.setEstado(EstadoPago.PAGADO);
        pago.setMonto(request.monto());
        pago.setFechaPago(OffsetDateTime.now(ZoneOffset.UTC));
        pago.setReferenciaTransaccion("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        Pago persisted = pagoRepository.save(pago);

        pedido.setEstado(EstadoPedido.PAGADO);
        pedido.getMesa().setEstado(EstadoMesa.LIBRE);
        pedidoRepository.save(pedido);

        FacturaResponse factura = FacturaResponse.from(generarFacturaUseCase.generarInterna(
                pedido,
                request.datosFacturacion() != null
                        ? request.datosFacturacion()
                        : new DatosFacturacionRequest("Consumidor Final", "S/N", "facturacion@restoconnect.local")
        ));

        return new ProcesarPagoPasarelaResponse(PagoResponse.from(persisted), factura);
    }

    public record ProcesarPagoPasarelaRequest(
            @NotNull UUID pedidoId,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal monto,
            @NotBlank String tokenSimulado,
            @Valid DatosFacturacionRequest datosFacturacion
    ) {
    }

    public record ProcesarPagoPasarelaResponse(
            PagoResponse pago,
            FacturaResponse factura
    ) {
    }
}
