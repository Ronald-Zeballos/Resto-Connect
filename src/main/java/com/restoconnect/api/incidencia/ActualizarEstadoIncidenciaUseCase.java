package com.restoconnect.api.incidencia;

import com.restoconnect.api.shared.exception.NotFoundException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActualizarEstadoIncidenciaUseCase {

    private final IncidenciaRepository incidenciaRepository;

    @Transactional
    public IncidenciaResponse ejecutar(UUID incidenciaId, ActualizarEstadoIncidenciaRequest request) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new NotFoundException("Incidencia no encontrada."));
        incidencia.setEstado(request.estado());
        incidencia.setComentarioResolucion(request.comentarioResolucion());
        if (request.estado() == EstadoIncidencia.RESUELTA || request.estado() == EstadoIncidencia.CERRADA) {
            incidencia.setFechaResolucion(OffsetDateTime.now(ZoneOffset.UTC));
        } else {
            incidencia.setFechaResolucion(null);
        }
        return IncidenciaResponse.from(incidenciaRepository.save(incidencia));
    }
}

