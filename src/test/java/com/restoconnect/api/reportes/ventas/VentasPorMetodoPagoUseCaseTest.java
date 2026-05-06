package com.restoconnect.api.reportes.ventas;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.restoconnect.api.mesa.Mesa;
import com.restoconnect.api.pago.EstadoPago;
import com.restoconnect.api.pago.MetodoPago;
import com.restoconnect.api.pago.Pago;
import com.restoconnect.api.pago.PagoRepository;
import com.restoconnect.api.pedido.EstadoPedido;
import com.restoconnect.api.pedido.Pedido;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VentasPorMetodoPagoUseCaseTest {

    @Mock
    private PagoRepository pagoRepository;

    @Test
    void agrupaVentasPorMetodoDePago() {
        when(pagoRepository.findByEstadoAndFechaPagoBetweenOrderByFechaPagoAsc(
                org.mockito.ArgumentMatchers.eq(EstadoPago.PAGADO),
                org.mockito.ArgumentMatchers.any(OffsetDateTime.class),
                org.mockito.ArgumentMatchers.any(OffsetDateTime.class)
        )).thenReturn(List.of(
                pago(MetodoPago.EFECTIVO, "10"),
                pago(MetodoPago.EFECTIVO, "15"),
                pago(MetodoPago.PASARELA, "20")
        ));

        List<VentasPorMetodoPagoUseCase.VentaMetodoPagoResponse> response = new VentasPorMetodoPagoUseCase(pagoRepository)
                .ejecutar(null, null);

        assertEquals(2, response.size());
        assertEquals(MetodoPago.EFECTIVO, response.get(0).metodoPago());
        assertEquals("25.00", response.get(0).montoTotal().toPlainString());
    }

    private Pago pago(MetodoPago metodoPago, String monto) {
        Pedido pedido = new Pedido();
        pedido.setId(UUID.randomUUID());
        pedido.setMesa(new Mesa());
        pedido.setEstado(EstadoPedido.PAGADO);

        Pago pago = new Pago();
        pago.setPedido(pedido);
        pago.setMetodo(metodoPago);
        pago.setEstado(EstadoPago.PAGADO);
        pago.setMonto(new BigDecimal(monto));
        pago.setFechaPago(OffsetDateTime.now(ZoneOffset.UTC));
        return pago;
    }
}
