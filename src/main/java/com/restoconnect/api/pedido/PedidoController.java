package com.restoconnect.api.pedido;

import com.restoconnect.api.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.restoconnect.api.pedido.cancelar.CancelarPedidoResponse;
import com.restoconnect.api.pedido.cancelar.CancelarPedidoUseCase;
import com.restoconnect.api.pedido.crear.CrearPedidoResponse;
import com.restoconnect.api.pedido.crear.CrearPedidoUseCase;
import com.restoconnect.api.pedido.estado.ActualizarEstadoPedidoUseCase;
import com.restoconnect.api.pedido.estado.EstadoPedidoResponse;
import com.restoconnect.api.pedido.validar.ValidarPedidoResponse;
import com.restoconnect.api.pedido.validar.ValidarPedidoUseCase;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final CrearPedidoUseCase crearPedidoUseCase;
    private final PedidoQueryService pedidoQueryService;
    private final ValidarPedidoUseCase validarPedidoUseCase;
    private final ActualizarEstadoPedidoUseCase actualizarEstadoPedidoUseCase;
    private final CancelarPedidoUseCase cancelarPedidoUseCase;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('CLIENTE_QR')")
    public ResponseEntity<CrearPedidoResponse> crear(@Valid @RequestBody CrearPedidoUseCase.CrearPedidoRequest request) {
        return ResponseEntity.ok(crearPedidoUseCase.ejecutar(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('COCINA') or hasRole('CLIENTE_QR')")
    public ResponseEntity<PedidoResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(pedidoQueryService.obtener(id));
    }

    @GetMapping("/mesa/{mesaId}/activo")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('CLIENTE_QR')")
    public ResponseEntity<PedidoResponse> activoMesa(@PathVariable UUID mesaId) {
        return ResponseEntity.ok(pedidoQueryService.obtenerActivoPorMesa(mesaId));
    }

    @GetMapping("/pendientes")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<List<PedidoResponse>> pendientes() {
        return ResponseEntity.ok(pedidoQueryService.pendientes());
    }

    @PatchMapping("/{id}/validar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<ValidarPedidoResponse> validar(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(validarPedidoUseCase.ejecutar(id, principal.getUsuario().getId()));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('COCINA')")
    public ResponseEntity<EstadoPedidoResponse> cambiarEstado(
            @PathVariable UUID id,
            @Valid @RequestBody ActualizarEstadoPedidoUseCase.CambiarEstadoPedidoRequest request
    ) {
        return ResponseEntity.ok(actualizarEstadoPedidoUseCase.ejecutar(id, request));
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO') or hasRole('CLIENTE_QR')")
    public ResponseEntity<CancelarPedidoResponse> cancelar(@PathVariable UUID id) {
        return ResponseEntity.ok(cancelarPedidoUseCase.ejecutar(id));
    }
}

