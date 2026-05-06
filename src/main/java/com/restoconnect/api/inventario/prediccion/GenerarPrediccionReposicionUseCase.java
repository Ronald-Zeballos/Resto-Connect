package com.restoconnect.api.inventario.prediccion;

import com.restoconnect.api.auth.RolUsuario;
import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.inventario.item.ItemInventarioRepository;
import com.restoconnect.api.inventario.movimiento.MovimientoInventario;
import com.restoconnect.api.inventario.movimiento.MovimientoInventarioRepository;
import com.restoconnect.api.inventario.movimiento.TipoMovimientoInventario;
import com.restoconnect.api.inventario.parametros.ConfigurarParametrosInventarioUseCase;
import com.restoconnect.api.inventario.parametros.ParametroInventario;
import com.restoconnect.api.shared.exception.NotFoundException;
import com.restoconnect.api.shared.notification.NotificationService;
import com.restoconnect.api.shared.notification.SeveridadNotificacion;
import com.restoconnect.api.shared.notification.TipoNotificacion;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GenerarPrediccionReposicionUseCase {

    private final ItemInventarioRepository itemInventarioRepository;
    private final MovimientoInventarioRepository movimientoInventarioRepository;
    private final PrediccionReposicionRepository prediccionReposicionRepository;
    private final ConfigurarParametrosInventarioUseCase configurarParametrosInventarioUseCase;
    private final MotorPrediccionInventario motorPrediccionInventario;
    private final NotificationService notificationService;

    @Transactional
    public List<PrediccionReposicionResponse> ejecutarTodas() {
        return itemInventarioRepository.findByActivoTrueOrderByNombreAsc().stream()
                .map(item -> ejecutarParaItem(item.getId()))
                .toList();
    }

    @Transactional
    public PrediccionReposicionResponse ejecutarParaItem(UUID itemId) {
        ItemInventario item = itemInventarioRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Item de inventario no encontrado."));
        ParametroInventario parametros = configurarParametrosInventarioUseCase.obtenerActual();
        OffsetDateTime hasta = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime desde = hasta.minusDays(parametros.getDiasAnalisisConsumo());
        List<MovimientoInventario> salidas = movimientoInventarioRepository
                .findByItemInventarioIdAndTipoMovimientoAndFechaMovimientoBetweenOrderByFechaMovimientoAsc(
                        itemId,
                        TipoMovimientoInventario.SALIDA,
                        desde,
                        hasta
                );

        MotorPrediccionInventario.PrediccionCalculada calculada = motorPrediccionInventario.calcular(item, salidas, parametros);
        PrediccionReposicion prediccion = new PrediccionReposicion();
        prediccion.setItemInventario(item);
        prediccion.setConsumoPromedioDiario(calculada.consumoPromedioDiario());
        prediccion.setDiasHastaAgotamiento(calculada.diasHastaAgotamiento());
        prediccion.setFechaEstimadaAgotamiento(calculada.fechaEstimadaAgotamiento());
        prediccion.setCantidadSugeridaCompra(calculada.cantidadSugeridaCompra());
        prediccion.setNivelRiesgo(calculada.nivelRiesgo());
        prediccion.setConfianza(calculada.confianza());
        prediccion.setMotivo(calculada.motivo());
        prediccion.setFechaGeneracion(hasta);

        PrediccionReposicion persisted = prediccionReposicionRepository.save(prediccion);
        if (persisted.getCantidadSugeridaCompra().doubleValue() > 0
                && (persisted.getNivelRiesgo() == NivelRiesgoPrediccion.ALTO || persisted.getNivelRiesgo() == NivelRiesgoPrediccion.CRITICO)) {
            notificationService.emitir(
                    TipoNotificacion.COMPRA_RECOMENDADA,
                    "Compra recomendada",
                    "Se sugiere reponer " + item.getNombre() + " con " + persisted.getCantidadSugeridaCompra(),
                    persisted.getNivelRiesgo() == NivelRiesgoPrediccion.CRITICO ? SeveridadNotificacion.CRITICA : SeveridadNotificacion.ALTA,
                    RolUsuario.ADMIN,
                    "PrediccionReposicion",
                    persisted.getId()
            );
        }
        return PrediccionReposicionResponse.from(persisted);
    }

    public List<PrediccionReposicionResponse> listar() {
        return prediccionReposicionRepository.findAllByOrderByFechaGeneracionDesc().stream()
                .map(PrediccionReposicionResponse::from)
                .toList();
    }

    public PrediccionReposicionResponse obtenerUltimaPorItem(UUID itemId) {
        return prediccionReposicionRepository.findTopByItemInventarioIdOrderByFechaGeneracionDesc(itemId)
                .map(PrediccionReposicionResponse::from)
                .orElseThrow(() -> new NotFoundException("No existe prediccion para el item solicitado."));
    }
}

