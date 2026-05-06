package com.restoconnect.api.menu.producto;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecetaProductoRepository extends JpaRepository<RecetaProducto, UUID> {

    List<RecetaProducto> findByProductoId(UUID productoId);

    List<RecetaProducto> findByItemInventarioId(UUID itemInventarioId);

    void deleteByProductoId(UUID productoId);
}

