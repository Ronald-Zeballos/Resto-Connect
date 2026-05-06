package com.restoconnect.api.pago;

import com.restoconnect.api.pago.efectivo.RegistrarPagoEfectivoUseCase;
import com.restoconnect.api.pago.pasarela.ProcesarPagoPasarelaUseCase;
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
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final RegistrarPagoEfectivoUseCase registrarPagoEfectivoUseCase;
    private final ProcesarPagoPasarelaUseCase procesarPagoPasarelaUseCase;
    private final PagoRepository pagoRepository;

    @PostMapping("/efectivo")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<RegistrarPagoEfectivoUseCase.RegistrarPagoEfectivoResponse> efectivo(
            @Valid @RequestBody RegistrarPagoEfectivoUseCase.RegistrarPagoEfectivoRequest request
    ) {
        return ResponseEntity.ok(registrarPagoEfectivoUseCase.ejecutar(request));
    }

    @PostMapping("/pasarela/simular")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('CLIENTE_QR')")
    public ResponseEntity<ProcesarPagoPasarelaUseCase.ProcesarPagoPasarelaResponse> pasarela(
            @Valid @RequestBody ProcesarPagoPasarelaUseCase.ProcesarPagoPasarelaRequest request
    ) {
        return ResponseEntity.ok(procesarPagoPasarelaUseCase.ejecutar(request));
    }

    @GetMapping("/pendiente-efectivo")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<List<PagoResponse>> pendientesEfectivo() {
        return ResponseEntity.ok(pagoRepository.findByEstadoOrderByFechaCreacionDesc(EstadoPago.PENDIENTE_CONFIRMACION)
                .stream()
                .map(PagoResponse::from)
                .toList());
    }
}

