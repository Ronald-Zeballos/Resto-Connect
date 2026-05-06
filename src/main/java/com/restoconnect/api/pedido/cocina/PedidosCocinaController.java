package com.restoconnect.api.pedido.cocina;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pedidos/cocina")
@RequiredArgsConstructor
public class PedidosCocinaController {

    private final ConsultarPedidosCocinaUseCase consultarPedidosCocinaUseCase;

    @GetMapping("/pendientes")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COCINA') or hasRole('MESERO')")
    public ResponseEntity<List<ConsultarPedidosCocinaUseCase.PedidoCocinaResponse>> pendientes() {
        return ResponseEntity.ok(consultarPedidosCocinaUseCase.ejecutar());
    }
}
