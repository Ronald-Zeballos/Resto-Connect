package com.restoconnect.api.menu.producto;

import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.inventario.item.ItemInventarioRepository;
import com.restoconnect.api.menu.categoria.CategoriaProducto;
import com.restoconnect.api.menu.categoria.CategoriaProductoRepository;
import com.restoconnect.api.shared.domain.MoneyUtils;
import com.restoconnect.api.shared.exception.NotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaProductoRepository categoriaProductoRepository;
    private final ItemInventarioRepository itemInventarioRepository;
    private final RecetaProductoRepository recetaProductoRepository;
    private final ProductoDisponibilidadService productoDisponibilidadService;

    @Transactional
    public ProductoResponse crear(CrearProductoRequest request) {
        CategoriaProducto categoria = categoriaProductoRepository.findById(request.categoriaId())
                .orElseThrow(() -> new NotFoundException("Categoria no encontrada."));

        Producto producto = new Producto();
        producto.setNombre(request.nombre());
        producto.setDescripcion(request.descripcion());
        producto.setPrecio(MoneyUtils.scale(request.precio()));
        producto.setCategoria(categoria);
        producto.setImagenUrl(request.imagenUrl());
        producto = productoRepository.save(producto);

        for (RecetaItemRequest recetaRequest : request.receta()) {
            ItemInventario item = itemInventarioRepository.findById(recetaRequest.itemInventarioId())
                    .orElseThrow(() -> new NotFoundException("Item de inventario no encontrado."));
            RecetaProducto recetaProducto = new RecetaProducto();
            recetaProducto.setProducto(producto);
            recetaProducto.setItemInventario(item);
            recetaProducto.setCantidadNecesaria(recetaRequest.cantidadNecesaria());
            recetaProductoRepository.save(recetaProducto);
        }

        productoDisponibilidadService.recalcularDisponibilidadProducto(producto);
        return map(productoRepository.findById(producto.getId()).orElseThrow());
    }

    public List<ProductoResponse> listar() {
        return productoRepository.findByActivoTrueOrderByNombreAsc().stream().map(this::map).toList();
    }

    @Transactional
    public ProductoResponse activar(UUID id) {
        Producto producto = productoRepository.findById(id).orElseThrow(() -> new NotFoundException("Producto no encontrado."));
        producto.setActivo(true);
        productoRepository.save(producto);
        productoDisponibilidadService.recalcularDisponibilidadProducto(producto);
        return map(producto);
    }

    @Transactional
    public ProductoResponse desactivar(UUID id) {
        Producto producto = productoRepository.findById(id).orElseThrow(() -> new NotFoundException("Producto no encontrado."));
        producto.setActivo(false);
        producto.setDisponible(false);
        return map(productoRepository.save(producto));
    }

    public ProductoResponse map(Producto producto) {
        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getPrecio(),
                producto.getCategoria().getId(),
                producto.getCategoria().getNombre(),
                producto.isActivo(),
                producto.isDisponible(),
                producto.getImagenUrl(),
                recetaProductoRepository.findByProductoId(producto.getId()).stream()
                        .map(receta -> new RecetaResponse(
                                receta.getItemInventario().getId(),
                                receta.getItemInventario().getNombre(),
                                receta.getCantidadNecesaria(),
                                receta.getItemInventario().getUnidadMedida()
                        ))
                        .toList()
        );
    }

    public record CrearProductoRequest(
            @NotBlank(message = "El nombre es obligatorio.") String nombre,
            @NotBlank(message = "La descripcion es obligatoria.") String descripcion,
            @NotNull(message = "El precio es obligatorio.") @DecimalMin(value = "0.0", inclusive = false) BigDecimal precio,
            @NotNull(message = "La categoria es obligatoria.") UUID categoriaId,
            String imagenUrl,
            @NotEmpty(message = "La receta debe tener al menos un insumo.") List<@Valid RecetaItemRequest> receta
    ) {
    }

    public record RecetaItemRequest(
            @NotNull(message = "El item de inventario es obligatorio.") UUID itemInventarioId,
            @NotNull(message = "La cantidad es obligatoria.") @DecimalMin(value = "0.0", inclusive = false) BigDecimal cantidadNecesaria
    ) {
    }
}

