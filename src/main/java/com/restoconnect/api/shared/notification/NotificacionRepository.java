package com.restoconnect.api.shared.notification;

import com.restoconnect.api.auth.RolUsuario;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacionRepository extends JpaRepository<Notificacion, UUID> {

    List<Notificacion> findByRolDestinoOrderByFechaCreacionDesc(RolUsuario rolDestino);
}

