package com.restoconnect.api.contabilidad;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuentaCobrarCobroRepository extends JpaRepository<CuentaCobrarCobro, UUID> {

    List<CuentaCobrarCobro> findByCuentaCobrarIdOrderByFechaCobroAsc(UUID cuentaCobrarId);
}
