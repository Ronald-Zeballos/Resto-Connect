package com.restoconnect.api.pago.qr;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagoQrRepository extends JpaRepository<PagoQr, UUID> {

    @EntityGraph(attributePaths = {"pedido", "pedido.mesa", "pago"})
    Optional<PagoQr> findByQrExternoId(String qrExternoId);

    @EntityGraph(attributePaths = {"pedido", "pedido.mesa", "pago"})
    Optional<PagoQr> findTopByPedidoIdOrderByFechaCreacionDesc(UUID pedidoId);
}
