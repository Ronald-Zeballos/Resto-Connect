package com.restoconnect.api.almacen;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlmacenRepository extends JpaRepository<Almacen, UUID> {

    List<Almacen> findByActivoTrueOrderByNombreAsc();
}
