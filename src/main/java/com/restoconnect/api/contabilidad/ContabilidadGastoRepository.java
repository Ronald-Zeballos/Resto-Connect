package com.restoconnect.api.contabilidad;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContabilidadGastoRepository extends JpaRepository<ContabilidadGasto, UUID> {

    List<ContabilidadGasto> findByFechaGastoBetweenOrderByFechaGastoDesc(LocalDate desde, LocalDate hasta);

    List<ContabilidadGasto> findAllByOrderByFechaGastoDesc();
}
