package com.restoconnect.api.inventario.item;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ItemInventarioResponse(
        UUID id,
        String nombre,
        String descripcion,
        UnidadMedida unidadMedida,
        BigDecimal stockActual,
        BigDecimal stockMinimo,
        BigDecimal stockMaximo,
        BigDecimal puntoReorden,
        BigDecimal costoUnitario,
        BigDecimal costoPromedioPonderado,
        UUID proveedorPreferidoId,
        String proveedorPreferidoNombre,
        UUID categoriaId,
        String categoriaNombre,
        Integer tiempoEntregaProveedorDias,
        boolean activo,
        ClasificacionAbc clasificacionAbc,
        LocalDate fechaUltimaCompra,
        String estadoStock
) {
    public static ItemInventarioResponse from(ItemInventario item) {
        String estado = item.getStockActual().compareTo(BigDecimal.ZERO) <= 0 ? "AGOTADO"
                : item.getStockActual().compareTo(item.getStockMinimo()) <= 0 ? "BAJO_STOCK"
                : item.getStockActual().compareTo(item.getStockMaximo()) > 0 ? "SOBRESTOCK"
                : item.getStockActual().compareTo(item.getPuntoReorden()) <= 0 ? "CRITICO"
                : "DISPONIBLE";

        return new ItemInventarioResponse(
                item.getId(),
                item.getNombre(),
                item.getDescripcion(),
                item.getUnidadMedida(),
                item.getStockActual(),
                item.getStockMinimo(),
                item.getStockMaximo(),
                item.getPuntoReorden(),
                item.getCostoUnitario(),
                item.getCostoPromedioPonderado(),
                item.getProveedorPreferido() != null ? item.getProveedorPreferido().getId() : null,
                item.getProveedorPreferido() != null ? item.getProveedorPreferido().getNombre() : null,
                item.getCategoria() != null ? item.getCategoria().getId() : null,
                item.getCategoria() != null ? item.getCategoria().getNombre() : null,
                item.getTiempoEntregaProveedorDias(),
                item.isActivo(),
                item.getClasificacionAbc(),
                item.getFechaUltimaCompra(),
                estado
        );
    }
}

