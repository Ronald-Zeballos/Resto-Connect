package com.restoconnect.api.mesa;

import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MesaService {

    private final MesaRepository mesaRepository;

    @Transactional
    public MesaResponse crear(CrearMesaRequest request) {
        mesaRepository.findByNumero(request.numero()).ifPresent(mesa -> {
            throw new BusinessException("Ya existe una mesa con ese numero.");
        });
        Mesa mesa = new Mesa();
        mesa.setNumero(request.numero());
        mesa.setEstado(request.estado() == null ? EstadoMesa.LIBRE : request.estado());
        mesa = mesaRepository.save(mesa);
        mesa.setCodigoQr("mesa-" + mesa.getNumero() + "-" + mesa.getId());
        return MesaResponse.from(mesaRepository.save(mesa));
    }

    public List<MesaResponse> listar() {
        return mesaRepository.findAllByOrderByNumeroAsc().stream().map(MesaResponse::from).toList();
    }

    @Transactional
    public MesaResponse cambiarEstado(UUID id, CambiarEstadoMesaRequest request) {
        Mesa mesa = mesaRepository.findById(id).orElseThrow(() -> new NotFoundException("Mesa no encontrada."));
        mesa.setEstado(request.estado());
        return MesaResponse.from(mesaRepository.save(mesa));
    }

    public QrMesaResponse obtenerQr(UUID id) {
        Mesa mesa = mesaRepository.findById(id).orElseThrow(() -> new NotFoundException("Mesa no encontrada."));
        return new QrMesaResponse(mesa.getId(), mesa.getNumero(), mesa.getCodigoQr());
    }

    public Mesa obtenerActiva(UUID id) {
        Mesa mesa = mesaRepository.findById(id).orElseThrow(() -> new NotFoundException("Mesa no encontrada."));
        if (mesa.getEstado() == EstadoMesa.BLOQUEADA || mesa.getEstado() == EstadoMesa.INACTIVA) {
            throw new BusinessException("La mesa no esta disponible para tomar pedidos.");
        }
        return mesa;
    }
}

