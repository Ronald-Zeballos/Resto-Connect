package com.restoconnect.api.incidencia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RegistrarIncidenciaRequest(
        @NotBlank(message = "El titulo es obligatorio.") String titulo,
        @NotBlank(message = "La descripcion es obligatoria.") String descripcion,
        @NotNull(message = "La categoria es obligatoria.") CategoriaIncidencia categoria,
        @NotNull(message = "La prioridad es obligatoria.") PrioridadIncidencia prioridad,
        UUID mesaId,
        UUID pedidoId
) {
}

