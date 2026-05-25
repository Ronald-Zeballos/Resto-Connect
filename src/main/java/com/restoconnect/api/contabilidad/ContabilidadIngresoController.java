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
@RequestMapping("/api/contabilidad/ingresos")
@RequiredArgsConstructor
public class ContabilidadIngresoController {

    private final ContabilidadIngresoRepository ingresoRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR')")
    public ResponseEntity<List<ContabilidadIngresoResponse>> listar() {
        return ResponseEntity.ok(
                ingresoRepository.findAllByOrderByFechaIngresoDesc().stream()
                        .map(ContabilidadIngresoResponse::from).toList()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR')")
    public ResponseEntity<ContabilidadIngresoResponse> crear(@Valid @RequestBody ContabilidadIngresoRequest request) {
        ContabilidadIngreso i = new ContabilidadIngreso();
        i.setFechaIngreso(request.fechaIngreso());
        i.setDescripcion(request.descripcion());
        i.setCategoriaIngreso(request.categoriaIngreso());
        i.setMonto(request.monto());
        i.setMetodoPago(request.metodoPago() != null ? request.metodoPago() : "EFECTIVO");
        i.setComprobante(request.comprobante());
        i.setObservaciones(request.observaciones());
        return ResponseEntity.ok(ContabilidadIngresoResponse.from(ingresoRepository.save(i)));
    }
}
