package com.restoconnect.api.inventario.alerta;

import com.restoconnect.api.shared.exception.NotFoundException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MarcarAlertaAtendidaUseCase {

    private final AlertaInventarioRepository alertaInventarioRepository;

    @Transactional
    public AlertaInventarioResponse ejecutar(UUID id) {
        AlertaInventario alerta = alertaInventarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Alerta no encontrada."));
        alerta.setAtendida(true);
        return AlertaInventarioResponse.from(alertaInventarioRepository.save(alerta));
    }
}

