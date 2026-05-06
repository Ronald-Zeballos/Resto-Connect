package com.restoconnect.api.shared.notification;

import com.restoconnect.api.auth.RolUsuario;
import com.restoconnect.api.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "notificaciones")
public class Notificacion extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoNotificacion tipo;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, length = 1200)
    private String mensaje;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeveridadNotificacion severidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rolDestino;

    @Column(nullable = false)
    private boolean leida;

    @Column(nullable = false)
    private String entidadRelacionada;

    @Column(nullable = false)
    private UUID entidadId;
}

