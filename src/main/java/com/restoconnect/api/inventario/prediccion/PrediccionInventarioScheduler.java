package com.restoconnect.api.inventario.prediccion;

import com.restoconnect.api.inventario.parametros.ConfigurarParametrosInventarioUseCase;
import java.time.LocalTime;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PrediccionInventarioScheduler {

    private final ConfigurarParametrosInventarioUseCase configurarParametrosInventarioUseCase;
    private final GenerarPrediccionReposicionUseCase generarPrediccionReposicionUseCase;

    @Scheduled(cron = "0 0 * * * *")
    public void ejecutarProgramada() {
        var parametros = configurarParametrosInventarioUseCase.obtenerActual();
        LocalTime ahora = LocalTime.now().withMinute(0).withSecond(0).withNano(0);
        if (parametros.isActivarPrediccionAutomatica() && parametros.getHoraEjecucionPrediccionDiaria().equals(ahora)) {
            generarPrediccionReposicionUseCase.ejecutarTodas();
        }
    }
}

