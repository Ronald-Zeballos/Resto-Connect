package com.restoconnect.api.shared.pdf;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class PdfService {

    private static final Font TITLE = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(30, 50, 30));
    private static final Font SUBTITLE = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(60, 80, 60));
    private static final Font NORMAL = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);
    private static final Font BOLD = new Font(Font.HELVETICA, 10, Font.BOLD, Color.BLACK);
    private static final Font HEADER = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);

    public byte[] generarCierreCaja(
            String restaurante,
            LocalDateTime apertura,
            LocalDateTime cierre,
            String usuarioApertura,
            String usuarioCierre,
            BigDecimal saldoInicial,
            Map<String, BigDecimal> pagosPorMetodo,
            BigDecimal totalVentas,
            BigDecimal totalGastos,
            BigDecimal saldoEsperado,
            BigDecimal saldoDeclarado,
            BigDecimal diferencia,
            String observaciones
    ) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4);
        PdfWriter.getInstance(doc, out);
        doc.open();

        doc.add(new Paragraph("CIERRE DE CAJA", TITLE));
        doc.add(new Paragraph(restaurante, SUBTITLE));
        doc.add(new Paragraph("Emitido: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), NORMAL));
        doc.add(Chunk.NEWLINE);

        PdfPTable info = new PdfPTable(2);
        info.setWidthPercentage(100);
        info.addCell(celda("Apertura", apertura.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), false));
        info.addCell(celda("Cierre", cierre != null ? cierre.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "-", false));
        info.addCell(celda("Usuario apertura", usuarioApertura, false));
        info.addCell(celda("Usuario cierre", usuarioCierre != null ? usuarioCierre : "-", false));
        info.addCell(celda("Saldo inicial", "Bs " + format(saldoInicial), false));
        doc.add(info);
        doc.add(Chunk.NEWLINE);

        doc.add(new Paragraph("Ventas por metodo de pago", SUBTITLE));
        PdfPTable ventas = new PdfPTable(2);
        ventas.setWidthPercentage(100);
        encabezado(ventas, new String[]{"Metodo", "Monto"});
        for (Map.Entry<String, BigDecimal> entry : pagosPorMetodo.entrySet()) {
            ventas.addCell(celda(entry.getKey(), true));
            ventas.addCell(celda("Bs " + format(entry.getValue()), true));
        }
        ventas.addCell(celda("TOTAL VENTAS", false));
        ventas.addCell(celda("Bs " + format(totalVentas), false));
        doc.add(ventas);
        doc.add(Chunk.NEWLINE);

        PdfPTable resumen = new PdfPTable(2);
        resumen.setWidthPercentage(100);
        resumen.addCell(celda("Total gastos", false));
        resumen.addCell(celda("Bs " + format(totalGastos), false));
        resumen.addCell(celda("Saldo esperado", false));
        resumen.addCell(celda("Bs " + format(saldoEsperado), false));
        resumen.addCell(celda("Saldo declarado", false));
        resumen.addCell(celda("Bs " + format(saldoDeclarado), false));
        resumen.addCell(celda("Diferencia", false));
        resumen.addCell(celda("Bs " + format(diferencia), false));
        doc.add(resumen);

        if (observaciones != null && !observaciones.isBlank()) {
            doc.add(Chunk.NEWLINE);
            doc.add(new Paragraph("Observaciones: " + observaciones, NORMAL));
        }

        doc.close();
        return out.toByteArray();
    }

    public byte[] generarFactura(
            String restaurante,
            String nitRestaurante,
            String direccion,
            String numeroFactura,
            String razonSocial,
            String nitCi,
            LocalDate fecha,
            BigDecimal total,
            String[][] detalle
    ) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4);
        PdfWriter.getInstance(doc, out);
        doc.open();

        doc.add(new Paragraph("FACTURA", TITLE));
        doc.add(new Paragraph(restaurante, SUBTITLE));
        doc.add(new Paragraph("NIT: " + nitRestaurante, NORMAL));
        doc.add(new Paragraph("Direccion: " + direccion, NORMAL));
        doc.add(Chunk.NEWLINE);

        PdfPTable enc = new PdfPTable(2);
        enc.setWidthPercentage(100);
        enc.addCell(celda("Nro Factura", numeroFactura, false));
        enc.addCell(celda("Fecha", fecha.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), false));
        enc.addCell(celda("Cliente", razonSocial, false));
        enc.addCell(celda("NIT/CI", nitCi, false));
        doc.add(enc);
        doc.add(Chunk.NEWLINE);

        PdfPTable items = new PdfPTable(4);
        items.setWidthPercentage(100);
        items.setWidths(new float[]{3, 1, 1, 1});
        encabezado(items, new String[]{"Producto", "Cantidad", "P/U", "Subtotal"});
        for (String[] row : detalle) {
            items.addCell(celda(row[0], true));
            items.addCell(celda(row[1], true));
            items.addCell(celda(row[2], true));
            items.addCell(celda(row[3], true));
        }
        doc.add(items);
        doc.add(Chunk.NEWLINE);

        Paragraph totalP = new Paragraph("TOTAL: Bs " + format(total), new Font(Font.HELVETICA, 14, Font.BOLD, new Color(30, 50, 30)));
        totalP.setAlignment(Element.ALIGN_RIGHT);
        doc.add(totalP);

        doc.close();
        return out.toByteArray();
    }

    public byte[] generarReporteInventario(String restaurante, String[][] datos, String[] columnas) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(doc, out);
        doc.open();

        doc.add(new Paragraph("REPORTE DE INVENTARIO", TITLE));
        doc.add(new Paragraph(restaurante, SUBTITLE));
        doc.add(new Paragraph("Emitido: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), NORMAL));
        doc.add(Chunk.NEWLINE);

        PdfPTable table = new PdfPTable(columnas.length);
        table.setWidthPercentage(100);
        encabezado(table, columnas);
        for (String[] row : datos) {
            for (String cell : row) {
                table.addCell(celda(cell, true));
            }
        }
        doc.add(table);
        doc.close();
        return out.toByteArray();
    }

    private PdfPCell celda(String texto, boolean bordered) {
        PdfPCell cell = new PdfPCell(new Phrase(texto != null ? texto : "", NORMAL));
        if (!bordered) cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(4);
        return cell;
    }

    private PdfPCell celda(String label, String value, boolean bordered) {
        Phrase phrase = new Phrase();
        phrase.add(new Chunk(label + ": ", BOLD));
        phrase.add(new Chunk(value != null ? value : "", NORMAL));
        PdfPCell cell = new PdfPCell(phrase);
        if (!bordered) cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(4);
        return cell;
    }

    private void encabezado(PdfPTable table, String[] textos) {
        for (String texto : textos) {
            PdfPCell cell = new PdfPCell(new Phrase(texto, HEADER));
            cell.setBackgroundColor(new Color(47, 111, 78));
            cell.setPadding(5);
            table.addCell(cell);
        }
    }

    private String format(BigDecimal value) {
        return value != null ? String.format("%.2f", value) : "0.00";
    }
}
