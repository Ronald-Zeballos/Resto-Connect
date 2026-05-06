package com.restoconnect.api.incidencia;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IncidenciaQueryService {

    private final IncidenciaRepository incidenciaRepository;

    public List<IncidenciaResponse> listarTodas() {
        return incidenciaRepository.findAllByOrderByFechaCreacionDesc().stream()
                .map(IncidenciaResponse::from)
                .toList();
    }

    public List<IncidenciaResponse> listarPendientes() {
        return incidenciaRepository.findByEstadoOrderByFechaCreacionDesc(EstadoIncidencia.ABIERTA).stream()
                .map(IncidenciaResponse::from)
                .toList();
    }
}

