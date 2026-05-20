package com.restoconnect.api.pago.qr;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pagos/qr")
@RequiredArgsConstructor
public class PagoQrController {

    private final PagoQrService pagoQrService;

    @GetMapping("/cobrables")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<List<PagoQrService.CobroPendienteResponse>> cobrables() {
        return ResponseEntity.ok(pagoQrService.listarCobrosPendientes());
    }

    @PostMapping("/generar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('CLIENTE_QR')")
    public ResponseEntity<PagoQrService.PagoQrResponse> generar(
            @Valid @RequestBody PagoQrService.GenerarPagoQrRequest request
    ) {
        return ResponseEntity.ok(pagoQrService.generar(request));
    }

    @GetMapping("/{qrId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('CLIENTE_QR')")
    public ResponseEntity<PagoQrService.PagoQrResponse> consultar(@PathVariable String qrId) {
        return ResponseEntity.ok(pagoQrService.consultar(qrId));
    }

    @DeleteMapping("/{qrId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('CLIENTE_QR')")
    public ResponseEntity<PagoQrService.PagoQrResponse> cancelar(@PathVariable String qrId) {
        return ResponseEntity.ok(pagoQrService.cancelar(qrId));
    }

    @PostMapping("/{qrId}/confirmar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('CLIENTE_QR')")
    public ResponseEntity<PagoQrService.ConfirmacionPagoQrResponse> confirmar(
            @PathVariable String qrId,
            @RequestBody(required = false) PagoQrService.ConfirmarPagoQrRequest request
    ) {
        return ResponseEntity.ok(pagoQrService.confirmar(qrId, request));
    }
}
