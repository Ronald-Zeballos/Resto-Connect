package com.restoconnect.api.inventario.movimiento;

import com.restoconnect.api.inventario.alerta.GenerarAlertasInventarioUseCase;
import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.inventario.item.ItemInventarioRepository;
import com.restoconnect.api.inventario.prediccion.GenerarPrediccionReposicionUseCase;
import com.restoconnect.api.inventario.parametros.ConfigurarParametrosInventarioUseCase;
import com.restoconnect.api.menu.producto.ProductoDisponibilidadService;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistrarSalidaInventarioUseCase {

    private final ItemInventarioRepository itemInventarioRepository;
    private final MovimientoInventarioRepository movimientoInventarioRepository;
    private final GenerarAlertasInventarioUseCase generarAlertasInventarioUseCase;
    private final ProductoDisponibilidadService productoDisponibilidadService;
    private final ConfigurarParametrosInventarioUseCase configurarParametrosInventarioUseCase;
    private final GenerarPrediccionReposicionUseCase generarPrediccionReposicionUseCase;

    @Transactional
    public MovimientoInventarioResponse ejecutar(RegistrarMovimientoInventarioRequest request) {
        ItemInventario item = itemInventarioRepository.findById(request.itemInventarioId())
                .orElseThrow(() -> new NotFoundException("Item de inventario no encontrado."));
        MovimientoInventario movimiento = registrarSalidaInterna(item, request.cantidad(), request.motivo(), request.referencia());
        return MovimientoInventarioResponse.from(movimiento);
    }

    @Transactional
    public MovimientoInventario registrarDesdePedido(ItemInventario item, BigDecimal cantidad, String referencia) {
        return registrarSalidaInterna(item, cantidad, "Salida por pedido confirmado", referencia);
    }

    private MovimientoInventario registrarSalidaInterna(ItemInventario item, BigDecimal cantidad, String motivo, String referencia) {
        if (item.getStockActual().compareTo(cantidad) < 0) {
            throw new BusinessException("Stock insuficiente para " + item.getNombre() + ".");
        }
        item.setStockActual(item.getStockActual().subtract(cantidad));
        itemInventarioRepository.save(item);

        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setItemInventario(item);
        movimiento.setTipoMovimiento(TipoMovimientoInventario.SALIDA);
        movimiento.setCantidad(cantidad);
        movimiento.setMotivo(motivo);
        movimiento.setReferencia(referencia);
        movimiento.setFechaMovimiento(OffsetDateTime.now(ZoneOffset.UTC));
        MovimientoInventario persisted = movimientoInventarioRepository.save(movimiento);

        generarAlertasInventarioUseCase.evaluar(item);
        productoDisponibilidadService.recalcularDisponibilidadPorItem(item.getId());
        if (configurarParametrosInventarioUseCase.obtenerActual().isActivarPrediccionAutomatica()) {
            generarPrediccionReposicionUseCase.ejecutarParaItem(item.getId());
        }
        return persisted;
    }
}

