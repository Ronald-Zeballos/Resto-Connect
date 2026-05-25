package com.restoconnect.api.inventario.categoria;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaInventarioRepository extends JpaRepository<CategoriaInventario, UUID> {
    List<CategoriaInventario> findByActivoTrueOrderByNombreAsc();
}
