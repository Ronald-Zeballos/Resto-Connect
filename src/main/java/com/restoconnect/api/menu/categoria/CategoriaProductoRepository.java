package com.restoconnect.api.menu.categoria;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaProductoRepository extends JpaRepository<CategoriaProducto, UUID> {

    List<CategoriaProducto> findByActivoTrueOrderByNombreAsc();

    Optional<CategoriaProducto> findByNombreIgnoreCase(String nombre);
}

