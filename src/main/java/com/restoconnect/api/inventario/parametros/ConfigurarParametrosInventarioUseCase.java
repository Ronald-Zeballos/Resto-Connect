package com.restoconnect.api.inventario.parametros;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConfigurarParametrosInventarioUseCase {

    private final ParametroInventarioRepository parametroInventarioRepository;

    public ParametroInventario obtenerActual() {
        return parametroInventarioRepository.findTopByOrderByFechaCreacionAsc().orElseGet(this::crearDefaults);
    }

    @Transactional
    public ParametrosInventarioResponse configurar(ParametrosInventarioRequest request) {
        ParametroInventario parametro = obtenerActual();
        parametro.setDiasAnalisisConsumo(request.diasAnalisisConsumo());
        parametro.setDiasCoberturaDeseada(request.diasCoberturaDeseada());
        parametro.setPorcentajeMargenSeguridad(request.porcentajeMargenSeguridad());
        parametro.setActivarPrediccionAutomatica(request.activarPrediccionAutomatica());
        parametro.setActivarAlertasEmail(request.activarAlertasEmail());
        parametro.setActivarAlertasWebSocket(request.activarAlertasWebSocket());
        parametro.setHoraEjecucionPrediccionDiaria(request.horaEjecucionPrediccionDiaria());
        parametro.setStockMinimoGlobalOpcional(request.stockMinimoGlobalOpcional());
        parametro.setMetodoPrediccion(request.metodoPrediccion());
        return ParametrosInventarioResponse.from(parametroInventarioRepository.save(parametro));
    }

    private ParametroInventario crearDefaults() {
        return parametroInventarioRepository.save(new ParametroInventario());
    }
}

