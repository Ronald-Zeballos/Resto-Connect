package com.restoconnect.api.compras.ordencompra;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('INVENTARIO')")
    public ResponseEntity<OrdenCompraResponse> crear(@Valid @RequestBody CrearOrdenCompraUseCase.CrearOrdenCompraRequest request) {
        return ResponseEntity.ok(crearOrdenCompraUseCase.ejecutar(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('INVENTARIO') or hasRole('CAJERO')")
    public ResponseEntity<List<OrdenCompraResponse>> listar() {
        return ResponseEntity.ok(ordenCompraRepository.findAllByOrderByFechaCreacionDesc().stream()
                .map(OrdenCompraResponse::from)
                .toList());
    }

    @PatchMapping("/{id}/aprobar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE')")
    public ResponseEntity<OrdenCompraResponse> aprobar(@PathVariable UUID id) {
        return ResponseEntity.ok(aprobarOrdenCompraUseCase.ejecutar(id));
    }

    @PatchMapping("/{id}/recibir")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('INVENTARIO')")
    public ResponseEntity<OrdenCompraResponse> recibir(@PathVariable UUID id) {
        return ResponseEntity.ok(recibirOrdenCompraUseCase.ejecutar(id));
    }

    @PatchMapping("/{id}/pago")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR')")
    public ResponseEntity<OrdenCompraResponse> registrarPago(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        OrdenCompra oc = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada."));
        oc.setEstadoPago("PAGADO");
        oc.setFechaPago(body.containsKey("fechaPago") ? LocalDate.parse(body.get("fechaPago")) : LocalDate.now());
        return ResponseEntity.ok(OrdenCompraResponse.from(ordenCompraRepository.save(oc)));
    }
}
