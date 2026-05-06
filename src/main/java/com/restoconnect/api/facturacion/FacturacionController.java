package com.restoconnect.api.facturacion;

import com.restoconnect.api.shared.exception.NotFoundException;
import jakarta.validation.Valid;
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
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
public class FacturacionController {

    private final GenerarFacturaUseCase generarFacturaUseCase;
    private final FacturaRepository facturaRepository;

    @PostMapping("/generar/{pedidoId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<FacturaResponse> generar(
            @PathVariable UUID pedidoId,
            @Valid @RequestBody DatosFacturacionRequest request
    ) {
        return ResponseEntity.ok(generarFacturaUseCase.generar(pedidoId, request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<FacturaResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(facturaRepository.findById(id)
                .map(FacturaResponse::from)
                .orElseThrow(() -> new NotFoundException("Factura no encontrada.")));
    }
}

