package com.restoconnect.api.shared.notification;

import com.restoconnect.api.auth.RolUsuario;
import com.restoconnect.api.shared.exception.NotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificacionRepository notificacionRepository;
    private final Map<RolUsuario, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public Notificacion emitir(
            TipoNotificacion tipo,
            String titulo,
            String mensaje,
            SeveridadNotificacion severidad,
            RolUsuario rolDestino,
            String entidadRelacionada,
            UUID entidadId
    ) {
        Notificacion notificacion = new Notificacion();
        notificacion.setTipo(tipo);
        notificacion.setTitulo(titulo);
        notificacion.setMensaje(mensaje);
        notificacion.setSeveridad(severidad);
        notificacion.setRolDestino(rolDestino);
        notificacion.setLeida(false);
        notificacion.setEntidadRelacionada(entidadRelacionada);
        notificacion.setEntidadId(entidadId);
        Notificacion persisted = notificacionRepository.save(notificacion);
        enviarTiempoReal(persisted);
        return persisted;
    }

    public List<Notificacion> listarPorRol(RolUsuario rolUsuario) {
        return notificacionRepository.findByRolDestinoOrderByFechaCreacionDesc(rolUsuario);
    }

    public Notificacion marcarLeida(UUID id) {
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notificacion no encontrada."));
        notificacion.setLeida(true);
        return notificacionRepository.save(notificacion);
    }

    public SseEmitter suscribir(RolUsuario rolUsuario) {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.computeIfAbsent(rolUsuario, key -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> remover(rolUsuario, emitter));
        emitter.onTimeout(() -> remover(rolUsuario, emitter));
        try {
            emitter.send(SseEmitter.event().name("connected").data("Suscripcion activa para " + rolUsuario.name()));
        } catch (IOException ex) {
            remover(rolUsuario, emitter);
        }
        return emitter;
    }

    private void enviarTiempoReal(Notificacion notificacion) {
        List<SseEmitter> roleEmitters = emitters.getOrDefault(notificacion.getRolDestino(), new CopyOnWriteArrayList<>());
        for (SseEmitter emitter : roleEmitters) {
            try {
                emitter.send(SseEmitter.event().name("notificacion").data(NotificacionResponse.from(notificacion)));
            } catch (IOException ex) {
                remover(notificacion.getRolDestino(), emitter);
            }
        }
    }

    private void remover(RolUsuario rolUsuario, SseEmitter emitter) {
        emitters.getOrDefault(rolUsuario, new CopyOnWriteArrayList<>()).remove(emitter);
    }

    public record NotificacionResponse(
            UUID id,
            TipoNotificacion tipo,
            String titulo,
            String mensaje,
            SeveridadNotificacion severidad,
            RolUsuario rolDestino,
            boolean leida,
            String entidadRelacionada,
            UUID entidadId
    ) {
        static NotificacionResponse from(Notificacion notificacion) {
            return new NotificacionResponse(
                    notificacion.getId(),
                    notificacion.getTipo(),
                    notificacion.getTitulo(),
                    notificacion.getMensaje(),
                    notificacion.getSeveridad(),
                    notificacion.getRolDestino(),
                    notificacion.isLeida(),
                    notificacion.getEntidadRelacionada(),
                    notificacion.getEntidadId()
            );
        }
    }
}

