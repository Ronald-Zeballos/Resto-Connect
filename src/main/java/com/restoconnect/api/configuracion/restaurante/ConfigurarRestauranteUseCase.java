package com.restoconnect.api.configuracion.restaurante;

import com.restoconnect.api.pago.qr.PaguiProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ConfigurarRestauranteUseCase {

    private final ConfiguracionRestauranteRepository configuracionRestauranteRepository;
    private final PaguiProperties paguiProperties;
    private static final String DEFAULT_GROK_MODEL = "grok-4.20-reasoning";
    private static final String DEFAULT_GROK_PROMPT = "Eres un analista de operaciones para restaurantes. Resume hallazgos, riesgos y acciones concretas.";

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
        configuracion.setPagosQrHabilitado(Boolean.TRUE.equals(request.pagosQrHabilitado()));
        configuracion.setProveedorQr(request.proveedorQr());
        configuracion.setPaguiBaseUrl(request.paguiBaseUrl());
        configuracion.setPaguiEmail(request.paguiEmail());
        configuracion.setPaguiPassword(request.paguiPassword());
        configuracion.setPaguiBankId(request.paguiBankId());
        configuracion.setQrCuentaTitular(normalizeNullable(request.qrCuentaTitular()));
        configuracion.setQrCuentaBanco(normalizeNullable(request.qrCuentaBanco()));
        configuracion.setQrCuentaNumero(normalizeNullable(request.qrCuentaNumero()));
        configuracion.setQrCuentaTipo(normalizeNullable(request.qrCuentaTipo()));
        configuracion.setQrComercioCodigo(normalizeNullable(request.qrComercioCodigo()));
        configuracion.setGrokApiKey(null);
        configuracion.setGrokModelo(firstNonBlank(request.grokModelo(), DEFAULT_GROK_MODEL));
        configuracion.setGrokSystemPrompt(firstNonBlank(request.grokSystemPrompt(), DEFAULT_GROK_PROMPT));
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
        configuracion.setPagosQrHabilitado(paguiProperties.isEnabled());
        configuracion.setProveedorQr("PAGUI");
        configuracion.setPaguiBaseUrl(paguiProperties.getBaseUrl());
        configuracion.setPaguiEmail(paguiProperties.getEmail());
        configuracion.setPaguiPassword(paguiProperties.getPassword());
        configuracion.setPaguiBankId(paguiProperties.getBankId());
        configuracion.setGrokModelo(DEFAULT_GROK_MODEL);
        configuracion.setGrokSystemPrompt(DEFAULT_GROK_PROMPT);
        return configuracionRestauranteRepository.save(configuracion);
    }

    private String normalizeNullable(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String firstNonBlank(String primary, String fallback) {
        return StringUtils.hasText(primary) ? primary.trim() : fallback;
    }
}
