package com.restoconnect.api.inventario.item;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ItemInventarioRepository extends JpaRepository<ItemInventario, UUID> {

    List<ItemInventario> findByActivoTrueOrderByNombreAsc();

    @Query("select i from ItemInventario i where i.activo = true and i.stockActual <= i.stockMinimo order by i.nombre asc")
    List<ItemInventario> findStockBajo();

    @Query("select i from ItemInventario i where i.activo = true and i.stockActual <= 0 order by i.nombre asc")
    List<ItemInventario> findAgotados();

    @Query("select i from ItemInventario i where i.activo = true and i.stockActual <= i.puntoReorden order by i.nombre asc")
    List<ItemInventario> findCriticos();

    @Query("select i from ItemInventario i where i.activo = true and i.stockActual > i.stockMaximo order by i.nombre asc")
    List<ItemInventario> findSobreStock();
}

