package com.restoconnect.api.facturacion;

import com.restoconnect.api.auth.RolUsuario;
import com.restoconnect.api.pedido.EstadoPedido;
import com.restoconnect.api.pedido.Pedido;
import com.restoconnect.api.pedido.PedidoRepository;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import com.restoconnect.api.shared.notification.NotificationService;
import com.restoconnect.api.shared.notification.SeveridadNotificacion;
import com.restoconnect.api.shared.notification.TipoNotificacion;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GenerarFacturaUseCase {

    private final PedidoRepository pedidoRepository;
    private final FacturaRepository facturaRepository;
    private final NotificationService notificationService;

    @Transactional
    public FacturaResponse generar(UUID pedidoId, DatosFacturacionRequest request) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado."));
        return FacturaResponse.from(generarInterna(pedido, request));
    }

    @Transactional
    public Factura generarInterna(Pedido pedido, DatosFacturacionRequest request) {
        if (pedido.getEstado() != EstadoPedido.PAGADO) {
            throw new BusinessException("La factura solo puede generarse para pedidos pagados.");
        }
        return facturaRepository.findByPedidoId(pedido.getId())
                .orElseGet(() -> {
                    Factura factura = new Factura();
                    factura.setPedido(pedido);
                    factura.setNumeroFactura("FAC-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + pedido.getId().toString().substring(0, 6).toUpperCase());
                    factura.setRazonSocial(request.razonSocial());
                    factura.setNitCi(request.nitCi());
                    factura.setEmail(request.email());
                    factura.setTotal(pedido.getTotal());
                    factura.setFechaEmision(LocalDate.now());
                    Factura persisted = facturaRepository.save(factura);
                    notificationService.emitir(
                            TipoNotificacion.FACTURA_GENERADA,
                            "Factura generada",
                            "La factura " + persisted.getNumeroFactura() + " fue generada para el pedido " + pedido.getId(),
                            SeveridadNotificacion.INFO,
                            RolUsuario.ADMIN,
                            "Factura",
                            persisted.getId()
                    );
                    return persisted;
                });
    }
}
