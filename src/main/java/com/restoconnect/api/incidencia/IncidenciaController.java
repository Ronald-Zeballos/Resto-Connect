package com.restoconnect.api.incidencia;

import com.restoconnect.api.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/incidencias")
@RequiredArgsConstructor
public class IncidenciaController {

    private final RegistrarIncidenciaUseCase registrarIncidenciaUseCase;
    private final ActualizarEstadoIncidenciaUseCase actualizarEstadoIncidenciaUseCase;
    private final IncidenciaQueryService incidenciaQueryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('COCINA')")
    public ResponseEntity<IncidenciaResponse> registrar(
            @Valid @RequestBody RegistrarIncidenciaRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(registrarIncidenciaUseCase.ejecutar(request, principal.getUsuario().getId()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('COCINA')")
    public ResponseEntity<List<IncidenciaResponse>> listar() {
        return ResponseEntity.ok(incidenciaQueryService.listarTodas());
    }

    @GetMapping("/pendientes")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('COCINA')")
    public ResponseEntity<List<IncidenciaResponse>> pendientes() {
        return ResponseEntity.ok(incidenciaQueryService.listarPendientes());
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<IncidenciaResponse> actualizarEstado(
            @PathVariable UUID id,
            @Valid @RequestBody ActualizarEstadoIncidenciaRequest request
    ) {
        return ResponseEntity.ok(actualizarEstadoIncidenciaUseCase.ejecutar(id, request));
    }
}
