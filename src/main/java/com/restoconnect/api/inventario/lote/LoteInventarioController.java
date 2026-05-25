package com.restoconnect.api.inventario.lote;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventario/lotes")
@RequiredArgsConstructor
public class LoteInventarioController {

    private final LoteInventarioRepository repository;
    private final RegistrarLoteUseCase registrarLoteUseCase;

    @GetMapping("/item/{itemId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COCINA')")
    public ResponseEntity<List<LoteInventarioResponse>> listarPorItem(@PathVariable UUID itemId) {
        return ResponseEntity.ok(
                repository.findByItemInventarioIdAndActivoTrueOrderByFechaVencimientoAsc(itemId)
                        .stream().map(LoteInventarioResponse::from).toList()
        );
    }

    @GetMapping("/proximos-vencer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoteInventarioResponse>> proximosAVencer() {
        var hoy = LocalDate.now();
        return ResponseEntity.ok(
                repository.findProximosAVencer(hoy, hoy.plusDays(7))
                        .stream().map(LoteInventarioResponse::from).toList()
        );
    }

    @GetMapping("/vencidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoteInventarioResponse>> vencidos() {
        return ResponseEntity.ok(
                repository.findVencidos(LocalDate.now())
                        .stream().map(LoteInventarioResponse::from).toList()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoteInventarioResponse> registrar(@RequestBody RegistrarLoteUseCase.RegistrarLoteRequest request) {
        return ResponseEntity.ok(registrarLoteUseCase.ejecutar(request));
    }
}
