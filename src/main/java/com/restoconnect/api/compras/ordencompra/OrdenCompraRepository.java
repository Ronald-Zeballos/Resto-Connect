package com.restoconnect.api.compras.ordencompra;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, UUID> {

    @EntityGraph(attributePaths = {"proveedor", "detalles", "detalles.itemInventario"})
    List<OrdenCompra> findAllByOrderByFechaCreacionDesc();

    @EntityGraph(attributePaths = {"proveedor", "detalles", "detalles.itemInventario"})
    Optional<OrdenCompra> findById(UUID id);
}
