package com.restoconnect.api.auth;

import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(request.username())
                .filter(Usuario::isActivo)
                .orElseThrow(() -> new BusinessException("Credenciales invalidas."));

        if (!passwordEncoder.matches(request.password(), usuario.getPasswordHash())) {
            throw new BusinessException("Credenciales invalidas.");
        }

        return new LoginResponse(
                jwtService.generateToken(usuario),
                usuario.getUsername(),
                usuario.getRol(),
                usuario.getNombre()
        );
    }
}

