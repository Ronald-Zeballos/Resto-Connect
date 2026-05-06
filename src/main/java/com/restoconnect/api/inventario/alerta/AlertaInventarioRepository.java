package com.restoconnect.api.inventario.alerta;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertaInventarioRepository extends JpaRepository<AlertaInventario, UUID> {

    List<AlertaInventario> findAllByOrderByFechaCreacionDesc();

    boolean existsByItemInventarioIdAndTipoAndAtendidaFalse(UUID itemInventarioId, TipoAlertaInventario tipo);
}

