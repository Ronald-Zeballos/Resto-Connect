package com.restoconnect.api.reportes;

import com.restoconnect.api.reportes.inventario.CompararConsumoRealVsPrediccionUseCase;
import com.restoconnect.api.reportes.inventario.ConsumoInventarioPorPeriodoUseCase;
import com.restoconnect.api.reportes.ventas.ProductosMasVendidosUseCase;
import com.restoconnect.api.reportes.ventas.VentasPorMeseroUseCase;
import com.restoconnect.api.reportes.ventas.VentasPorMetodoPagoUseCase;
import com.restoconnect.api.reportes.ventas.VentasPorRangoUseCase;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReportesController {

    private final VentasPorRangoUseCase ventasPorRangoUseCase;
    private final ProductosMasVendidosUseCase productosMasVendidosUseCase;
    private final VentasPorMetodoPagoUseCase ventasPorMetodoPagoUseCase;
    private final VentasPorMeseroUseCase ventasPorMeseroUseCase;
    private final ConsumoInventarioPorPeriodoUseCase consumoInventarioPorPeriodoUseCase;
    private final CompararConsumoRealVsPrediccionUseCase compararConsumoRealVsPrediccionUseCase;

    @GetMapping("/ventas/rango")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<VentasPorRangoUseCase.VentasPorRangoResponse> ventasPorRango(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        return ResponseEntity.ok(ventasPorRangoUseCase.ejecutar(desde, hasta));
    }

    @GetMapping("/ventas/productos")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<List<ProductosMasVendidosUseCase.ProductoVendidoResponse>> productosMasVendidos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        return ResponseEntity.ok(productosMasVendidosUseCase.ejecutar(desde, hasta));
    }

    @GetMapping("/ventas/metodos")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<List<VentasPorMetodoPagoUseCase.VentaMetodoPagoResponse>> ventasPorMetodo(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        return ResponseEntity.ok(ventasPorMetodoPagoUseCase.ejecutar(desde, hasta));
    }

    @GetMapping("/ventas/meseros")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VentasPorMeseroUseCase.VentaPorMeseroResponse>> ventasPorMesero(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        return ResponseEntity.ok(ventasPorMeseroUseCase.ejecutar(desde, hasta));
    }

    @GetMapping("/inventario/consumo")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<List<ConsumoInventarioPorPeriodoUseCase.ConsumoInventarioResponse>> consumoInventario(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        return ResponseEntity.ok(consumoInventarioPorPeriodoUseCase.ejecutar(desde, hasta));
    }

    @GetMapping("/inventario/consumo-vs-prediccion")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CompararConsumoRealVsPrediccionUseCase.ComparacionConsumoResponse>> consumoVsPrediccion(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        return ResponseEntity.ok(compararConsumoRealVsPrediccionUseCase.ejecutar(desde, hasta));
    }
}
