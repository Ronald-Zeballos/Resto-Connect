package com.restoconnect.api.inventario.parametros;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventario/parametros")
@RequiredArgsConstructor
public class ParametrosInventarioController {

    private final ConfigurarParametrosInventarioUseCase configurarParametrosInventarioUseCase;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParametrosInventarioResponse> obtener() {
        return ResponseEntity.ok(ParametrosInventarioResponse.from(configurarParametrosInventarioUseCase.obtenerActual()));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParametrosInventarioResponse> actualizar(@Valid @RequestBody ParametrosInventarioRequest request) {
        return ResponseEntity.ok(configurarParametrosInventarioUseCase.configurar(request));
    }
}

