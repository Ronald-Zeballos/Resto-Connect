package com.restoconnect.api.menu.producto;

import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.inventario.item.ItemInventarioRepository;
import com.restoconnect.api.shared.exception.NotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/menu/productos/{productoId}/receta")
@RequiredArgsConstructor
public class RecetaProductoController {

    private final RecetaProductoRepository recetaProductoRepository;
    private final ProductoRepository productoRepository;
    private final ItemInventarioRepository itemInventarioRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('INVENTARIO') or hasRole('COCINA')")
    public ResponseEntity<List<RecetaResponse>> listar(@PathVariable UUID productoId) {
        return ResponseEntity.ok(
                recetaProductoRepository.findByProductoId(productoId).stream()
                        .map(r -> new RecetaResponse(
                                r.getId(),
                                r.getItemInventario().getId(),
                                r.getItemInventario().getNombre(),
                                r.getCantidadNecesaria(),
                                r.getItemInventario().getUnidadMedida()
                        ))
                        .toList()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('INVENTARIO')")
    public ResponseEntity<RecetaResponse> agregar(
            @PathVariable UUID productoId,
            @Valid @RequestBody AgregarRecetaRequest request
    ) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado."));
        ItemInventario item = itemInventarioRepository.findById(request.itemInventarioId())
                .orElseThrow(() -> new NotFoundException("Item de inventario no encontrado."));
        RecetaProducto receta = new RecetaProducto();
        receta.setProducto(producto);
        receta.setItemInventario(item);
        receta.setCantidadNecesaria(request.cantidadNecesaria());
        receta = recetaProductoRepository.save(receta);
        return ResponseEntity.ok(new RecetaResponse(
                receta.getId(),
                receta.getItemInventario().getId(),
                receta.getItemInventario().getNombre(),
                receta.getCantidadNecesaria(),
                receta.getItemInventario().getUnidadMedida()
        ));
    }

    @DeleteMapping("/{recetaId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('INVENTARIO')")
    public ResponseEntity<Void> eliminar(@PathVariable UUID productoId, @PathVariable UUID recetaId) {
        recetaProductoRepository.deleteById(recetaId);
        return ResponseEntity.noContent().build();
    }

    public record AgregarRecetaRequest(
            @NotNull UUID itemInventarioId,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal cantidadNecesaria
    ) {
    }
}
