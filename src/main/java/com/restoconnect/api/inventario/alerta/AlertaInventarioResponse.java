package com.restoconnect.api.inventario.alerta;

import com.restoconnect.api.shared.notification.SeveridadNotificacion;
import java.util.UUID;

public record AlertaInventarioResponse(
        UUID id,
        UUID itemInventarioId,
        String itemInventarioNombre,
        TipoAlertaInventario tipo,
        SeveridadNotificacion severidad,
        String mensaje,
        boolean atendida
) {
    public static AlertaInventarioResponse from(AlertaInventario alerta) {
        return new AlertaInventarioResponse(
                alerta.getId(),
                alerta.getItemInventario().getId(),
                alerta.getItemInventario().getNombre(),
                alerta.getTipo(),
                alerta.getSeveridad(),
                alerta.getMensaje(),
                alerta.isAtendida()
        );
    }
}

