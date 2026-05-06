package com.restoconnect.api.incidencia;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidenciaRepository extends JpaRepository<Incidencia, UUID> {

    @EntityGraph(attributePaths = {"mesa", "pedido", "reportadoPor"})
    List<Incidencia> findAllByOrderByFechaCreacionDesc();

    @EntityGraph(attributePaths = {"mesa", "pedido", "reportadoPor"})
    List<Incidencia> findByEstadoOrderByFechaCreacionDesc(EstadoIncidencia estado);
}

