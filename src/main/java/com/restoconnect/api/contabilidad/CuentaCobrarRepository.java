package com.restoconnect.api.contabilidad;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuentaCobrarRepository extends JpaRepository<CuentaCobrar, UUID> {

    List<CuentaCobrar> findByEstadoOrderByFechaVencimientoAsc(String estado);

    List<CuentaCobrar> findByClienteIdAndEstado(UUID clienteId, String estado);

    List<CuentaCobrar> findByFechaVencimientoBeforeAndEstado(LocalDate fecha, String estado);

    List<CuentaCobrar> findAllByOrderByFechaVencimientoDesc();
}
