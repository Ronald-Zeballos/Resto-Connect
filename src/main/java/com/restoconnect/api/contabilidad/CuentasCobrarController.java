package com.restoconnect.api.contabilidad;

import jakarta.validation.Valid;
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
@RequestMapping("/api/contabilidad/cuentas-cobrar")
@RequiredArgsConstructor
public class CuentasCobrarController {

    private final CuentaCobrarRepository cuentaCobrarRepository;
    private final CuentaCobrarCobroRepository cobroRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR')")
    public ResponseEntity<List<CuentaCobrarResponse>> listar() {
        return ResponseEntity.ok(
                cuentaCobrarRepository.findAllByOrderByFechaVencimientoDesc().stream()
                        .map(CuentaCobrarResponse::from).toList()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR')")
    public ResponseEntity<CuentaCobrarResponse> crear(@Valid @RequestBody CuentaCobrarRequest request) {
        CuentaCobrar cc = new CuentaCobrar();
        cc.setMontoOriginal(request.montoOriginal());
        cc.setSaldoPendiente(request.montoOriginal());
        cc.setFechaEmision(request.fechaEmision());
        cc.setFechaVencimiento(request.fechaVencimiento());
        cc.setDescripcion(request.descripcion());
        return ResponseEntity.ok(CuentaCobrarResponse.from(cuentaCobrarRepository.save(cc)));
    }

    @PostMapping("/{id}/cobros")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR') or hasRole('CAJERO')")
    public ResponseEntity<String> registrarCobro(@PathVariable UUID id, @Valid @RequestBody RegistrarCobroRequest request) {
        CuentaCobrar cc = cuentaCobrarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada."));
        CuentaCobrarCobro cobro = new CuentaCobrarCobro();
        cobro.setCuentaCobrar(cc);
        cobro.setFechaCobro(request.fechaCobro());
        cobro.setMonto(request.monto());
        cobro.setMetodoPago(request.metodoPago());
        cobro.setComprobante(request.comprobante());
        cobro.setObservaciones(request.observaciones());
        cobroRepository.save(cobro);
        cc.setSaldoPendiente(cc.getSaldoPendiente().subtract(request.monto()));
        cc.setFechaUltimoCobro(request.fechaCobro());
        if (cc.getSaldoPendiente().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            cc.setEstado("COBRADO");
        } else {
            cc.setEstado("PARCIAL");
        }
        cuentaCobrarRepository.save(cc);
        return ResponseEntity.ok("Cobro registrado.");
    }

    public record RegistrarCobroRequest(
            @jakarta.validation.constraints.NotNull java.time.LocalDate fechaCobro,
            @jakarta.validation.constraints.NotNull @jakarta.validation.constraints.DecimalMin("0.01") java.math.BigDecimal monto,
            String metodoPago,
            String comprobante,
            String observaciones
    ) {}
}
