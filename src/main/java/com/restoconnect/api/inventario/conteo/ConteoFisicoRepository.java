package com.restoconnect.api.inventario.conteo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConteoFisicoRepository extends JpaRepository<ConteoFisicoInventario, UUID> {
    Optional<ConteoFisicoInventario> findTopByEstadoOrderByFechaCreacionDesc(EstadoConteo estado);
    List<ConteoFisicoInventario> findAllByOrderByFechaCreacionDesc();
    Integer countByEstado(EstadoConteo estado);
}
