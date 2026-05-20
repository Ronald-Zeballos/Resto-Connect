package com.restoconnect.api.auth;

import com.restoconnect.api.mesa.EstadoMesa;
import com.restoconnect.api.mesa.Mesa;
import com.restoconnect.api.mesa.MesaRepository;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final MesaRepository mesaRepository;
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

    public LoginResponse loginClienteQr(String codigoQr) {
        Mesa mesa = mesaRepository.findByCodigoQr(codigoQr)
                .orElseThrow(() -> new BusinessException("El codigo QR no corresponde a una mesa valida."));

        if (mesa.getEstado() == EstadoMesa.BLOQUEADA || mesa.getEstado() == EstadoMesa.INACTIVA) {
            throw new BusinessException("La mesa no esta disponible para pedidos por QR.");
        }

        String username = "clienteqr_" + mesa.getId().toString().replace("-", "");
        Usuario usuario = usuarioRepository.findByUsername(username)
                .map(existing -> {
                    existing.setActivo(true);
                    existing.setRol(RolUsuario.CLIENTE_QR);
                    existing.setNombre("Cliente Mesa " + mesa.getNumero());
                    return usuarioRepository.save(existing);
                })
                .orElseGet(() -> {
                    Usuario nuevo = new Usuario();
                    nuevo.setUsername(username);
                    nuevo.setNombre("Cliente Mesa " + mesa.getNumero());
                    nuevo.setRol(RolUsuario.CLIENTE_QR);
                    nuevo.setActivo(true);
                    nuevo.setPasswordHash(passwordEncoder.encode("qr-access-" + mesa.getId()));
                    return usuarioRepository.save(nuevo);
                });

        return new LoginResponse(
                jwtService.generateToken(usuario),
                usuario.getUsername(),
                usuario.getRol(),
                usuario.getNombre()
        );
    }
}
