package com.restoconnect.api.personal;

import com.restoconnect.api.auth.RolUsuario;
import com.restoconnect.api.auth.Usuario;
import com.restoconnect.api.auth.UsuarioRepository;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/personal")
@RequiredArgsConstructor
public class PersonalController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('GERENTE')")
    public ResponseEntity<List<PersonalResponse>> listar() {
        return ResponseEntity.ok(
            usuarioRepository.findAllByOrderByNombreAsc().stream()
                .map(PersonalResponse::from)
                .toList()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PersonalResponse> crear(@Valid @RequestBody PersonalRequest request) {
        if (usuarioRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new BusinessException("El nombre de usuario ya existe.");
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre());
        usuario.setUsername(request.username().toLowerCase());
        usuario.setPasswordHash(passwordEncoder.encode(request.password()));
        usuario.setRol(request.rol());
        usuario.setActivo(true);
        return ResponseEntity.ok(PersonalResponse.from(usuarioRepository.save(usuario)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PersonalResponse> actualizar(@PathVariable UUID id, @Valid @RequestBody PersonalRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado."));
        usuario.setNombre(request.nombre());
        usuario.setUsername(request.username().toLowerCase());
        if (request.password() != null && !request.password().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        usuario.setRol(request.rol());
        return ResponseEntity.ok(PersonalResponse.from(usuarioRepository.save(usuario)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desactivar(@PathVariable UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado."));
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
        return ResponseEntity.noContent().build();
    }
}
