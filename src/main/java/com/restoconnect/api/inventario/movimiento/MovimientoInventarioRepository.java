package com.restoconnect.api.inventario.movimiento;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, UUID> {

    List<MovimientoInventario> findByItemInventarioIdAndTipoMovimientoAndFechaMovimientoBetweenOrderByFechaMovimientoAsc(
            UUID itemInventarioId,
            TipoMovimientoInventario tipoMovimiento,
            OffsetDateTime desde,
            OffsetDateTime hasta
    );

    @EntityGraph(attributePaths = {"itemInventario"})
    List<MovimientoInventario> findByTipoMovimientoAndFechaMovimientoBetweenOrderByFechaMovimientoAsc(
            TipoMovimientoInventario tipoMovimiento,
            OffsetDateTime desde,
            OffsetDateTime hasta
    );
}
