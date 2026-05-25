package com.restoconnect.api.contabilidad;

import jakarta.validation.Valid;
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
@RequestMapping("/api/contabilidad/gastos")
@RequiredArgsConstructor
public class ContabilidadGastoController {

    private final ContabilidadGastoRepository gastoRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR')")
    public ResponseEntity<List<ContabilidadGastoResponse>> listar() {
        return ResponseEntity.ok(
                gastoRepository.findAllByOrderByFechaGastoDesc().stream()
                        .map(ContabilidadGastoResponse::from).toList()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR')")
    public ResponseEntity<ContabilidadGastoResponse> crear(@Valid @RequestBody ContabilidadGastoRequest request) {
        ContabilidadGasto g = new ContabilidadGasto();
        g.setFechaGasto(request.fechaGasto());
        g.setDescripcion(request.descripcion());
        g.setCategoriaGasto(request.categoriaGasto());
        g.setMonto(request.monto());
        g.setMetodoPago(request.metodoPago() != null ? request.metodoPago() : "EFECTIVO");
        g.setComprobante(request.comprobante());
        g.setObservaciones(request.observaciones());
        return ResponseEntity.ok(ContabilidadGastoResponse.from(gastoRepository.save(g)));
    }
}
