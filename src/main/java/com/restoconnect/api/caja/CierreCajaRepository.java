package com.restoconnect.api.caja;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CierreCajaRepository extends JpaRepository<CierreCaja, UUID> {
    Optional<CierreCaja> findTopByEstadoOrderByFechaAperturaDesc(EstadoCierreCaja estado);
    List<CierreCaja> findAllByOrderByFechaAperturaDesc();
}
