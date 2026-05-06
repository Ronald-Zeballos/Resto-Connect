package com.restoconnect.api.inventario.prediccion;

import com.restoconnect.api.compras.ordencompra.GenerarOrdenCompraDesdePrediccionUseCase;
import com.restoconnect.api.compras.ordencompra.OrdenCompraResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventario/prediccion")
@RequiredArgsConstructor
public class PrediccionInventarioController {

    private final GenerarPrediccionReposicionUseCase generarPrediccionReposicionUseCase;
    private final GenerarOrdenCompraDesdePrediccionUseCase generarOrdenCompraDesdePrediccionUseCase;

    @PostMapping("/generar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PrediccionReposicionResponse>> generar() {
        return ResponseEntity.ok(generarPrediccionReposicionUseCase.ejecutarTodas());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<List<PrediccionReposicionResponse>> listar() {
        return ResponseEntity.ok(generarPrediccionReposicionUseCase.listar());
    }

    @GetMapping("/item/{itemId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<PrediccionReposicionResponse> obtenerPorItem(@PathVariable UUID itemId) {
        return ResponseEntity.ok(generarPrediccionReposicionUseCase.obtenerUltimaPorItem(itemId));
    }

    @PostMapping("/{id}/generar-orden-compra")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrdenCompraResponse> generarOrden(@PathVariable UUID id) {
        return ResponseEntity.ok(generarOrdenCompraDesdePrediccionUseCase.ejecutar(id));
    }
}
