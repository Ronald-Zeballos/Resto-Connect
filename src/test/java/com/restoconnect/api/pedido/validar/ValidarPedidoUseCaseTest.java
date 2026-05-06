package com.restoconnect.api.pedido.validar;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.restoconnect.api.auth.RolUsuario;
import com.restoconnect.api.auth.Usuario;
import com.restoconnect.api.auth.UsuarioRepository;
import com.restoconnect.api.inventario.alerta.GenerarAlertasInventarioUseCase;
import com.restoconnect.api.inventario.item.ClasificacionAbc;
import com.restoconnect.api.inventario.item.ItemInventario;
import com.restoconnect.api.inventario.item.ItemInventarioRepository;
import com.restoconnect.api.inventario.item.UnidadMedida;
import com.restoconnect.api.inventario.movimiento.MovimientoInventario;
import com.restoconnect.api.inventario.movimiento.MovimientoInventarioRepository;
import com.restoconnect.api.inventario.movimiento.RegistrarSalidaInventarioUseCase;
import com.restoconnect.api.inventario.parametros.ConfigurarParametrosInventarioUseCase;
import com.restoconnect.api.inventario.parametros.ParametroInventario;
import com.restoconnect.api.inventario.prediccion.GenerarPrediccionReposicionUseCase;
import com.restoconnect.api.menu.producto.Producto;
import com.restoconnect.api.menu.producto.ProductoDisponibilidadService;
import com.restoconnect.api.menu.producto.RecetaProducto;
import com.restoconnect.api.menu.producto.RecetaProductoRepository;
import com.restoconnect.api.mesa.Mesa;
import com.restoconnect.api.pago.MetodoPago;
import com.restoconnect.api.pedido.EstadoPedido;
import com.restoconnect.api.pedido.Pedido;
import com.restoconnect.api.pedido.PedidoDetalle;
import com.restoconnect.api.pedido.PedidoRepository;
import com.restoconnect.api.shared.exception.BusinessException;
import com.restoconnect.api.shared.notification.NotificationService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ValidarPedidoUseCaseTest {

    @Mock
    private PedidoRepository pedidoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private ProductoDisponibilidadService productoDisponibilidadService;
    @Mock
    private RecetaProductoRepository recetaProductoRepository;
    @Mock
    private ItemInventarioRepository itemInventarioRepository;
    @Mock
    private MovimientoInventarioRepository movimientoInventarioRepository;
    @Mock
    private GenerarAlertasInventarioUseCase generarAlertasInventarioUseCase;
    @Mock
    private com.restoconnect.api.menu.producto.ProductoDisponibilidadService recalculoDisponibilidadService;
    @Mock
    private ConfigurarParametrosInventarioUseCase configurarParametrosInventarioUseCase;
    @Mock
    private GenerarPrediccionReposicionUseCase generarPrediccionReposicionUseCase;
    @Mock
    private NotificationService notificationService;

    private ValidarPedidoUseCase validarPedidoUseCase;

    @BeforeEach
    void setUp() {
        RegistrarSalidaInventarioUseCase registrarSalidaInventarioUseCase = new RegistrarSalidaInventarioUseCase(
                itemInventarioRepository,
                movimientoInventarioRepository,
                generarAlertasInventarioUseCase,
                recalculoDisponibilidadService,
                configurarParametrosInventarioUseCase,
                generarPrediccionReposicionUseCase
        );
        validarPedidoUseCase = new ValidarPedidoUseCase(
                pedidoRepository,
                usuarioRepository,
                productoDisponibilidadService,
                recetaProductoRepository,
                registrarSalidaInventarioUseCase,
                notificationService
        );
        ParametroInventario parametroInventario = new ParametroInventario();
        parametroInventario.setActivarPrediccionAutomatica(false);
        when(configurarParametrosInventarioUseCase.obtenerActual()).thenReturn(parametroInventario);
        when(itemInventarioRepository.save(any(ItemInventario.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(movimientoInventarioRepository.save(any(MovimientoInventario.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void descuentaInventarioCorrectamenteAlValidarPedido() {
        ItemInventario item = item("Pan", "10");
        Producto producto = producto("Hamburguesa");
        Pedido pedido = pedido(producto, 3);
        RecetaProducto receta = new RecetaProducto();
        receta.setProducto(producto);
        receta.setItemInventario(item);
        receta.setCantidadNecesaria(new BigDecimal("2"));

        Usuario mesero = new Usuario();
        mesero.setId(UUID.randomUUID());
        mesero.setNombre("Mesero");
        mesero.setRol(RolUsuario.MESERO);

        when(pedidoRepository.findById(pedido.getId())).thenReturn(Optional.of(pedido));
        when(usuarioRepository.findById(mesero.getId())).thenReturn(Optional.of(mesero));
        when(productoDisponibilidadService.puedePrepararse(producto, 3)).thenReturn(true);
        when(recetaProductoRepository.findByProductoId(producto.getId())).thenReturn(List.of(receta));

        ValidarPedidoResponse response = validarPedidoUseCase.ejecutar(pedido.getId(), mesero.getId());

        assertEquals(0, item.getStockActual().compareTo(new BigDecimal("4")));
        assertEquals(EstadoPedido.CONFIRMADO.name(), response.estado());
    }

    @Test
    void noPermiteValidarPedidoSiNoHayStockSuficiente() {
        Producto producto = producto("Hamburguesa");
        Pedido pedido = pedido(producto, 2);
        Usuario mesero = new Usuario();
        mesero.setId(UUID.randomUUID());

        when(pedidoRepository.findById(pedido.getId())).thenReturn(Optional.of(pedido));
        when(productoDisponibilidadService.puedePrepararse(producto, 2)).thenReturn(false);

        assertThrows(BusinessException.class, () -> validarPedidoUseCase.ejecutar(pedido.getId(), mesero.getId()));
    }

    private Pedido pedido(Producto producto, int cantidad) {
        Pedido pedido = new Pedido();
        pedido.setId(UUID.randomUUID());
        pedido.setEstado(EstadoPedido.PENDIENTE_VALIDACION);
        pedido.setMetodoPago(MetodoPago.EFECTIVO);
        pedido.setMesa(new Mesa());

        PedidoDetalle detalle = new PedidoDetalle();
        detalle.setPedido(pedido);
        detalle.setProducto(producto);
        detalle.setCantidad(cantidad);
        detalle.setPrecioUnitario(new BigDecimal("10.00"));
        detalle.setSubtotal(new BigDecimal("20.00"));
        pedido.getDetalles().add(detalle);
        return pedido;
    }

    private Producto producto(String nombre) {
        Producto producto = new Producto();
        producto.setId(UUID.randomUUID());
        producto.setNombre(nombre);
        producto.setActivo(true);
        producto.setDisponible(true);
        producto.setPrecio(new BigDecimal("10.00"));
        return producto;
    }

    private ItemInventario item(String nombre, String stock) {
        ItemInventario item = new ItemInventario();
        item.setId(UUID.randomUUID());
        item.setNombre(nombre);
        item.setUnidadMedida(UnidadMedida.UNIDAD);
        item.setClasificacionAbc(ClasificacionAbc.ALTA);
        item.setStockActual(new BigDecimal(stock));
        item.setStockMinimo(new BigDecimal("2"));
        item.setStockMaximo(new BigDecimal("20"));
        item.setPuntoReorden(new BigDecimal("5"));
        item.setCostoUnitario(new BigDecimal("1.00"));
        item.setTiempoEntregaProveedorDias(2);
        item.setActivo(true);
        return item;
    }
}
