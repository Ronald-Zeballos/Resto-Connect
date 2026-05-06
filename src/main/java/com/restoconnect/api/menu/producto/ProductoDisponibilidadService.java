package com.restoconnect.api.menu.producto;

import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductoDisponibilidadService {

    private final ProductoRepository productoRepository;
    private final RecetaProductoRepository recetaProductoRepository;

    public boolean puedePrepararse(Producto producto, int cantidad) {
        return recetaProductoRepository.findByProductoId(producto.getId()).stream()
                .allMatch(receta -> receta.getItemInventario().getStockActual()
                        .compareTo(receta.getCantidadNecesaria().multiply(BigDecimal.valueOf(cantidad))) >= 0);
    }

    @Transactional
    public void recalcularDisponibilidadProducto(Producto producto) {
        boolean disponible = producto.isActivo() && puedePrepararse(producto, 1);
        producto.setDisponible(disponible);
        productoRepository.save(producto);
    }

    @Transactional
    public void recalcularDisponibilidadPorItem(java.util.UUID itemId) {
        List<RecetaProducto> recetas = recetaProductoRepository.findByItemInventarioId(itemId);
        for (RecetaProducto receta : recetas) {
            recalcularDisponibilidadProducto(receta.getProducto());
        }
    }
}

