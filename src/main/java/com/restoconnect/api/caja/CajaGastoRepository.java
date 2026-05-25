package com.restoconnect.api.caja;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CajaGastoRepository extends JpaRepository<CajaGasto, UUID> {
    List<CajaGasto> findByCierreCajaIdOrderByFechaCreacionAsc(UUID cierreCajaId);
}
