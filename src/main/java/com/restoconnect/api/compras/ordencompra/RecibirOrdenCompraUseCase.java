package com.restoconnect.api.compras.ordencompra;

import com.restoconnect.api.inventario.movimiento.RegistrarEntradaInventarioUseCase;
import com.restoconnect.api.inventario.movimiento.RegistrarMovimientoInventarioRequest;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import java.time.LocalDate;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecibirOrdenCompraUseCase {

    private final OrdenCompraRepository ordenCompraRepository;
    private final RegistrarEntradaInventarioUseCase registrarEntradaInventarioUseCase;

    @Transactional
    public OrdenCompraResponse ejecutar(UUID id) {
        OrdenCompra ordenCompra = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Orden de compra no encontrada."));
        if (ordenCompra.getEstado() == EstadoOrdenCompra.RECIBIDA) {
            throw new BusinessException("La orden ya fue recibida.");
        }
        for (OrdenCompraDetalle detalle : ordenCompra.getDetalles()) {
            registrarEntradaInventarioUseCase.ejecutar(new RegistrarMovimientoInventarioRequest(
                    detalle.getItemInventario().getId(),
                    detalle.getCantidad(),
                    "Recepcion de orden de compra",
                    "OC-" + ordenCompra.getId()
            ));
        }
        ordenCompra.setEstado(EstadoOrdenCompra.RECIBIDA);
        ordenCompra.setFechaRecepcion(LocalDate.now());
        return OrdenCompraResponse.from(ordenCompraRepository.save(ordenCompra));
    }
}
