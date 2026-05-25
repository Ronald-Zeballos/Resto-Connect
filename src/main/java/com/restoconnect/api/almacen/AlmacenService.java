package com.restoconnect.api.almacen;

import com.restoconnect.api.shared.exception.NotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlmacenService {

    private final AlmacenRepository almacenRepository;

    @Transactional
    public AlmacenResponse crear(AlmacenRequest request) {
        Almacen almacen = new Almacen();
        almacen.setNombre(request.nombre());
        almacen.setUbicacion(request.ubicacion());
        almacen.setActivo(true);
        return AlmacenResponse.from(almacenRepository.save(almacen));
    }

    public List<AlmacenResponse> listar() {
        return almacenRepository.findByActivoTrueOrderByNombreAsc().stream()
                .map(AlmacenResponse::from).toList();
    }

    @Transactional
    public AlmacenResponse actualizar(UUID id, AlmacenRequest request) {
        Almacen almacen = almacenRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Almacen no encontrado."));
        almacen.setNombre(request.nombre());
        almacen.setUbicacion(request.ubicacion());
        return AlmacenResponse.from(almacenRepository.save(almacen));
    }

    @Transactional
    public void desactivar(UUID id) {
        Almacen almacen = almacenRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Almacen no encontrado."));
        almacen.setActivo(false);
        almacenRepository.save(almacen);
    }
}
