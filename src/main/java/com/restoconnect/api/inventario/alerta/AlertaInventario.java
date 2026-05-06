package com.restoconnect.api.inventario.alerta;

import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.shared.domain.BaseEntity;
import com.restoconnect.api.shared.notification.SeveridadNotificacion;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "inventario_alertas")
public class AlertaInventario extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "item_inventario_id", nullable = false)
    private ItemInventario itemInventario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoAlertaInventario tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeveridadNotificacion severidad;

    @Column(nullable = false, length = 1000)
    private String mensaje;

    @Column(nullable = false)
    private boolean atendida;
}

