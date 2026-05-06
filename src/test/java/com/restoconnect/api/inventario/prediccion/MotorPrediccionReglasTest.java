package com.restoconnect.api.inventario.prediccion;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.restoconnect.api.inventario.item.ClasificacionAbc;
import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.inventario.item.UnidadMedida;
import com.restoconnect.api.inventario.movimiento.MovimientoInventario;
import com.restoconnect.api.inventario.parametros.ParametroInventario;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class MotorPrediccionReglasTest {

    @Test
    void calculaPrediccionConPromedioMovil() {
        ItemInventario item = new ItemInventario();
        item.setNombre("Papas");
        item.setUnidadMedida(UnidadMedida.KG);
        item.setClasificacionAbc(ClasificacionAbc.ALTA);
        item.setStockActual(new BigDecimal("20"));
        item.setStockMinimo(new BigDecimal("5"));
        item.setStockMaximo(new BigDecimal("50"));
        item.setPuntoReorden(new BigDecimal("12"));
        item.setTiempoEntregaProveedorDias(2);

        ParametroInventario parametros = new ParametroInventario();
        parametros.setDiasAnalisisConsumo(30);
        parametros.setDiasCoberturaDeseada(7);
        parametros.setPorcentajeMargenSeguridad(new BigDecimal("15"));

        List<MovimientoInventario> movimientos = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            MovimientoInventario movimiento = new MovimientoInventario();
            movimiento.setCantidad(new BigDecimal("6"));
            movimiento.setFechaMovimiento(OffsetDateTime.now(ZoneOffset.UTC).minusDays(i));
            movimientos.add(movimiento);
        }

        MotorPrediccionInventario.PrediccionCalculada calculada = new MotorPrediccionReglas()
                .calcular(item, movimientos, parametros);

        assertEquals("2.0000", calculada.consumoPromedioDiario().toPlainString());
        assertEquals("10.00", calculada.diasHastaAgotamiento().toPlainString());
        assertEquals("0.70", calculada.cantidadSugeridaCompra().toPlainString());
    }
}

