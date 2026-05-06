package com.restoconnect.api.inventario.alerta;

import com.restoconnect.api.auth.RolUsuario;
import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.shared.notification.NotificationService;
import com.restoconnect.api.shared.notification.SeveridadNotificacion;
import com.restoconnect.api.shared.notification.TipoNotificacion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GenerarAlertasInventarioUseCase {

    private final AlertaInventarioRepository alertaInventarioRepository;
    private final NotificationService notificationService;

    @Transactional
    public void evaluar(ItemInventario item) {
        if (!item.isActivo()) {
            return;
        }

        if (item.getStockActual().doubleValue() <= 0) {
            crearSiNoExiste(item, TipoAlertaInventario.AGOTADO, SeveridadNotificacion.CRITICA,
                    "El item " + item.getNombre() + " se quedo sin stock.",
                    TipoNotificacion.PRODUCTO_AGOTADO);
            return;
        }

        if (item.getStockActual().compareTo(item.getStockMinimo()) <= 0) {
            crearSiNoExiste(item, TipoAlertaInventario.STOCK_BAJO, SeveridadNotificacion.ALTA,
                    "El item " + item.getNombre() + " bajo del stock minimo.",
                    TipoNotificacion.STOCK_BAJO);
        }

        if (item.getStockActual().compareTo(item.getPuntoReorden()) <= 0) {
            crearSiNoExiste(item, TipoAlertaInventario.REPOSICION_SUGERIDA, SeveridadNotificacion.MEDIA,
                    "El item " + item.getNombre() + " llego al punto de reorden.",
                    TipoNotificacion.REPOSICION_SUGERIDA);
        }

        if (item.getStockActual().compareTo(item.getStockMaximo()) > 0) {
            crearSiNoExiste(item, TipoAlertaInventario.SOBRESTOCK, SeveridadNotificacion.INFO,
                    "El item " + item.getNombre() + " presenta sobrestock.",
                    TipoNotificacion.STOCK_CRITICO);
        }
    }

    private void crearSiNoExiste(
            ItemInventario item,
            TipoAlertaInventario tipo,
            SeveridadNotificacion severidad,
            String mensaje,
            TipoNotificacion tipoNotificacion
    ) {
        if (alertaInventarioRepository.existsByItemInventarioIdAndTipoAndAtendidaFalse(item.getId(), tipo)) {
            return;
        }
        AlertaInventario alerta = new AlertaInventario();
        alerta.setItemInventario(item);
        alerta.setTipo(tipo);
        alerta.setSeveridad(severidad);
        alerta.setMensaje(mensaje);
        alerta.setAtendida(false);
        alertaInventarioRepository.save(alerta);
        notificationService.emitir(
                tipoNotificacion,
                "Alerta de inventario",
                mensaje,
                severidad,
                RolUsuario.ADMIN,
                "ItemInventario",
                item.getId()
        );
    }
}

