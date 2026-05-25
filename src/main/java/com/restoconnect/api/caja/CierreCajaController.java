package com.restoconnect.api.caja;

import com.restoconnect.api.shared.pdf.PdfService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/caja/cierres")
@RequiredArgsConstructor
public class CierreCajaController {

    private final CierreCajaRepository cierreCajaRepository;
    private final CajaGastoRepository gastoRepository;
    private final AbrirCajaUseCase abrirCajaUseCase;
    private final CerrarCajaUseCase cerrarCajaUseCase;
    private final PdfService pdfService;
    private final ObjectMapper objectMapper;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CierreCajaResponse>> listar() {
        return ResponseEntity.ok(
                cierreCajaRepository.findAllByOrderByFechaAperturaDesc().stream()
                        .map(CierreCajaResponse::from).toList()
        );
    }

    @GetMapping("/abierto")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<CierreCajaResponse> obtenerAbierto() {
        return cierreCajaRepository.findTopByEstadoOrderByFechaAperturaDesc(EstadoCierreCaja.ABIERTO)
                .map(cierre -> ResponseEntity.ok(CierreCajaResponse.from(cierre)))
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/abrir")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CierreCajaResponse> abrir(
            @Valid @RequestBody CierreCajaRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(abrirCajaUseCase.ejecutar(request, auth));
    }

    @PostMapping("/{id}/cerrar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CierreCajaResponse> cerrar(
            @PathVariable UUID id,
            @Valid @RequestBody CierreCajaRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(cerrarCajaUseCase.ejecutar(id, request, auth));
    }

    @PostMapping("/{cierreId}/gastos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CajaGastoResponse> registrarGasto(
            @PathVariable UUID cierreId,
            @Valid @RequestBody CajaGastoRequest request
    ) {
        var cierre = cierreCajaRepository.findById(cierreId)
                .orElseThrow(() -> new RuntimeException("Cierre no encontrado."));
        var gasto = new CajaGasto();
        gasto.setCierreCaja(cierre);
        gasto.setDescripcion(request.descripcion());
        gasto.setCategoriaGasto(request.categoriaGasto());
        gasto.setMonto(request.monto());
        gasto.setMetodoPago(request.metodoPago() != null ? request.metodoPago() : "EFECTIVO");
        gasto.setComprobante(request.comprobante());
        return ResponseEntity.ok(CajaGastoResponse.from(gastoRepository.save(gasto)));
    }

    @GetMapping("/{cierreId}/gastos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CajaGastoResponse>> listarGastos(@PathVariable UUID cierreId) {
        return ResponseEntity.ok(
                gastoRepository.findByCierreCajaIdOrderByFechaCreacionAsc(cierreId).stream()
                        .map(CajaGastoResponse::from).toList()
        );
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR')")
    public ResponseEntity<byte[]> descargarPdf(@PathVariable UUID id) {
        var cierre = cierreCajaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cierre no encontrado."));

        Map<String, BigDecimal> pagosPorMetodo = new HashMap<>();
        try {
            if (cierre.getDetallePagos() != null && !cierre.getDetallePagos().isBlank()) {
                pagosPorMetodo = objectMapper.readValue(
                        cierre.getDetallePagos(),
                        new TypeReference<Map<String, BigDecimal>>() {}
                );
            }
        } catch (Exception ignored) {}

        byte[] pdf = pdfService.generarCierreCaja(
                "RestoConnect",
                cierre.getFechaApertura() != null ? cierre.getFechaApertura().toLocalDateTime() : null,
                cierre.getFechaCierre() != null ? cierre.getFechaCierre().toLocalDateTime() : null,
                cierre.getUsuarioApertura().getNombre(),
                cierre.getUsuarioCierre() != null ? cierre.getUsuarioCierre().getNombre() : null,
                cierre.getSaldoInicial(),
                pagosPorMetodo,
                cierre.getTotalVentas(),
                cierre.getTotalGastos(),
                cierre.getSaldoEsperado(),
                cierre.getSaldoRealDeclarado(),
                cierre.getDiferencia(),
                cierre.getObservaciones()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cierre-caja-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
