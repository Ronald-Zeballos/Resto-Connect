package com.restoconnect.api.facturacion;

import com.restoconnect.api.shared.exception.NotFoundException;
import com.restoconnect.api.shared.pdf.PdfService;
import com.restoconnect.api.configuracion.restaurante.ConfiguracionRestaurante;
import com.restoconnect.api.configuracion.restaurante.ConfiguracionRestauranteRepository;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
public class FacturacionController {

    private final GenerarFacturaUseCase generarFacturaUseCase;
    private final FacturaRepository facturaRepository;
    private final PdfService pdfService;
    private final ConfiguracionRestauranteRepository configuracionRepository;

    @PostMapping("/generar/{pedidoId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<FacturaResponse> generar(
            @PathVariable UUID pedidoId,
            @Valid @RequestBody DatosFacturacionRequest request
    ) {
        return ResponseEntity.ok(generarFacturaUseCase.generar(pedidoId, request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MESERO')")
    public ResponseEntity<FacturaResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(facturaRepository.findById(id)
                .map(FacturaResponse::from)
                .orElseThrow(() -> new NotFoundException("Factura no encontrada.")));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE') or hasRole('CONTADOR') or hasRole('CAJERO') or hasRole('MESERO')")
    public ResponseEntity<byte[]> descargarPdf(@PathVariable UUID id) {
        Factura factura = facturaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Factura no encontrada."));

        var config = configuracionRepository.findTopByOrderByFechaCreacionAsc()
                .orElse(null);
        String nombreResto = config != null ? config.getNombreComercial() : "RestoConnect";
        String nit = config != null ? config.getNit() : "S/N";
        String direccion = config != null ? config.getDireccion() : "";

        var detalles = factura.getPedido().getDetalles();
        String[][] detalle = new String[detalles.size() + 1][4];
        int i = 0;
        for (var d : detalles) {
            detalle[i][0] = d.getProducto() != null ? d.getProducto().getNombre() : "Producto";
            detalle[i][1] = d.getCantidad().toString();
            detalle[i][2] = "Bs " + (d.getPrecioUnitario() != null ? String.format("%.2f", d.getPrecioUnitario()) : "0.00");
            detalle[i][3] = "Bs " + (d.getSubtotal() != null ? String.format("%.2f", d.getSubtotal()) : "0.00");
            i++;
        }
        detalle[i] = new String[]{"", "", "TOTAL", "Bs " + String.format("%.2f", factura.getTotal())};

        byte[] pdf = pdfService.generarFactura(
                nombreResto, nit, direccion,
                factura.getNumeroFactura(),
                factura.getRazonSocial(),
                factura.getNitCi(),
                factura.getFechaEmision(),
                factura.getTotal(),
                detalle
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=factura-" + factura.getNumeroFactura() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}

