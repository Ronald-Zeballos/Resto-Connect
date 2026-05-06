package com.restoconnect.api.inventario.parametros;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParametroInventarioRepository extends JpaRepository<ParametroInventario, UUID> {

    Optional<ParametroInventario> findTopByOrderByFechaCreacionAsc();
}

