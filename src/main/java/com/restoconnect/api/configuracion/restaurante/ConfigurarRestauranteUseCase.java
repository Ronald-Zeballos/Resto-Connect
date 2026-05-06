package com.restoconnect.api.configuracion.restaurante;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConfigurarRestauranteUseCase {

    private final ConfiguracionRestauranteRepository configuracionRestauranteRepository;

    public ConfiguracionRestaurante obtenerActual() {
        return configuracionRestauranteRepository.findTopByOrderByFechaCreacionAsc()
                .orElseGet(this::crearPorDefecto);
    }

    @Transactional
    public ConfiguracionRestauranteResponse actualizar(ConfiguracionRestauranteRequest request) {
        ConfiguracionRestaurante configuracion = obtenerActual();
        configuracion.setNombreComercial(request.nombreComercial());
        configuracion.setRazonSocial(request.razonSocial());
        configuracion.setNit(request.nit());
        configuracion.setTelefono(request.telefono());
        configuracion.setDireccion(request.direccion());
        configuracion.setEmail(request.email());
        configuracion.setMoneda(request.moneda());
        configuracion.setPorcentajeImpuesto(request.porcentajeImpuesto());
        return ConfiguracionRestauranteResponse.from(configuracionRestauranteRepository.save(configuracion));
    }

    private ConfiguracionRestaurante crearPorDefecto() {
        ConfiguracionRestaurante configuracion = new ConfiguracionRestaurante();
        configuracion.setNombreComercial("RestoConnect Pro");
        configuracion.setRazonSocial("RestoConnect Pro SRL");
        configuracion.setNit("000000001");
        configuracion.setTelefono("70000000");
        configuracion.setDireccion("Direccion por configurar");
        configuracion.setEmail("admin@restoconnect.local");
        configuracion.setMoneda("BOB");
        configuracion.setPorcentajeImpuesto(java.math.BigDecimal.valueOf(13));
        return configuracionRestauranteRepository.save(configuracion);
    }
}

