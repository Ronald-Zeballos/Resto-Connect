package com.restoconnect.api.reportes;

import com.restoconnect.api.shared.exception.BusinessException;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;

public final class ReportesDateRangeSupport {

    private ReportesDateRangeSupport() {
    }

    public static RangoFechasReporte resolver(LocalDate desde, LocalDate hasta) {
        LocalDate fechaHasta = hasta == null ? LocalDate.now() : hasta;
        LocalDate fechaDesde = desde == null ? fechaHasta.minusDays(29) : desde;
        if (fechaHasta.isBefore(fechaDesde)) {
            throw new BusinessException("La fecha hasta no puede ser menor a la fecha desde.");
        }
        long dias = ChronoUnit.DAYS.between(fechaDesde, fechaHasta) + 1;
        if (dias > 366) {
            throw new BusinessException("El rango maximo permitido para reportes es de 366 dias.");
        }
        return new RangoFechasReporte(
                fechaDesde,
                fechaHasta,
                fechaDesde.atStartOfDay().atOffset(ZoneOffset.UTC),
                fechaHasta.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC).minusNanos(1),
                dias
        );
    }
}

