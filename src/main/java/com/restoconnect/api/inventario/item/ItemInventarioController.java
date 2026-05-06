package com.restoconnect.api.inventario.item;

import com.restoconnect.api.shared.exception.NotFoundException;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventario/items")
@RequiredArgsConstructor
public class ItemInventarioController {

    private final ItemInventarioRepository itemInventarioRepository;
    private final CrearItemInventarioUseCase crearItemInventarioUseCase;
    private final ActualizarItemInventarioUseCase actualizarItemInventarioUseCase;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ItemInventarioResponse> crear(@Valid @RequestBody CrearItemInventarioRequest request) {
        return ResponseEntity.ok(crearItemInventarioUseCase.ejecutar(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('COCINA')")
    public ResponseEntity<List<ItemInventarioResponse>> listar() {
        return ResponseEntity.ok(itemInventarioRepository.findByActivoTrueOrderByNombreAsc().stream()
                .map(ItemInventarioResponse::from)
                .toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('COCINA')")
    public ResponseEntity<ItemInventarioResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(itemInventarioRepository.findById(id)
                .map(ItemInventarioResponse::from)
                .orElseThrow(() -> new NotFoundException("Item de inventario no encontrado.")));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ItemInventarioResponse> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody ActualizarItemInventarioRequest request
    ) {
        return ResponseEntity.ok(actualizarItemInventarioUseCase.ejecutar(id, request));
    }
}

