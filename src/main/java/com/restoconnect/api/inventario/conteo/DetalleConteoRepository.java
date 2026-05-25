package com.restoconnect.api.inventario.conteo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetalleConteoRepository extends JpaRepository<DetalleConteoFisico, UUID> {
    List<DetalleConteoFisico> findByConteoId(UUID conteoId);
    Optional<DetalleConteoFisico> findByConteoIdAndItemInventarioId(UUID conteoId, UUID itemId);
}
