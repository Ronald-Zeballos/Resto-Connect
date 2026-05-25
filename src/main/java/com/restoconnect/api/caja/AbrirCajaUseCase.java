package com.restoconnect.api.caja;

import com.restoconnect.api.auth.Usuario;
import com.restoconnect.api.auth.UsuarioRepository;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.exception.NotFoundException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AbrirCajaUseCase {

    private final CierreCajaRepository cierreCajaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public CierreCajaResponse ejecutar(CierreCajaRequest request, Authentication auth) {
        var abierto = cierreCajaRepository.findTopByEstadoOrderByFechaAperturaDesc(EstadoCierreCaja.ABIERTO);
        if (abierto.isPresent()) {
            throw new BusinessException("Ya hay una caja abierta. Ciérrala antes de abrir una nueva.");
        }

        Usuario usuario = usuarioRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado."));

        var cierre = new CierreCaja();
        cierre.setFechaApertura(OffsetDateTime.now(ZoneOffset.UTC));
        cierre.setEstado(EstadoCierreCaja.ABIERTO);
        cierre.setUsuarioApertura(usuario);
        cierre.setSaldoInicial(request.saldoInicial() != null ? request.saldoInicial() : BigDecimal.ZERO);

        return CierreCajaResponse.from(cierreCajaRepository.save(cierre));
    }
}
