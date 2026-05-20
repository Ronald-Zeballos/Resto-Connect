package com.restoconnect.api.mesa;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mesas")
@RequiredArgsConstructor
public class MesaController {

    private final MesaService mesaService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<MesaResponse> crear(@Valid @RequestBody CrearMesaRequest request) {
        return ResponseEntity.ok(mesaService.crear(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<List<MesaResponse>> listar() {
        return ResponseEntity.ok(mesaService.listar());
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<MesaResponse> cambiarEstado(@PathVariable UUID id, @Valid @RequestBody CambiarEstadoMesaRequest request) {
        return ResponseEntity.ok(mesaService.cambiarEstado(id, request));
    }

    @GetMapping("/{id}/qr")
    public ResponseEntity<QrMesaResponse> obtenerQr(@PathVariable UUID id) {
        return ResponseEntity.ok(mesaService.obtenerQr(id));
    }

    @GetMapping("/qr/{codigoQr}")
    public ResponseEntity<MesaResponse> obtenerPorCodigoQr(@PathVariable String codigoQr) {
        return ResponseEntity.ok(mesaService.obtenerPorCodigoQr(codigoQr));
    }
}
