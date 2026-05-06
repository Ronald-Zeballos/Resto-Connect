package com.restoconnect.api.compras.proveedor;

import com.restoconnect.api.shared.exception.BusinessException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    @Transactional
    public ProveedorResponse crear(CrearProveedorRequest request) {
        proveedorRepository.findByNit(request.nit()).ifPresent(existing -> {
            throw new BusinessException("Ya existe un proveedor con ese NIT.");
        });

        Proveedor proveedor = new Proveedor();
        proveedor.setNombre(request.nombre());
        proveedor.setNit(request.nit());
        proveedor.setTelefono(request.telefono());
        proveedor.setEmail(request.email());
        proveedor.setDireccion(request.direccion());
        proveedor.setActivo(true);
        return ProveedorResponse.from(proveedorRepository.save(proveedor));
    }

    public List<ProveedorResponse> listar() {
        return proveedorRepository.findByActivoTrueOrderByNombreAsc().stream().map(ProveedorResponse::from).toList();
    }
}

