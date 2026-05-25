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
@RequestMapping("/api/contabilidad/cuentas-pagar")
@RequiredArgsConstructor
public class CuentasPagarController {

    private final CuentaPagarRepository cuentaPagarRepository;
    private final CuentaPagarPagoRepository pagoRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR')")
    public ResponseEntity<List<CuentaPagarResponse>> listar() {
        return ResponseEntity.ok(
                cuentaPagarRepository.findAllByOrderByFechaVencimientoDesc().stream()
                        .map(CuentaPagarResponse::from).toList()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR')")
    public ResponseEntity<CuentaPagarResponse> crear(@Valid @RequestBody CuentaPagarRequest request) {
        CuentaPagar cp = new CuentaPagar();
        cp.setMontoOriginal(request.montoOriginal());
        cp.setSaldoPendiente(request.montoOriginal());
        cp.setFechaEmision(request.fechaEmision());
        cp.setFechaVencimiento(request.fechaVencimiento());
        cp.setDescripcion(request.descripcion());
        cp.setNumeroComprobante(request.numeroComprobante());
        if (request.ordenCompraId() != null) {
            cp.setOrdenCompra(new com.restoconnect.api.compras.ordencompra.OrdenCompra());
            cp.getOrdenCompra().setId(request.ordenCompraId());
        }
        return ResponseEntity.ok(CuentaPagarResponse.from(cuentaPagarRepository.save(cp)));
    }

    @PostMapping("/{id}/pagos")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR')")
    public ResponseEntity<String> registrarPago(@PathVariable UUID id, @Valid @RequestBody RegistrarPagoRequest request) {
        CuentaPagar cp = cuentaPagarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada."));
        CuentaPagarPago pago = new CuentaPagarPago();
        pago.setCuentaPagar(cp);
        pago.setFechaPago(request.fechaPago());
        pago.setMonto(request.monto());
        pago.setMetodoPago(request.metodoPago());
        pago.setComprobante(request.comprobante());
        pago.setObservaciones(request.observaciones());
        pagoRepository.save(pago);
        cp.setSaldoPendiente(cp.getSaldoPendiente().subtract(request.monto()));
        cp.setFechaUltimoPago(request.fechaPago());
        if (cp.getSaldoPendiente().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            cp.setEstado("PAGADO");
        } else {
            cp.setEstado("PARCIAL");
        }
        cuentaPagarRepository.save(cp);
        return ResponseEntity.ok("Pago registrado.");
    }

    public record RegistrarPagoRequest(
            @jakarta.validation.constraints.NotNull java.time.LocalDate fechaPago,
            @jakarta.validation.constraints.NotNull @jakarta.validation.constraints.DecimalMin("0.01") java.math.BigDecimal monto,
            String metodoPago,
            String comprobante,
            String observaciones
    ) {}
}
