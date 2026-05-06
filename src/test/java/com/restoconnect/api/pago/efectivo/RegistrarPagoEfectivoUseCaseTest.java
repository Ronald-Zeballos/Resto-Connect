package com.restoconnect.api.pago.efectivo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.restoconnect.api.facturacion.DatosFacturacionRequest;
import com.restoconnect.api.facturacion.Factura;
import com.restoconnect.api.facturacion.GenerarFacturaUseCase;
import com.restoconnect.api.mesa.EstadoMesa;
import com.restoconnect.api.mesa.Mesa;
import com.restoconnect.api.pago.Pago;
import com.restoconnect.api.pago.PagoRepository;
import com.restoconnect.api.pedido.EstadoPedido;
import com.restoconnect.api.pedido.Pedido;
import com.restoconnect.api.pedido.PedidoRepository;
import com.restoconnect.api.shared.notification.NotificationService;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RegistrarPagoEfectivoUseCaseTest {

    @Mock
    private PedidoRepository pedidoRepository;
    @Mock
    private PagoRepository pagoRepository;
    @Mock
    private GenerarFacturaUseCase generarFacturaUseCase;
    @Mock
    private NotificationService notificationService;

    @Test
    void registrarPagoEfectivoMarcaPedidoComoPagadoYGeneraFactura() {
        Mesa mesa = new Mesa();
        mesa.setEstado(EstadoMesa.OCUPADA);

        Pedido pedido = new Pedido();
        pedido.setId(UUID.randomUUID());
        pedido.setMesa(mesa);
        pedido.setEstado(EstadoPedido.CONFIRMADO);
        pedido.setTotal(new BigDecimal("30.00"));

        Factura factura = new Factura();
        factura.setId(UUID.randomUUID());
        factura.setPedido(pedido);
        factura.setNumeroFactura("FAC-001");
        factura.setRazonSocial("Cliente");
        factura.setNitCi("123");
        factura.setEmail("cliente@test.com");
        factura.setTotal(new BigDecimal("30.00"));
        factura.setFechaEmision(java.time.LocalDate.now());

        when(pedidoRepository.findById(pedido.getId())).thenReturn(Optional.of(pedido));
        when(pagoRepository.findTopByPedidoIdOrderByFechaCreacionDesc(pedido.getId())).thenReturn(Optional.empty());
        when(pagoRepository.save(any(Pago.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(generarFacturaUseCase.generarInterna(any(Pedido.class), any(DatosFacturacionRequest.class))).thenReturn(factura);

        RegistrarPagoEfectivoUseCase useCase = new RegistrarPagoEfectivoUseCase(
                pedidoRepository,
                pagoRepository,
                generarFacturaUseCase,
                notificationService
        );

        RegistrarPagoEfectivoUseCase.RegistrarPagoEfectivoResponse response = useCase.ejecutar(
                new RegistrarPagoEfectivoUseCase.RegistrarPagoEfectivoRequest(
                        pedido.getId(),
                        new BigDecimal("30.00"),
                        true,
                        new DatosFacturacionRequest("Cliente", "123", "cliente@test.com")
                )
        );

        assertEquals(EstadoPedido.PAGADO, pedido.getEstado());
        assertEquals(EstadoMesa.LIBRE, pedido.getMesa().getEstado());
        assertNotNull(response.factura());
        assertEquals("FAC-001", response.factura().numeroFactura());
    }
}
