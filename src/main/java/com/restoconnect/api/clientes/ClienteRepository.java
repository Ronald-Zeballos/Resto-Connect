package com.restoconnect.api.clientes;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, UUID> {

    List<Cliente> findByActivoTrueOrderByNombreAsc();

    Optional<Cliente> findByNitCi(String nitCi);
}
