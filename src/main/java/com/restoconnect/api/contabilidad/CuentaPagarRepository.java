package com.restoconnect.api.contabilidad;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuentaPagarRepository extends JpaRepository<CuentaPagar, UUID> {

    List<CuentaPagar> findByEstadoOrderByFechaVencimientoAsc(String estado);

    List<CuentaPagar> findByProveedorIdAndEstado(UUID proveedorId, String estado);

    List<CuentaPagar> findByFechaVencimientoBeforeAndEstado(LocalDate fecha, String estado);

    List<CuentaPagar> findAllByOrderByFechaVencimientoDesc();
}
