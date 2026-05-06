package com.restoconnect.api.inventario.alerta;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventario/alertas")
@RequiredArgsConstructor
public class AlertasInventarioController {

    private final AlertaInventarioRepository alertaInventarioRepository;
    private final MarcarAlertaAtendidaUseCase marcarAlertaAtendidaUseCase;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<List<AlertaInventarioResponse>> listar() {
        return ResponseEntity.ok(alertaInventarioRepository.findAllByOrderByFechaCreacionDesc().stream()
                .map(AlertaInventarioResponse::from)
                .toList());
    }

    @PatchMapping("/{id}/atendida")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<AlertaInventarioResponse> atender(@PathVariable UUID id) {
        return ResponseEntity.ok(marcarAlertaAtendidaUseCase.ejecutar(id));
    }
}

