package com.restoconnect.api.compras.ordencompra;

import com.restoconnect.api.inventario.prediccion.PrediccionReposicion;
import com.restoconnect.api.inventario.prediccion.PrediccionReposicionRepository;
import com.restoconnect.api.shared.domain.MoneyUtils;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GenerarOrdenCompraDesdePrediccionUseCase {

    private final PrediccionReposicionRepository prediccionReposicionRepository;
    private final OrdenCompraRepository ordenCompraRepository;

    @Transactional
    public OrdenCompraResponse ejecutar(UUID prediccionId) {
        PrediccionReposicion prediccion = prediccionReposicionRepository.findById(prediccionId)
                .orElseThrow(() -> new NotFoundException("Prediccion no encontrada."));
        if (prediccion.getCantidadSugeridaCompra().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("La prediccion no requiere generar orden de compra.");
        }
        if (prediccion.getItemInventario().getProveedorPreferido() == null) {
            throw new BusinessException("El item no tiene proveedor preferido configurado.");
        }

        OrdenCompra ordenCompra = new OrdenCompra();
        ordenCompra.setProveedor(prediccion.getItemInventario().getProveedorPreferido());
        ordenCompra.setEstado(EstadoOrdenCompra.SUGERIDA);

        OrdenCompraDetalle detalle = new OrdenCompraDetalle();
        detalle.setOrdenCompra(ordenCompra);
        detalle.setItemInventario(prediccion.getItemInventario());
        detalle.setCantidad(prediccion.getCantidadSugeridaCompra());
        detalle.setCostoUnitario(prediccion.getItemInventario().getCostoUnitario());
        detalle.setSubtotal(MoneyUtils.scale(detalle.getCantidad().multiply(detalle.getCostoUnitario())));
        ordenCompra.getDetalles().add(detalle);
        ordenCompra.setCostoEstimado(detalle.getSubtotal());
        return OrdenCompraResponse.from(ordenCompraRepository.save(ordenCompra));
    }
}

