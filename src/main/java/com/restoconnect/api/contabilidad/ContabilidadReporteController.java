package com.restoconnect.api.contabilidad;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contabilidad/reportes")
@RequiredArgsConstructor
public class ContabilidadReporteController {

    private final ContabilidadGastoRepository gastoRepository;
    private final ContabilidadIngresoRepository ingresoRepository;
    private final CuentaPagarRepository cuentaPagarRepository;
    private final CuentaCobrarRepository cuentaCobrarRepository;

    @GetMapping("/estado-resultados")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR')")
    public ResponseEntity<Map<String, Object>> estadoResultados(
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta
    ) {
        LocalDate inicio = desde != null ? desde : LocalDate.now().withDayOfMonth(1);
        LocalDate fin = hasta != null ? hasta : LocalDate.now();

        BigDecimal ingresos = ingresoRepository
                .findByFechaIngresoBetweenOrderByFechaIngresoDesc(inicio, fin)
                .stream().map(ContabilidadIngreso::getMonto).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal gastos = gastoRepository
                .findByFechaGastoBetweenOrderByFechaGastoDesc(inicio, fin)
                .stream().map(ContabilidadGasto::getMonto).reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(Map.of(
                "periodo", Map.of("desde", inicio, "hasta", fin),
                "ingresos", ingresos,
                "gastos", gastos,
                "resultado", ingresos.subtract(gastos)
        ));
    }

    @GetMapping("/cuentas-vencidas")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR')")
    public ResponseEntity<Map<String, Object>> cuentasVencidas() {
        LocalDate hoy = LocalDate.now();
        return ResponseEntity.ok(Map.of(
                "cuentasPagarVencidas",
                cuentaPagarRepository.findByFechaVencimientoBeforeAndEstado(hoy, "PENDIENTE")
                        .stream().map(CuentaPagarResponse::from).toList(),
                "cuentasCobrarVencidas",
                cuentaCobrarRepository.findByFechaVencimientoBeforeAndEstado(hoy, "PENDIENTE")
                        .stream().map(CuentaCobrarResponse::from).toList()
        ));
    }
}
