package com.restoconnect.api.mesa.panel;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mesas")
@RequiredArgsConstructor
public class MesaPanelController {

    private final ConsultarMapaMesasUseCase consultarMapaMesasUseCase;

    @GetMapping("/mapa")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<List<ConsultarMapaMesasUseCase.MapaMesaResponse>> mapa() {
        return ResponseEntity.ok(consultarMapaMesasUseCase.ejecutar());
    }
}

