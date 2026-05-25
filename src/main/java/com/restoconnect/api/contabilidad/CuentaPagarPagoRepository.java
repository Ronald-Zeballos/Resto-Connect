package com.restoconnect.api.contabilidad;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuentaPagarPagoRepository extends JpaRepository<CuentaPagarPago, UUID> {

    List<CuentaPagarPago> findByCuentaPagarIdOrderByFechaPagoAsc(UUID cuentaPagarId);
}
