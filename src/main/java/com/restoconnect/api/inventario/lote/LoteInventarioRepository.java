package com.restoconnect.api.inventario.lote;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LoteInventarioRepository extends JpaRepository<LoteInventario, UUID> {

    List<LoteInventario> findByItemInventarioIdAndActivoTrueOrderByFechaVencimientoAsc(UUID itemId);

    @Query("select l from LoteInventario l where l.activo = true and l.fechaVencimiento between :desde and :hasta order by l.fechaVencimiento asc")
    List<LoteInventario> findProximosAVencer(LocalDate desde, LocalDate hasta);

    @Query("select l from LoteInventario l where l.activo = true and l.fechaVencimiento < :hoy order by l.fechaVencimiento asc")
    List<LoteInventario> findVencidos(LocalDate hoy);

    List<LoteInventario> findByItemInventarioIdAndActivoTrueAndCantidadRestanteGreaterThanOrderByFechaVencimientoAsc(
            UUID itemId, java.math.BigDecimal cantidadMinima);
}
