package com.restoconnect.api.configuracion.restaurante;

import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

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
        configuracion.setPagosQrHabilitado(Boolean.TRUE.equals(request.pagosQrHabilitado()));
        configuracion.setProveedorQr(request.proveedorQr());
        configuracion.setQrCuentaTitular(normalizeNullable(request.qrCuentaTitular()));
        configuracion.setQrCuentaBanco(normalizeNullable(request.qrCuentaBanco()));
        configuracion.setQrCuentaNumero(normalizeNullable(request.qrCuentaNumero()));
        configuracion.setQrCuentaTipo(normalizeNullable(request.qrCuentaTipo()));
        configuracion.setQrComercioCodigo(normalizeNullable(request.qrComercioCodigo()));

        configuracion.setPaginasPorCarta(valueOrDefault(request.paginasPorCarta(), 1));
        configuracion.setIdiomaDefecto(firstNonBlank(request.idiomaDefecto(), "es"));
        configuracion.setZonaHoraria(firstNonBlank(request.zonaHoraria(), "America/La_Paz"));
        configuracion.setFormatoFecha(firstNonBlank(request.formatoFecha(), "DD/MM/YYYY"));
        configuracion.setLogoUrl(normalizeNullable(request.logoUrl()));
        configuracion.setMensajePieFactura(normalizeNullable(request.mensajePieFactura()));
        configuracion.setTipoServicio(firstNonBlank(request.tipoServicio(), "MESA"));
        configuracion.setPropinaPorcentaje(request.propinaPorcentaje() != null ? request.propinaPorcentaje() : BigDecimal.ZERO);
        configuracion.setPropinaIncluida(Boolean.TRUE.equals(request.propinaIncluida()));
        configuracion.setInventarioValoracion(firstNonBlank(request.inventarioValoracion(), "PROMEDIO_PONDERADO"));
        configuracion.setControlarVencimientos(Boolean.TRUE.equals(request.controlarVencimientos()));
        configuracion.setControlarLotes(Boolean.TRUE.equals(request.controlarLotes()));

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
        configuracion.setPagosQrHabilitado(false);
        configuracion.setProveedorQr("LOCAL");
        return configuracionRestauranteRepository.save(configuracion);
    }

    private String normalizeNullable(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String firstNonBlank(String primary, String fallback) {
        return StringUtils.hasText(primary) ? primary.trim() : fallback;
    }

    private <T> T valueOrDefault(T value, T fallback) {
        return value != null ? value : fallback;
    }
}
