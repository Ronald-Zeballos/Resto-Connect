package com.restoconnect.api.compras.ordencompra;

import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AprobarOrdenCompraUseCase {

    private final OrdenCompraRepository ordenCompraRepository;

    @Transactional
    public OrdenCompraResponse ejecutar(UUID id) {
        OrdenCompra ordenCompra = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Orden de compra no encontrada."));
        if (ordenCompra.getEstado() == EstadoOrdenCompra.RECIBIDA || ordenCompra.getEstado() == EstadoOrdenCompra.CANCELADA) {
            throw new BusinessException("La orden ya no puede aprobarse.");
        }
        ordenCompra.setEstado(EstadoOrdenCompra.APROBADA);
        return OrdenCompraResponse.from(ordenCompraRepository.save(ordenCompra));
    }
}
