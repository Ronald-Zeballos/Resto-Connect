package com.restoconnect.api.personal;

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
@RequestMapping("/api/personal/usuarios")
@RequiredArgsConstructor
public class PersonalController {

    private final RegistrarPersonalUseCase registrarPersonalUseCase;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioPersonalResponse>> listar() {
        return ResponseEntity.ok(registrarPersonalUseCase.listar());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioPersonalResponse> crear(@Valid @RequestBody CrearUsuarioPersonalRequest request) {
        return ResponseEntity.ok(registrarPersonalUseCase.crear(request));
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioPersonalResponse> activar(@PathVariable UUID id) {
        return ResponseEntity.ok(registrarPersonalUseCase.activar(id));
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioPersonalResponse> desactivar(@PathVariable UUID id) {
        return ResponseEntity.ok(registrarPersonalUseCase.desactivar(id));
    }
}
