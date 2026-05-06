package com.restoconnect.api.facturacion;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacturaRepository extends JpaRepository<Factura, UUID> {

    Optional<Factura> findByPedidoId(UUID pedidoId);
}

