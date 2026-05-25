package com.restoconnect.api.inventario.categoria;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventario/categorias")
@RequiredArgsConstructor
public class CategoriaInventarioController {

    private final CategoriaInventarioRepository repository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CategoriaInventarioResponse>> listar() {
        return ResponseEntity.ok(
                repository.findByActivoTrueOrderByNombreAsc().stream()
                        .map(CategoriaInventarioResponse::from)
                        .toList()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoriaInventarioResponse> crear(@Valid @RequestBody CrearCategoriaRequest request) {
        var categoria = new CategoriaInventario();
        categoria.setNombre(request.nombre());
        categoria.setDescripcion(request.descripcion());
        return ResponseEntity.ok(CategoriaInventarioResponse.from(repository.save(categoria)));
    }

    public record CrearCategoriaRequest(
            @NotBlank String nombre,
            String descripcion
    ) {}
}
