package com.restoconnect.api.compras.ordencompra;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OrdenCompraResponse(
        UUID id,
        UUID proveedorId,
        String proveedorNombre,
        EstadoOrdenCompra estado,
        BigDecimal costoEstimado,
        LocalDate fechaRecepcion,
        String estadoPago,
        LocalDate fechaPago,
        UUID usuarioRecibeId,
        String usuarioRecibeNombre,
        String notas,
        List<DetalleOrdenCompraResponse> detalles
) {
    public static OrdenCompraResponse from(OrdenCompra ordenCompra) {
        return new OrdenCompraResponse(
                ordenCompra.getId(),
                ordenCompra.getProveedor().getId(),
                ordenCompra.getProveedor().getNombre(),
                ordenCompra.getEstado(),
                ordenCompra.getCostoEstimado(),
                ordenCompra.getFechaRecepcion(),
                ordenCompra.getEstadoPago(),
                ordenCompra.getFechaPago(),
                ordenCompra.getUsuarioRecibe() != null ? ordenCompra.getUsuarioRecibe().getId() : null,
                ordenCompra.getUsuarioRecibe() != null ? ordenCompra.getUsuarioRecibe().getNombre() : null,
                ordenCompra.getNotas(),
                ordenCompra.getDetalles().stream()
                        .map(detalle -> new DetalleOrdenCompraResponse(
                                detalle.getItemInventario().getId(),
                                detalle.getItemInventario().getNombre(),
                                detalle.getCantidad(),
                                detalle.getCostoUnitario(),
                                detalle.getSubtotal()
                        ))
                        .toList()
        );
    }

    public record DetalleOrdenCompraResponse(
            UUID itemInventarioId,
            String itemNombre,
            BigDecimal cantidad,
            BigDecimal costoUnitario,
            BigDecimal subtotal
    ) {
    }
}

