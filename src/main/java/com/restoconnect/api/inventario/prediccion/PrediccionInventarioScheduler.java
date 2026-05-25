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

    @Scheduled(cron = "0 0 6 * * *")
    public void ejecutarProgramada() {
        var parametros = configurarParametrosInventarioUseCase.obtenerActual();
        if (parametros.isActivarPrediccionAutomatica()) {
            generarPrediccionReposicionUseCase.ejecutarTodas();
        }
    }
}

