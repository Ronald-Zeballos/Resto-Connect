package com.restoconnect.api.incidencia;

import com.restoconnect.api.auth.RolUsuario;
import com.restoconnect.api.auth.Usuario;
import com.restoconnect.api.auth.UsuarioRepository;
import com.restoconnect.api.mesa.MesaRepository;
import com.restoconnect.api.pedido.PedidoRepository;
import com.restoconnect.api.shared.exception.NotFoundException;
import com.restoconnect.api.shared.notification.NotificationService;
import com.restoconnect.api.shared.notification.SeveridadNotificacion;
import com.restoconnect.api.shared.notification.TipoNotificacion;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistrarIncidenciaUseCase {

    private final IncidenciaRepository incidenciaRepository;
    private final MesaRepository mesaRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificationService notificationService;

    @Transactional
    public IncidenciaResponse ejecutar(RegistrarIncidenciaRequest request, UUID reportadoPorId) {
        Usuario reportadoPor = usuarioRepository.findById(reportadoPorId)
                .orElseThrow(() -> new NotFoundException("Usuario reportante no encontrado."));

        Incidencia incidencia = new Incidencia();
        incidencia.setTitulo(request.titulo());
        incidencia.setDescripcion(request.descripcion());
        incidencia.setCategoria(request.categoria());
        incidencia.setPrioridad(request.prioridad());
        incidencia.setEstado(EstadoIncidencia.ABIERTA);
        incidencia.setReportadoPor(reportadoPor);
        if (request.mesaId() != null) {
            incidencia.setMesa(mesaRepository.findById(request.mesaId())
                    .orElseThrow(() -> new NotFoundException("Mesa no encontrada.")));
        }
        if (request.pedidoId() != null) {
            incidencia.setPedido(pedidoRepository.findById(request.pedidoId())
                    .orElseThrow(() -> new NotFoundException("Pedido no encontrado.")));
        }

        Incidencia persisted = incidenciaRepository.save(incidencia);
        emitirNotificaciones(persisted);
        return IncidenciaResponse.from(persisted);
    }

    private void emitirNotificaciones(Incidencia incidencia) {
        SeveridadNotificacion severidad = switch (incidencia.getPrioridad()) {
            case BAJA -> SeveridadNotificacion.INFO;
            case MEDIA -> SeveridadNotificacion.MEDIA;
            case ALTA -> SeveridadNotificacion.ALTA;
            case CRITICA -> SeveridadNotificacion.CRITICA;
        };

        String mensaje = "Se registro la incidencia '" + incidencia.getTitulo() + "' con prioridad " + incidencia.getPrioridad().name() + ".";
        notificationService.emitir(
                TipoNotificacion.INCIDENCIA_REGISTRADA,
                "Incidencia registrada",
                mensaje,
                severidad,
                RolUsuario.ADMIN,
                "Incidencia",
                incidencia.getId()
        );

        if (incidencia.getCategoria() == CategoriaIncidencia.COCINA) {
            notificationService.emitir(
                    TipoNotificacion.INCIDENCIA_REGISTRADA,
                    "Incidencia para cocina",
                    mensaje,
                    severidad,
                    RolUsuario.COCINA,
                    "Incidencia",
                    incidencia.getId()
            );
        }
    }
}

