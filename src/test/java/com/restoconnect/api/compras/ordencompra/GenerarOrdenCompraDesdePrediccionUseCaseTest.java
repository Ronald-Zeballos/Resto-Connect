package com.restoconnect.api.compras.ordencompra;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.restoconnect.api.compras.proveedor.Proveedor;
import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.inventario.prediccion.NivelRiesgoPrediccion;
import com.restoconnect.api.inventario.prediccion.PrediccionReposicion;
import com.restoconnect.api.inventario.prediccion.PrediccionReposicionRepository;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GenerarOrdenCompraDesdePrediccionUseCaseTest {

    @Mock
    private PrediccionReposicionRepository prediccionReposicionRepository;
    @Mock
    private OrdenCompraRepository ordenCompraRepository;

    @Test
    void generaOrdenDeCompraSugeridaDesdePrediccion() {
        Proveedor proveedor = new Proveedor();
        proveedor.setId(UUID.randomUUID());
        proveedor.setNombre("Proveedor Uno");

        ItemInventario item = new ItemInventario();
        item.setId(UUID.randomUUID());
        item.setNombre("Queso");
        item.setCostoUnitario(new BigDecimal("2.50"));
        item.setProveedorPreferido(proveedor);

        PrediccionReposicion prediccion = new PrediccionReposicion();
        prediccion.setId(UUID.randomUUID());
        prediccion.setItemInventario(item);
        prediccion.setCantidadSugeridaCompra(new BigDecimal("10"));
        prediccion.setNivelRiesgo(NivelRiesgoPrediccion.ALTO);

        when(prediccionReposicionRepository.findById(prediccion.getId())).thenReturn(Optional.of(prediccion));
        when(ordenCompraRepository.save(org.mockito.ArgumentMatchers.any(OrdenCompra.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrdenCompraResponse response = new GenerarOrdenCompraDesdePrediccionUseCase(prediccionReposicionRepository, ordenCompraRepository)
                .ejecutar(prediccion.getId());

        assertEquals(EstadoOrdenCompra.SUGERIDA, response.estado());
        assertEquals("25.00", response.costoEstimado().toPlainString());
    }
}

