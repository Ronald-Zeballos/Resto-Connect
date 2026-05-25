package com.restoconnect.api.inventario.item;

import com.restoconnect.api.compras.proveedor.ProveedorRepository;
import com.restoconnect.api.inventario.categoria.CategoriaInventarioRepository;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActualizarItemInventarioUseCase {

    private final ItemInventarioRepository itemInventarioRepository;
    private final ProveedorRepository proveedorRepository;
    private final CategoriaInventarioRepository categoriaInventarioRepository;

    @Transactional
    public ItemInventarioResponse ejecutar(UUID id, ActualizarItemInventarioRequest request) {
        ItemInventario item = itemInventarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Item de inventario no encontrado."));
        validarRangos(request.stockMinimo(), request.stockMaximo(), request.puntoReorden());
        item.setNombre(request.nombre());
        item.setDescripcion(request.descripcion());
        item.setUnidadMedida(request.unidadMedida());
        item.setStockMinimo(request.stockMinimo());
        item.setStockMaximo(request.stockMaximo());
        item.setPuntoReorden(request.puntoReorden());
        item.setCostoUnitario(request.costoUnitario());
        item.setTiempoEntregaProveedorDias(request.tiempoEntregaProveedorDias());
        item.setClasificacionAbc(request.clasificacionAbc() == null ? ClasificacionAbc.MEDIA : request.clasificacionAbc());
        item.setActivo(request.activo());
        item.setProveedorPreferido(request.proveedorPreferidoId() == null ? null :
                proveedorRepository.findById(request.proveedorPreferidoId())
                        .orElseThrow(() -> new NotFoundException("Proveedor no encontrado.")));
        item.setCategoria(request.categoriaId() == null ? null :
                categoriaInventarioRepository.findById(request.categoriaId())
                        .orElseThrow(() -> new NotFoundException("Categoria no encontrada.")));
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
}

