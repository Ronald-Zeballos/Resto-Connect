package com.restoconnect.api.pago.qr;

import com.restoconnect.api.facturacion.DatosFacturacionRequest;
import com.restoconnect.api.facturacion.FacturaResponse;
import com.restoconnect.api.facturacion.GenerarFacturaUseCase;
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
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PagoQrService {

    private static final List<EstadoPedido> ESTADOS_COBRABLES = List.of(
            EstadoPedido.CONFIRMADO,
            EstadoPedido.EN_PREPARACION,
            EstadoPedido.LISTO,
            EstadoPedido.ENTREGADO
    );

    private final PedidoRepository pedidoRepository;
    private final PagoRepository pagoRepository;
    private final PagoQrRepository pagoQrRepository;
    private final GenerarFacturaUseCase generarFacturaUseCase;

    public List<CobroPendienteResponse> listarCobrosPendientes() {
        return pedidoRepository.findByEstadoInOrderByFechaCreacionDesc(ESTADOS_COBRABLES)
                .stream()
                .map(this::toCobroPendiente)
                .toList();
    }

    @Transactional
    public PagoQrResponse generar(GenerarPagoQrRequest request) {
        Pedido pedido = obtenerPedidoCobrable(request.pedidoId());
        Optional<PagoQr> existente = pagoQrRepository.findTopByPedidoIdOrderByFechaCreacionDesc(pedido.getId());
        if (existente.isPresent() && esQrActivo(existente.get())) {
            return toResponse(existente.get());
        }

        String qrId = "QR-" + pedido.getId().toString().substring(0, 8).toUpperCase() + "-" + System.currentTimeMillis();

        PagoQr pagoQr = new PagoQr();
        pagoQr.setPedido(pedido);
        pagoQr.setProveedor("LOCAL");
        pagoQr.setQrExternoId(qrId);
        pagoQr.setTransaccionExterna("TXN-" + qrId);
        pagoQr.setEstado("PENDIENTE");
        pagoQr.setMonto(pedido.getTotal());
        pagoQr.setMoneda("BOB");
        pagoQr.setDescripcion(request.descripcion() != null ? request.descripcion() : "Pago mesa " + pedido.getMesa().getNumero());
        pagoQr.setExpiracion(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(30));
        pagoQr.setFechaUltimaSincronizacion(OffsetDateTime.now(ZoneOffset.UTC));

        return toResponse(pagoQrRepository.save(pagoQr));
    }

    public PagoQrResponse consultar(String qrId) {
        PagoQr pagoQr = pagoQrRepository.findByQrExternoId(qrId)
                .orElseThrow(() -> new NotFoundException("No se encontro el QR solicitado."));
        return toResponse(pagoQr);
    }

    @Transactional
    public PagoQrResponse cancelar(String qrId) {
        PagoQr pagoQr = pagoQrRepository.findByQrExternoId(qrId)
                .orElseThrow(() -> new NotFoundException("No se encontro el QR solicitado."));
        if ("APLICADO".equals(pagoQr.getEstado())) {
            throw new BusinessException("El QR ya fue aplicado y no puede cancelarse.");
        }
        pagoQr.setEstado("CANCELADO");
        pagoQr.setFechaUltimaSincronizacion(OffsetDateTime.now(ZoneOffset.UTC));
        return toResponse(pagoQrRepository.save(pagoQr));
    }

    @Transactional
    public ConfirmacionPagoQrResponse confirmar(String qrId, ConfirmarPagoQrRequest request) {
        PagoQr pagoQr = pagoQrRepository.findByQrExternoId(qrId)
                .orElseThrow(() -> new NotFoundException("No se encontro el QR solicitado."));

        if (pagoQr.getPago() != null) {
            return new ConfirmacionPagoQrResponse(
                    toResponse(pagoQrRepository.save(pagoQr)),
                    PagoResponse.from(pagoQr.getPago()),
                    null
            );
        }

        Pedido pedido = pagoQr.getPedido();

        Pago pago = new Pago();
        pago.setPedido(pedido);
        pago.setMetodo(MetodoPago.QR);
        pago.setEstado(EstadoPago.PAGADO);
        pago.setMonto(pagoQr.getMonto());
        pago.setFechaPago(OffsetDateTime.now(ZoneOffset.UTC));
        pago.setReferenciaTransaccion(pagoQr.getTransaccionExterna());
        Pago persisted = pagoRepository.save(pago);

        pedido.setEstado(EstadoPedido.PAGADO);
        pedido.getMesa().setEstado(com.restoconnect.api.mesa.EstadoMesa.LIBRE);
        pedidoRepository.save(pedido);

        pagoQr.setPago(persisted);
        pagoQr.setEstado("APLICADO");
        pagoQr.setReferenciaPagoExterna(pagoQr.getTransaccionExterna());
        pagoQr.setPagadoEn(OffsetDateTime.now(ZoneOffset.UTC));
        pagoQr.setFechaUltimaSincronizacion(OffsetDateTime.now(ZoneOffset.UTC));
        pagoQrRepository.save(pagoQr);

        FacturaResponse factura = FacturaResponse.from(generarFacturaUseCase.generarInterna(
                pedido,
                request != null && request.datosFacturacion() != null
                        ? request.datosFacturacion()
                        : new DatosFacturacionRequest("Consumidor Final", "S/N", "facturacion@restoconnect.local")
        ));

        return new ConfirmacionPagoQrResponse(
                toResponse(pagoQr),
                PagoResponse.from(persisted),
                factura
        );
    }

    private CobroPendienteResponse toCobroPendiente(Pedido pedido) {
        PagoQrResponse qr = pagoQrRepository.findTopByPedidoIdOrderByFechaCreacionDesc(pedido.getId())
                .map(this::toResponse)
                .orElse(null);

        return new CobroPendienteResponse(
                pedido.getId(),
                "Mesa " + pedido.getMesa().getNumero() + " - pedido " + pedido.getId().toString().substring(0, 8).toUpperCase(),
                pedido.getMesa().getNumero(),
                pedido.getEstado().name(),
                pedido.getTotal(),
                qr
        );
    }

    private Pedido obtenerPedidoCobrable(UUID pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado."));
        if (pedido.getEstado() == EstadoPedido.PAGADO) {
            throw new BusinessException("El pedido ya se encuentra pagado.");
        }
        if (pedido.getEstado() == EstadoPedido.CANCELADO || pedido.getEstado() == EstadoPedido.PENDIENTE_VALIDACION) {
            throw new BusinessException("El pedido aun no esta listo para cobro QR.");
        }
        return pedido;
    }

    private boolean esQrActivo(PagoQr pagoQr) {
        return "PENDIENTE".equals(pagoQr.getEstado()) || "PAGADO_CONFIRMADO".equals(pagoQr.getEstado());
    }

    private PagoQrResponse toResponse(PagoQr pagoQr) {
        return new PagoQrResponse(
                pagoQr.getId(),
                pagoQr.getPedido().getId(),
                pagoQr.getQrExternoId(),
                pagoQr.getEstado(),
                pagoQr.getMonto(),
                pagoQr.getMoneda(),
                pagoQr.getDescripcion(),
                pagoQr.getExpiracion(),
                pagoQr.getImagenQr(),
                pagoQr.getReferenciaPagoExterna(),
                pagoQr.getPagadoEn(),
                pagoQr.getFechaUltimaSincronizacion(),
                pagoQr.getPago() != null ? 1 : 0,
                pagoQr.getPago() != null
        );
    }

    public record CobroPendienteResponse(
            UUID pedidoId,
            String pedido,
            Integer mesaNumero,
            String estado,
            BigDecimal total,
            PagoQrResponse qr
    ) {}

    public record GenerarPagoQrRequest(
            UUID pedidoId,
            String descripcion,
            String fechaExpiracion,
            boolean usoUnico,
            boolean montoEditable
    ) {}

    public record ConfirmarPagoQrRequest(
            DatosFacturacionRequest datosFacturacion
    ) {}

    public record PagoQrResponse(
            UUID id,
            UUID pedidoId,
            String qrId,
            String estado,
            BigDecimal monto,
            String moneda,
            String descripcion,
            OffsetDateTime expiracion,
            String imagenQr,
            String referenciaPago,
            OffsetDateTime pagadoEn,
            OffsetDateTime fechaUltimaSincronizacion,
            int pagosDetectados,
            boolean aplicado
    ) {}

    public record ConfirmacionPagoQrResponse(
            PagoQrResponse qr,
            PagoResponse pago,
            FacturaResponse factura
    ) {}
}
