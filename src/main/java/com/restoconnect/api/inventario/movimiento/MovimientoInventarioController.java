package com.restoconnect.api.inventario.movimiento;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventario/movimientos")
@RequiredArgsConstructor
public class MovimientoInventarioController {

    private final RegistrarEntradaInventarioUseCase registrarEntradaInventarioUseCase;
    private final RegistrarSalidaInventarioUseCase registrarSalidaInventarioUseCase;

    @PostMapping("/entrada")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovimientoInventarioResponse> entrada(@Valid @RequestBody RegistrarMovimientoInventarioRequest request) {
        return ResponseEntity.ok(registrarEntradaInventarioUseCase.ejecutar(request));
    }

    @PostMapping("/salida")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COCINA')")
    public ResponseEntity<MovimientoInventarioResponse> salida(@Valid @RequestBody RegistrarMovimientoInventarioRequest request) {
        return ResponseEntity.ok(registrarSalidaInventarioUseCase.ejecutar(request));
    }
}

