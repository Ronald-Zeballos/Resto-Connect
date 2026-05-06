package com.restoconnect.api.menu.categoria;

import com.restoconnect.api.shared.exception.BusinessException;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoriaProductoService {

    private final CategoriaProductoRepository categoriaProductoRepository;

    @Transactional
    public CategoriaProductoResponse crear(CategoriaProductoRequest request) {
        categoriaProductoRepository.findByNombreIgnoreCase(request.nombre()).ifPresent(existing -> {
            throw new BusinessException("Ya existe una categoria con ese nombre.");
        });
        CategoriaProducto categoria = new CategoriaProducto();
        categoria.setNombre(request.nombre());
        categoria.setDescripcion(request.descripcion());
        return CategoriaProductoResponse.from(categoriaProductoRepository.save(categoria));
    }

    public List<CategoriaProductoResponse> listar() {
        return categoriaProductoRepository.findByActivoTrueOrderByNombreAsc().stream()
                .map(CategoriaProductoResponse::from)
                .toList();
    }

    public record CategoriaProductoRequest(
            @NotBlank(message = "El nombre es obligatorio.") String nombre,
            @NotBlank(message = "La descripcion es obligatoria.") String descripcion
    ) {
    }
}

