package com.restoconnect.api.incidencia;

import java.time.OffsetDateTime;
import java.util.UUID;

public record IncidenciaResponse(
        UUID id,
        String titulo,
        String descripcion,
        CategoriaIncidencia categoria,
        PrioridadIncidencia prioridad,
        EstadoIncidencia estado,
        UUID mesaId,
        Integer mesaNumero,
        UUID pedidoId,
        UUID reportadoPorId,
        String reportadoPorNombre,
        String comentarioResolucion,
        OffsetDateTime fechaResolucion,
        OffsetDateTime fechaCreacion
) {
    public static IncidenciaResponse from(Incidencia incidencia) {
        return new IncidenciaResponse(
                incidencia.getId(),
                incidencia.getTitulo(),
                incidencia.getDescripcion(),
                incidencia.getCategoria(),
                incidencia.getPrioridad(),
                incidencia.getEstado(),
                incidencia.getMesa() != null ? incidencia.getMesa().getId() : null,
                incidencia.getMesa() != null ? incidencia.getMesa().getNumero() : null,
                incidencia.getPedido() != null ? incidencia.getPedido().getId() : null,
                incidencia.getReportadoPor().getId(),
                incidencia.getReportadoPor().getNombre(),
                incidencia.getComentarioResolucion(),
                incidencia.getFechaResolucion(),
                incidencia.getFechaCreacion()
        );
    }
}

