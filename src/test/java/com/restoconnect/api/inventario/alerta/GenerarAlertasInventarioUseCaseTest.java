package com.restoconnect.api.inventario.alerta;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.restoconnect.api.inventario.item.ClasificacionAbc;
import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.inventario.item.UnidadMedida;
import com.restoconnect.api.shared.notification.NotificationService;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GenerarAlertasInventarioUseCaseTest {

    @Mock
    private AlertaInventarioRepository alertaInventarioRepository;
    @Mock
    private NotificationService notificationService;

    @Test
    void generaAlertaCuandoStockBajaDelMinimo() {
        ItemInventario item = new ItemInventario();
        item.setId(UUID.randomUUID());
        item.setNombre("Lechuga");
        item.setUnidadMedida(UnidadMedida.GRAMO);
        item.setClasificacionAbc(ClasificacionAbc.MEDIA);
        item.setStockActual(new BigDecimal("4"));
        item.setStockMinimo(new BigDecimal("5"));
        item.setStockMaximo(new BigDecimal("20"));
        item.setPuntoReorden(new BigDecimal("7"));
        item.setActivo(true);

        when(alertaInventarioRepository.existsByItemInventarioIdAndTipoAndAtendidaFalse(item.getId(), TipoAlertaInventario.STOCK_BAJO))
                .thenReturn(false);
        when(alertaInventarioRepository.existsByItemInventarioIdAndTipoAndAtendidaFalse(item.getId(), TipoAlertaInventario.REPOSICION_SUGERIDA))
                .thenReturn(false);
        when(alertaInventarioRepository.save(any(AlertaInventario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GenerarAlertasInventarioUseCase useCase = new GenerarAlertasInventarioUseCase(alertaInventarioRepository, notificationService);
        useCase.evaluar(item);

        ArgumentCaptor<AlertaInventario> captor = ArgumentCaptor.forClass(AlertaInventario.class);
        verify(alertaInventarioRepository, org.mockito.Mockito.atLeastOnce()).save(captor.capture());
        assertEquals("Lechuga", captor.getValue().getItemInventario().getNombre());
        verify(notificationService, org.mockito.Mockito.atLeastOnce()).emitir(any(), any(), any(), any(), any(), any(), any());
    }
}

