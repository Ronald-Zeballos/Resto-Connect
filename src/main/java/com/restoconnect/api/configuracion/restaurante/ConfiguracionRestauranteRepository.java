package com.restoconnect.api.configuracion.restaurante;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracionRestauranteRepository extends JpaRepository<ConfiguracionRestaurante, UUID> {

    Optional<ConfiguracionRestaurante> findTopByOrderByFechaCreacionAsc();
}

