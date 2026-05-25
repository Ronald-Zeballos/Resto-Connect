package com.restoconnect.api.compras.proveedor;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/compras/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('INVENTARIO')")
    public ResponseEntity<ProveedorResponse> crear(@Valid @RequestBody CrearProveedorRequest request) {
        return ResponseEntity.ok(proveedorService.crear(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('INVENTARIO') or hasRole('CAJERO') or hasRole('MESERO')")
    public ResponseEntity<List<ProveedorResponse>> listar() {
        return ResponseEntity.ok(proveedorService.listar());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('INVENTARIO')")
    public ResponseEntity<ProveedorResponse> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody CrearProveedorRequest request
    ) {
        return ResponseEntity.ok(proveedorService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desactivar(@PathVariable UUID id) {
        proveedorService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}

