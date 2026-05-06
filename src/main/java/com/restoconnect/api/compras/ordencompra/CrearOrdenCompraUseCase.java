package com.restoconnect.api.compras.ordencompra;

import com.restoconnect.api.compras.proveedor.Proveedor;
import com.restoconnect.api.compras.proveedor.ProveedorRepository;
import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.inventario.item.ItemInventarioRepository;
import com.restoconnect.api.shared.domain.MoneyUtils;
import com.restoconnect.api.shared.exception.NotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CrearOrdenCompraUseCase {

    private final OrdenCompraRepository ordenCompraRepository;
    private final ProveedorRepository proveedorRepository;
    private final ItemInventarioRepository itemInventarioRepository;

    @Transactional
    public OrdenCompraResponse ejecutar(CrearOrdenCompraRequest request) {
        Proveedor proveedor = proveedorRepository.findById(request.proveedorId())
                .orElseThrow(() -> new NotFoundException("Proveedor no encontrado."));

        OrdenCompra ordenCompra = new OrdenCompra();
        ordenCompra.setProveedor(proveedor);
        ordenCompra.setEstado(request.estado() == null ? EstadoOrdenCompra.BORRADOR : request.estado());
        ordenCompra.setCostoEstimado(BigDecimal.ZERO);

        BigDecimal total = BigDecimal.ZERO;
        for (DetalleOrdenCompraRequest detalleRequest : request.detalles()) {
            ItemInventario item = itemInventarioRepository.findById(detalleRequest.itemInventarioId())
                    .orElseThrow(() -> new NotFoundException("Item no encontrado."));
            OrdenCompraDetalle detalle = new OrdenCompraDetalle();
            detalle.setOrdenCompra(ordenCompra);
            detalle.setItemInventario(item);
            detalle.setCantidad(detalleRequest.cantidad());
            detalle.setCostoUnitario(detalleRequest.costoUnitario());
            detalle.setSubtotal(MoneyUtils.scale(detalleRequest.cantidad().multiply(detalleRequest.costoUnitario())));
            ordenCompra.getDetalles().add(detalle);
            total = total.add(detalle.getSubtotal());
        }

        ordenCompra.setCostoEstimado(MoneyUtils.scale(total));
        return OrdenCompraResponse.from(ordenCompraRepository.save(ordenCompra));
    }

    public record CrearOrdenCompraRequest(
            @NotNull UUID proveedorId,
            EstadoOrdenCompra estado,
            @NotEmpty List<@Valid DetalleOrdenCompraRequest> detalles
    ) {
    }

    public record DetalleOrdenCompraRequest(
            @NotNull UUID itemInventarioId,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal cantidad,
            @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal costoUnitario
    ) {
    }
}

