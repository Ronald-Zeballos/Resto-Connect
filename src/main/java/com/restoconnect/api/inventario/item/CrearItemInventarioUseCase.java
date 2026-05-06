package com.restoconnect.api.inventario.item;

import com.restoconnect.api.compras.proveedor.Proveedor;
import com.restoconnect.api.compras.proveedor.ProveedorRepository;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CrearItemInventarioUseCase {

    private final ItemInventarioRepository itemInventarioRepository;
    private final ProveedorRepository proveedorRepository;

    @Transactional
    public ItemInventarioResponse ejecutar(CrearItemInventarioRequest request) {
        validarRangos(request.stockMinimo(), request.stockMaximo(), request.puntoReorden());
        ItemInventario item = new ItemInventario();
        item.setNombre(request.nombre());
        item.setDescripcion(request.descripcion());
        item.setUnidadMedida(request.unidadMedida());
        item.setStockActual(request.stockActual());
        item.setStockMinimo(request.stockMinimo());
        item.setStockMaximo(request.stockMaximo());
        item.setPuntoReorden(request.puntoReorden());
        item.setCostoUnitario(request.costoUnitario());
        item.setTiempoEntregaProveedorDias(request.tiempoEntregaProveedorDias());
        item.setClasificacionAbc(request.clasificacionAbc() == null ? ClasificacionAbc.MEDIA : request.clasificacionAbc());
        item.setProveedorPreferido(resolveProveedor(request.proveedorPreferidoId()));
        return ItemInventarioResponse.from(itemInventarioRepository.save(item));
    }

    private void validarRangos(BigDecimal stockMinimo, BigDecimal stockMaximo, BigDecimal puntoReorden) {
        if (stockMaximo.compareTo(stockMinimo) < 0) {
            throw new BusinessException("El stock maximo no puede ser menor al stock minimo.");
        }
        if (puntoReorden.compareTo(stockMinimo) < 0) {
            throw new BusinessException("El punto de reorden no puede ser menor al stock minimo.");
        }
    }

    private Proveedor resolveProveedor(java.util.UUID proveedorId) {
        if (proveedorId == null) {
            return null;
        }
        return proveedorRepository.findById(proveedorId)
                .orElseThrow(() -> new NotFoundException("Proveedor no encontrado."));
    }
}

