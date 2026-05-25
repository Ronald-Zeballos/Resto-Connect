package com.restoconnect.api.caja;

import com.restoconnect.api.auth.Usuario;
import com.restoconnect.api.auth.UsuarioRepository;
import com.restoconnect.api.pago.EstadoPago;
import com.restoconnect.api.pago.MetodoPago;
import com.restoconnect.api.pago.Pago;
import com.restoconnect.api.pago.PagoRepository;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class CerrarCajaUseCase {

    private final CierreCajaRepository cierreCajaRepository;
    private final PagoRepository pagoRepository;
    private final CajaGastoRepository gastoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public CierreCajaResponse ejecutar(UUID cierreId, CierreCajaRequest request, Authentication auth) {
        var cierre = cierreCajaRepository.findById(cierreId)
                .orElseThrow(() -> new NotFoundException("Cierre de caja no encontrado."));

        if (cierre.getEstado() != EstadoCierreCaja.ABIERTO) {
            throw new BusinessException("La caja ya esta cerrada.");
        }

        Usuario usuario = usuarioRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado."));

        OffsetDateTime apertura = cierre.getFechaApertura();
        OffsetDateTime ahora = OffsetDateTime.now(ZoneOffset.UTC);

        List<Pago> pagosDelTurno = pagoRepository.findByFechaPagoBetween(apertura, ahora);

        Map<String, BigDecimal> pagosPorMetodo = pagosDelTurno.stream()
                .filter(p -> p.getEstado() == EstadoPago.PAGADO)
                .collect(Collectors.groupingBy(
                        p -> p.getMetodo().name(),
                        Collectors.reducing(BigDecimal.ZERO, Pago::getMonto, BigDecimal::add)
                ));

        BigDecimal totalVentas = pagosPorMetodo.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalImpuesto = BigDecimal.ZERO;
        BigDecimal totalPropinas = BigDecimal.ZERO;
        BigDecimal totalGastos = gastoRepository.findByCierreCajaIdOrderByFechaCreacionAsc(cierreId).stream()
                .map(CajaGasto::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldoEsperado = cierre.getSaldoInicial()
                .add(totalVentas)
                .subtract(totalGastos);
        BigDecimal saldoReal = request.saldoRealDeclarado() != null ? request.saldoRealDeclarado() : BigDecimal.ZERO;
        BigDecimal diferencia = saldoReal.subtract(saldoEsperado);

        String detallePagosJson;
        try {
            detallePagosJson = objectMapper.writeValueAsString(pagosPorMetodo);
        } catch (JsonProcessingException e) {
            detallePagosJson = "{}";
        }

        cierre.setFechaCierre(ahora);
        cierre.setEstado(EstadoCierreCaja.CERRADO);
        cierre.setUsuarioCierre(usuario);
        cierre.setSaldoEsperado(saldoEsperado);
        cierre.setSaldoRealDeclarado(saldoReal);
        cierre.setDiferencia(diferencia);
        cierre.setObservaciones(request.observaciones());
        cierre.setDetallePagos(detallePagosJson);
        cierre.setTotalPedidos(pagosDelTurno.size());
        cierre.setTotalVentas(totalVentas);
        cierre.setTotalImpuesto(totalImpuesto);
        cierre.setTotalPropinas(totalPropinas);
        cierre.setTotalDescuentos(BigDecimal.ZERO);
        cierre.setTotalGastos(totalGastos);

        return CierreCajaResponse.from(cierreCajaRepository.save(cierre));
    }
}
