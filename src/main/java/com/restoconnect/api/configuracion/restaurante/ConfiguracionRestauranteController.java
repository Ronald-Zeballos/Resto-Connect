package com.restoconnect.api.configuracion.restaurante;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.restoconnect.api.pago.qr.PaguiBankCatalogService;

@RestController
@RequestMapping("/api/configuracion/restaurante")
@RequiredArgsConstructor
public class ConfiguracionRestauranteController {

    private final ConfigurarRestauranteUseCase configurarRestauranteUseCase;
    private final PaguiBankCatalogService paguiBankCatalogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracionRestauranteResponse> obtener() {
        return ResponseEntity.ok(ConfiguracionRestauranteResponse.from(configurarRestauranteUseCase.obtenerActual()));
    }

    @GetMapping("/pagos-qr/bancos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaguiBankCatalogService.BankOptionResponse>> listarBancosQr() {
        return ResponseEntity.ok(paguiBankCatalogService.listarBancosDisponibles());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracionRestauranteResponse> actualizar(
            @Valid @RequestBody ConfiguracionRestauranteRequest request
    ) {
        return ResponseEntity.ok(configurarRestauranteUseCase.actualizar(request));
    }
}
