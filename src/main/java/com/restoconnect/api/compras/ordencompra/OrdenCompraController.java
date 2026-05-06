package com.restoconnect.api.compras.ordencompra;

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
@RequestMapping("/api/compras/ordenes")
@RequiredArgsConstructor
public class OrdenCompraController {

    private final CrearOrdenCompraUseCase crearOrdenCompraUseCase;
    private final OrdenCompraRepository ordenCompraRepository;
    private final AprobarOrdenCompraUseCase aprobarOrdenCompraUseCase;
    private final RecibirOrdenCompraUseCase recibirOrdenCompraUseCase;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrdenCompraResponse> crear(@Valid @RequestBody CrearOrdenCompraUseCase.CrearOrdenCompraRequest request) {
        return ResponseEntity.ok(crearOrdenCompraUseCase.ejecutar(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<List<OrdenCompraResponse>> listar() {
        return ResponseEntity.ok(ordenCompraRepository.findAllByOrderByFechaCreacionDesc().stream()
                .map(OrdenCompraResponse::from)
                .toList());
    }

    @PatchMapping("/{id}/aprobar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrdenCompraResponse> aprobar(@PathVariable UUID id) {
        return ResponseEntity.ok(aprobarOrdenCompraUseCase.ejecutar(id));
    }

    @PatchMapping("/{id}/recibir")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrdenCompraResponse> recibir(@PathVariable UUID id) {
        return ResponseEntity.ok(recibirOrdenCompraUseCase.ejecutar(id));
    }
}
