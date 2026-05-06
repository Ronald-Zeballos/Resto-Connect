package com.restoconnect.api.inventario.prediccion;

import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.inventario.movimiento.MovimientoInventario;
import com.restoconnect.api.inventario.parametros.ParametroInventario;
import java.util.List;

public interface MotorPrediccionInventario {

    PrediccionCalculada calcular(ItemInventario item, List<MovimientoInventario> salidasHistoricas, ParametroInventario parametros);

    record PrediccionCalculada(
            java.math.BigDecimal consumoPromedioDiario,
            java.math.BigDecimal diasHastaAgotamiento,
            java.time.LocalDate fechaEstimadaAgotamiento,
            java.math.BigDecimal cantidadSugeridaCompra,
            NivelRiesgoPrediccion nivelRiesgo,
            java.math.BigDecimal confianza,
            String motivo
    ) {
    }
}

