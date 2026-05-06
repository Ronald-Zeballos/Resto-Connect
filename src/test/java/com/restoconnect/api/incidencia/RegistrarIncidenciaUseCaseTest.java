package com.restoconnect.api.incidencia;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.restoconnect.api.auth.RolUsuario;
import com.restoconnect.api.auth.Usuario;
import com.restoconnect.api.auth.UsuarioRepository;
import com.restoconnect.api.mesa.MesaRepository;
import com.restoconnect.api.pedido.PedidoRepository;
import com.restoconnect.api.shared.notification.NotificationService;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RegistrarIncidenciaUseCaseTest {

    @Mock
    private IncidenciaRepository incidenciaRepository;
    @Mock
    private MesaRepository mesaRepository;
    @Mock
    private PedidoRepository pedidoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private NotificationService notificationService;

    @Test
    void registraIncidenciaYNotificaAdminYCocinaCuandoCorresponde() {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setNombre("Mesero");
        usuario.setRol(RolUsuario.MESERO);

        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        when(incidenciaRepository.save(any(Incidencia.class))).thenAnswer(invocation -> {
            Incidencia incidencia = invocation.getArgument(0);
            incidencia.setId(UUID.randomUUID());
            return incidencia;
        });

        RegistrarIncidenciaUseCase useCase = new RegistrarIncidenciaUseCase(
                incidenciaRepository,
                mesaRepository,
                pedidoRepository,
                usuarioRepository,
                notificationService
        );

        IncidenciaResponse response = useCase.ejecutar(
                new RegistrarIncidenciaRequest(
                        "Demora en cocina",
                        "El pedido esta tardando mas de lo esperado.",
                        CategoriaIncidencia.COCINA,
                        PrioridadIncidencia.ALTA,
                        null,
                        null
                ),
                usuario.getId()
        );

        assertEquals(EstadoIncidencia.ABIERTA, response.estado());
        verify(notificationService, times(2)).emitir(any(), any(), any(), any(), any(), any(), any());
    }
}

