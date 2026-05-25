package com.restoconnect.api.contabilidad;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContabilidadIngresoRepository extends JpaRepository<ContabilidadIngreso, UUID> {

    List<ContabilidadIngreso> findByFechaIngresoBetweenOrderByFechaIngresoDesc(LocalDate desde, LocalDate hasta);

    List<ContabilidadIngreso> findAllByOrderByFechaIngresoDesc();
}
