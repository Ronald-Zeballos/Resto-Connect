package com.restoconnect.api.compras.proveedor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProveedorRepository extends JpaRepository<Proveedor, UUID> {

    List<Proveedor> findByActivoTrueOrderByNombreAsc();

    Optional<Proveedor> findByNit(String nit);
}

