package com.restoconnect.api.pedido;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, UUID> {

    @EntityGraph(attributePaths = {"mesa", "detalles", "detalles.producto", "meseroValidador"})
    Optional<Pedido> findById(UUID id);

    @EntityGraph(attributePaths = {"mesa", "detalles", "detalles.producto", "meseroValidador"})
    Optional<Pedido> findFirstByMesaIdAndEstadoIn(UUID mesaId, Collection<EstadoPedido> estados);

    @EntityGraph(attributePaths = {"mesa", "detalles", "detalles.producto", "meseroValidador"})
    List<Pedido> findByEstadoOrderByFechaCreacionDesc(EstadoPedido estado);

    @EntityGraph(attributePaths = {"mesa", "detalles", "detalles.producto", "meseroValidador"})
    List<Pedido> findByEstadoInOrderByFechaCreacionDesc(Collection<EstadoPedido> estados);
}
