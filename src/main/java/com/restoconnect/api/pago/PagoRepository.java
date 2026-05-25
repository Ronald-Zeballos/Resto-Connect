package com.restoconnect.api.pago;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagoRepository extends JpaRepository<Pago, UUID> {

    @EntityGraph(attributePaths = {"pedido", "pedido.mesa"})
    List<Pago> findByEstadoOrderByFechaCreacionDesc(EstadoPago estado);

    @EntityGraph(attributePaths = {"pedido", "pedido.mesa", "pedido.detalles", "pedido.detalles.producto", "pedido.meseroValidador"})
    List<Pago> findByEstadoAndFechaPagoBetweenOrderByFechaPagoAsc(
            EstadoPago estado,
            OffsetDateTime desde,
            OffsetDateTime hasta
    );

    Optional<Pago> findTopByPedidoIdOrderByFechaCreacionDesc(UUID pedidoId);

    @EntityGraph(attributePaths = {"pedido", "pedido.mesa"})
    List<Pago> findByFechaPagoBetween(OffsetDateTime desde, OffsetDateTime hasta);
}
