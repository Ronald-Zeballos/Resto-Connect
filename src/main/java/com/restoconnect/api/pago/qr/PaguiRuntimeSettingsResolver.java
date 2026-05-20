package com.restoconnect.api.pago.qr;

import com.restoconnect.api.configuracion.restaurante.ConfiguracionRestaurante;
import com.restoconnect.api.configuracion.restaurante.ConfiguracionRestauranteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class PaguiRuntimeSettingsResolver {

    private final PaguiProperties properties;
    private final ConfiguracionRestauranteRepository configuracionRestauranteRepository;

    public PaguiRuntimeSettings resolve() {
        ConfiguracionRestaurante config = configuracionRestauranteRepository.findTopByOrderByFechaCreacionAsc().orElse(null);

        boolean enabled = config != null ? config.isPagosQrHabilitado() : properties.isEnabled();
        String provider = firstNonBlank(config != null ? config.getProveedorQr() : null, "PAGUI");
        String baseUrl = firstNonBlank(config != null ? config.getPaguiBaseUrl() : null, properties.getBaseUrl());
        String email = firstNonBlank(config != null ? config.getPaguiEmail() : null, properties.getEmail());
        String password = firstNonBlank(config != null ? config.getPaguiPassword() : null, properties.getPassword());
        Integer bankId = config != null && config.getPaguiBankId() != null ? config.getPaguiBankId() : properties.getBankId();

        return new PaguiRuntimeSettings(
                enabled,
                provider,
                baseUrl,
                email,
                password,
                bankId != null ? bankId : 1
        );
    }

    private String firstNonBlank(String primary, String fallback) {
        return StringUtils.hasText(primary) ? primary.trim() : fallback;
    }

    public record PaguiRuntimeSettings(
            boolean enabled,
            String provider,
            String baseUrl,
            String email,
            String password,
            int bankId
    ) {
    }
}
