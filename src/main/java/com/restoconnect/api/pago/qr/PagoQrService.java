package com.restoconnect.api.pago.qr;

import com.restoconnect.api.facturacion.DatosFacturacionRequest;
import com.restoconnect.api.facturacion.FacturaResponse;
import com.restoconnect.api.pago.Pago;
import com.restoconnect.api.pago.PagoRepository;
import com.restoconnect.api.pago.PagoResponse;
import com.restoconnect.api.pago.pasarela.ProcesarPagoPasarelaUseCase;
import com.restoconnect.api.pedido.EstadoPedido;
import com.restoconnect.api.pedido.Pedido;
import com.restoconnect.api.pedido.PedidoRepository;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

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
    private final ProcesarPagoPasarelaUseCase procesarPagoPasarelaUseCase;
    private final PaguiClient paguiClient;
    private final PaguiRuntimeSettingsResolver settingsResolver;
    private final PaguiRedisCacheService cacheService;

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
            return toResponse(existente.get(), consultarPagosSeguros(existente.get().getQrExternoId()));
        }

        String dueDate = resolveDueDate(request.fechaExpiracion());
        PaguiClient.PaguiQrPayload remoto = paguiClient.generarQr(new PaguiClient.PaguiGenerateQrCommand(
                buildTransactionId(pedido.getId()),
                pedido.getTotal(),
                StringUtils.hasText(request.descripcion()) ? request.descripcion() : "Pago mesa " + pedido.getMesa().getNumero(),
                settingsResolver.resolve().bankId(),
                dueDate,
                request.usoUnico(),
                request.montoEditable()
        ));

        PagoQr pagoQr = new PagoQr();
        pagoQr.setPedido(pedido);
        pagoQr.setProveedor("PAGUI");
        pagoQr.setQrExternoId(remoto.qrId());
        pagoQr.setTransaccionExterna(remoto.transactionId());
        pagoQr.setEstado(normalizarEstado(remoto.status(), List.of()));
        pagoQr.setMonto(remoto.amount() != null ? remoto.amount() : pedido.getTotal());
        pagoQr.setMoneda(StringUtils.hasText(remoto.currency()) ? remoto.currency() : "BOB");
        pagoQr.setDescripcion(remoto.description());
        pagoQr.setExpiracion(paguiClient.parseDateTime(remoto.dueDate()));
        pagoQr.setImagenQr(normalizarImagen(remoto.qrImage()));
        pagoQr.setFechaUltimaSincronizacion(OffsetDateTime.now(ZoneOffset.UTC));
        cacheService.storeQrSnapshot(remoto.qrId(), remoto, List.of());

        return toResponse(pagoQrRepository.save(pagoQr), List.of());
    }

    @Transactional
    public PagoQrResponse consultar(String qrId) {
        PagoQr pagoQr = pagoQrRepository.findByQrExternoId(qrId)
                .orElseThrow(() -> new NotFoundException("No se encontro el QR solicitado."));

        PaguiRedisCacheService.PaguiSnapshot snapshot = cargarSnapshot(qrId);
        PaguiClient.PaguiQrPayload remoto = snapshot.qr();
        List<PaguiClient.PaguiPaymentPayload> pagos = snapshot.payments();
        actualizarDesdeRemoto(pagoQr, remoto, pagos);
        return toResponse(pagoQrRepository.save(pagoQr), pagos);
    }

    @Transactional
    public PagoQrResponse cancelar(String qrId) {
        PagoQr pagoQr = pagoQrRepository.findByQrExternoId(qrId)
                .orElseThrow(() -> new NotFoundException("No se encontro el QR solicitado."));
        if ("APLICADO".equals(pagoQr.getEstado())) {
            throw new BusinessException("El QR ya fue aplicado al pedido y no puede cancelarse.");
        }
        paguiClient.cancelarQr(qrId);
        pagoQr.setEstado("CANCELADO");
        pagoQr.setFechaUltimaSincronizacion(OffsetDateTime.now(ZoneOffset.UTC));
        cacheService.evictQrSnapshot(qrId);
        return toResponse(pagoQrRepository.save(pagoQr), List.of());
    }

    @Transactional
    public ConfirmacionPagoQrResponse confirmar(String qrId, ConfirmarPagoQrRequest request) {
        PagoQr pagoQr = pagoQrRepository.findByQrExternoId(qrId)
                .orElseThrow(() -> new NotFoundException("No se encontro el QR solicitado."));

        PaguiRedisCacheService.PaguiSnapshot snapshot = cargarSnapshot(qrId);
        PaguiClient.PaguiQrPayload remoto = snapshot.qr();
        List<PaguiClient.PaguiPaymentPayload> pagos = snapshot.payments();
        actualizarDesdeRemoto(pagoQr, remoto, pagos);

        if (pagoQr.getPago() != null) {
            return new ConfirmacionPagoQrResponse(
                    toResponse(pagoQrRepository.save(pagoQr), pagos),
                    PagoResponse.from(pagoQr.getPago()),
                    null
            );
        }

        if (!esQrPagado(pagoQr)) {
            throw new BusinessException("El QR aun no registra un pago confirmado.");
        }

        ProcesarPagoPasarelaUseCase.ProcesarPagoPasarelaResponse procesado = procesarPagoPasarelaUseCase.ejecutar(
                new ProcesarPagoPasarelaUseCase.ProcesarPagoPasarelaRequest(
                        pagoQr.getPedido().getId(),
                        pagoQr.getMonto(),
                        StringUtils.hasText(pagoQr.getReferenciaPagoExterna()) ? pagoQr.getReferenciaPagoExterna() : pagoQr.getQrExternoId(),
                        request != null ? request.datosFacturacion() : null
                )
        );

        Pago pago = pagoRepository.findTopByPedidoIdOrderByFechaCreacionDesc(pagoQr.getPedido().getId())
                .orElseThrow(() -> new NotFoundException("No se encontro el pago generado para el pedido."));
        pagoQr.setPago(pago);
        pagoQr.setEstado("APLICADO");
        pagoQr.setFechaUltimaSincronizacion(OffsetDateTime.now(ZoneOffset.UTC));
        cacheService.evictQrSnapshot(qrId);

        return new ConfirmacionPagoQrResponse(
                toResponse(pagoQrRepository.save(pagoQr), pagos),
                procesado.pago(),
                procesado.factura()
        );
    }

    private CobroPendienteResponse toCobroPendiente(Pedido pedido) {
        PagoQrResponse qr = pagoQrRepository.findTopByPedidoIdOrderByFechaCreacionDesc(pedido.getId())
                .map(item -> toResponse(item, List.of()))
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

    private void actualizarDesdeRemoto(
            PagoQr pagoQr,
            PaguiClient.PaguiQrPayload remoto,
            List<PaguiClient.PaguiPaymentPayload> pagos
    ) {
        String estadoNormalizado = normalizarEstado(remoto.status(), pagos);
        if (pagoQr.getPedido().getEstado() == EstadoPedido.PAGADO
                || "APLICADO".equals(pagoQr.getEstado())
                || pagoQr.getPago() != null) {
            pagoQr.setEstado("APLICADO");
        } else {
            pagoQr.setEstado(estadoNormalizado);
        }
        pagoQr.setMonto(remoto.amount() != null ? remoto.amount() : pagoQr.getMonto());
        pagoQr.setMoneda(StringUtils.hasText(remoto.currency()) ? remoto.currency() : pagoQr.getMoneda());
        pagoQr.setDescripcion(remoto.description());
        pagoQr.setExpiracion(paguiClient.parseDateTime(remoto.dueDate()));
        pagoQr.setImagenQr(normalizarImagen(remoto.qrImage()));
        pagoQr.setFechaUltimaSincronizacion(OffsetDateTime.now(ZoneOffset.UTC));
        if (!pagos.isEmpty()) {
            PaguiClient.PaguiPaymentPayload pago = pagos.get(0);
            if (StringUtils.hasText(pago.transactionId())) {
                pagoQr.setReferenciaPagoExterna(pago.transactionId());
            }
            OffsetDateTime pagadoEn = paguiClient.parseDateTime(pago.paymentDate());
            if (pagadoEn != null) {
                pagoQr.setPagadoEn(pagadoEn);
            }
        } else if (esQrPagado(pagoQr)) {
            if (!StringUtils.hasText(pagoQr.getReferenciaPagoExterna())
                    && StringUtils.hasText(pagoQr.getTransaccionExterna())) {
                pagoQr.setReferenciaPagoExterna(pagoQr.getTransaccionExterna());
            }
            if (pagoQr.getPagadoEn() == null) {
                pagoQr.setPagadoEn(OffsetDateTime.now(ZoneOffset.UTC));
            }
        }
    }

    private String normalizarEstado(String estadoRemoto, List<PaguiClient.PaguiPaymentPayload> pagos) {
        if (!pagos.isEmpty()) {
            return "PAGADO_CONFIRMADO";
        }
        if (!StringUtils.hasText(estadoRemoto)) {
            return "PENDIENTE";
        }
        return switch (estadoRemoto.trim().toLowerCase()) {
            case "used", "paid", "completed" -> "PAGADO_CONFIRMADO";
            case "cancelled", "canceled", "expired" -> "CANCELADO";
            default -> "PENDIENTE";
        };
    }

    private boolean esQrActivo(PagoQr pagoQr) {
        return "PENDIENTE".equals(pagoQr.getEstado()) || "PAGADO_CONFIRMADO".equals(pagoQr.getEstado());
    }

    private boolean esQrPagado(PagoQr pagoQr) {
        return "PAGADO_CONFIRMADO".equals(pagoQr.getEstado())
                || "APLICADO".equals(pagoQr.getEstado())
                || StringUtils.hasText(pagoQr.getReferenciaPagoExterna());
    }

    private List<PaguiClient.PaguiPaymentPayload> consultarPagosSeguros(String qrId) {
        try {
            return paguiClient.consultarPagos(qrId);
        } catch (BusinessException ex) {
            return List.of();
        }
    }

    private PaguiRedisCacheService.PaguiSnapshot cargarSnapshot(String qrId) {
        try {
            PaguiClient.PaguiQrPayload remoto = paguiClient.consultarQr(qrId);
            List<PaguiClient.PaguiPaymentPayload> pagos = consultarPagosSeguros(qrId);
            cacheService.storeQrSnapshot(qrId, remoto, pagos);
            return new PaguiRedisCacheService.PaguiSnapshot(remoto, pagos);
        } catch (BusinessException ex) {
            return cacheService.getQrSnapshot(qrId)
                    .orElseThrow(() -> ex);
        }
    }

    private String normalizarImagen(String qrImage) {
        if (!StringUtils.hasText(qrImage)) {
            return null;
        }
        if (qrImage.startsWith("data:") || qrImage.startsWith("http://") || qrImage.startsWith("https://")) {
            return qrImage;
        }
        return "data:image/png;base64," + qrImage;
    }

    private String buildTransactionId(UUID pedidoId) {
        return "RC-" + pedidoId.toString().substring(0, 8).toUpperCase() + "-" + System.currentTimeMillis();
    }

    private String resolveDueDate(String requestedDate) {
        if (StringUtils.hasText(requestedDate)) {
            return requestedDate;
        }
        return OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(20).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    private PagoQrResponse toResponse(PagoQr pagoQr, List<PaguiClient.PaguiPaymentPayload> pagos) {
        int pagosDetectados = !pagos.isEmpty() ? pagos.size() : (esQrPagado(pagoQr) ? 1 : 0);
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
                pagosDetectados,
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
    ) {
    }

    public record GenerarPagoQrRequest(
            UUID pedidoId,
            String descripcion,
            String fechaExpiracion,
            boolean usoUnico,
            boolean montoEditable
    ) {
    }

    public record ConfirmarPagoQrRequest(
            DatosFacturacionRequest datosFacturacion
    ) {
    }

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
    ) {
    }

    public record ConfirmacionPagoQrResponse(
            PagoQrResponse qr,
            PagoResponse pago,
            FacturaResponse factura
    ) {
    }
}
