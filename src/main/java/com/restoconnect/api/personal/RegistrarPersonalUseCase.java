package com.restoconnect.api.personal;

import com.restoconnect.api.auth.Usuario;
import com.restoconnect.api.auth.UsuarioRepository;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistrarPersonalUseCase {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioPersonalResponse crear(CrearUsuarioPersonalRequest request) {
        String usernameNormalizado = request.username().trim();
        if (usuarioRepository.existsByUsernameIgnoreCase(usernameNormalizado)) {
            throw new BusinessException("Ya existe un usuario con ese username.");
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre());
        usuario.setUsername(usernameNormalizado);
        usuario.setPasswordHash(passwordEncoder.encode(request.password()));
        usuario.setRol(request.rol());
        usuario.setActivo(true);
        return UsuarioPersonalResponse.from(usuarioRepository.save(usuario));
    }

    public List<UsuarioPersonalResponse> listar() {
        return usuarioRepository.findAllByOrderByNombreAsc().stream()
                .map(UsuarioPersonalResponse::from)
                .toList();
    }

    @Transactional
    public UsuarioPersonalResponse activar(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado."));
        usuario.setActivo(true);
        return UsuarioPersonalResponse.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioPersonalResponse desactivar(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado."));
        usuario.setActivo(false);
        return UsuarioPersonalResponse.from(usuarioRepository.save(usuario));
    }
}
