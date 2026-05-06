package com.restoconnect.api.incidencia;

import jakarta.validation.constraints.NotNull;

public record ActualizarEstadoIncidenciaRequest(
        @NotNull(message = "El estado es obligatorio.") EstadoIncidencia estado,
        String comentarioResolucion
) {
}

