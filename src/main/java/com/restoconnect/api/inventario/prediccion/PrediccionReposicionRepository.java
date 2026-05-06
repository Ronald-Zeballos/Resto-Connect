package com.restoconnect.api.inventario.prediccion;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrediccionReposicionRepository extends JpaRepository<PrediccionReposicion, UUID> {

    List<PrediccionReposicion> findAllByOrderByFechaGeneracionDesc();

    List<PrediccionReposicion> findByItemInventarioIdOrderByFechaGeneracionDesc(UUID itemInventarioId);

    Optional<PrediccionReposicion> findTopByItemInventarioIdOrderByFechaGeneracionDesc(UUID itemInventarioId);
}

