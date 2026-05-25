package com.restoconnect.api.clientes;

import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional
    public ClienteResponse crear(ClienteRequest request) {
        Cliente cliente = new Cliente();
        cliente.setNombre(request.nombre());
        cliente.setNitCi(request.nitCi());
        cliente.setTelefono(request.telefono());
        cliente.setEmail(request.email());
        cliente.setDireccion(request.direccion());
        cliente.setTipoDocumento(request.tipoDocumento() != null ? request.tipoDocumento() : "CI");
        cliente.setActivo(true);
        return ClienteResponse.from(clienteRepository.save(cliente));
    }

    public List<ClienteResponse> listar() {
        return clienteRepository.findByActivoTrueOrderByNombreAsc().stream()
                .map(ClienteResponse::from).toList();
    }

    @Transactional
    public ClienteResponse actualizar(UUID id, ClienteRequest request) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado."));
        cliente.setNombre(request.nombre());
        cliente.setNitCi(request.nitCi());
        cliente.setTelefono(request.telefono());
        cliente.setEmail(request.email());
        cliente.setDireccion(request.direccion());
        cliente.setTipoDocumento(request.tipoDocumento() != null ? request.tipoDocumento() : "CI");
        return ClienteResponse.from(clienteRepository.save(cliente));
    }

    @Transactional
    public void desactivar(UUID id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado."));
        cliente.setActivo(false);
        clienteRepository.save(cliente);
    }

    public ClienteResponse buscarPorId(UUID id) {
        return clienteRepository.findById(id)
                .map(ClienteResponse::from)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado."));
    }
}
