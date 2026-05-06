package com.restoconnect.api.shared.notification;

import com.restoconnect.api.shared.security.UserPrincipal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationService.NotificacionResponse>> listar(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(notificationService.listarPorRol(principal.getUsuario().getRol())
                .stream()
                .map(NotificationService.NotificacionResponse::from)
                .toList());
    }

    @PatchMapping("/{id}/leer")
    public ResponseEntity<NotificationService.NotificacionResponse> marcarLeida(@PathVariable UUID id) {
        return ResponseEntity.ok(NotificationService.NotificacionResponse.from(notificationService.marcarLeida(id)));
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal UserPrincipal principal) {
        return notificationService.suscribir(principal.getUsuario().getRol());
    }
}
