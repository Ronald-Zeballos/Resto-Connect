package com.restoconnect.api.reportes;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record RangoFechasReporte(
        LocalDate desdeFecha,
        LocalDate hastaFecha,
        OffsetDateTime desde,
        OffsetDateTime hasta,
        long dias
) {
}

