package com.restoconnect.api.mesa;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MesaRepository extends JpaRepository<Mesa, UUID> {

    List<Mesa> findAllByOrderByNumeroAsc();

    Optional<Mesa> findByNumero(Integer numero);

    Optional<Mesa> findByCodigoQr(String codigoQr);
}
