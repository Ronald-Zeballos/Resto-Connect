# RestoConnect API

Backend empresarial para `RestoConnect Pro` construido con `Java 21`, `Spring Boot 3`, `Maven`, `PostgreSQL`, `Spring Data JPA`, `Flyway`, `Spring Security + JWT` y notificaciones en tiempo real por `Server-Sent Events`.

## Arquitectura

La base del proyecto esta organizada por paquetes funcionales y casos de uso dentro de:

`src/main/java/com/restoconnect/api`

Paquetes principales:

- `auth`: login y usuarios.
- `mesa`: gestion de mesas y QR.
- `menu.categoria` y `menu.producto`: catalogo, productos y recetas.
- `pedido`: crear, validar, consultar, cambiar estado y cancelar pedidos.
- `pago`: cobro en efectivo y pasarela simulada.
- `facturacion`: generacion de factura.
- `inventario.item`, `inventario.movimiento`, `inventario.stock`, `inventario.alerta`, `inventario.parametros`, `inventario.prediccion`.
- `compras.proveedor` y `compras.ordencompra`.
- `personal`: gestion basica de usuarios operativos.
- `incidencia`: registro y seguimiento operativo.
- `reportes`: ventas, pagos, meseros e inventario.
- `configuracion.restaurante`: parametros operativos del restaurante.
- `shared`: base entity, excepciones, seguridad, notificaciones y configuracion.

La logica importante vive en casos de uso concretos como:

- `CrearPedidoUseCase`
- `ValidarPedidoUseCase`
- `RegistrarSalidaInventarioUseCase`
- `GenerarPrediccionReposicionUseCase`
- `RegistrarPagoEfectivoUseCase`
- `GenerarOrdenCompraDesdePrediccionUseCase`

## Reglas de negocio implementadas

- No se puede crear pedido en mesa bloqueada o inactiva.
- Un pedido validado descuenta insumos reales segun la receta del producto.
- No se permite stock negativo.
- Cuando baja el stock se generan alertas persistidas y notificaciones SSE.
- La prediccion usa parametros configurables y promedio movil/reglas.
- Desde una prediccion se puede generar una orden de compra sugerida.
- El pago en efectivo puede quedar pendiente o confirmarse por mesero.
- La factura se genera solo cuando el pedido esta pagado.

## Seguridad y roles

Roles soportados:

- `ADMIN`
- `MESERO`
- `COCINA`
- `CLIENTE_QR`

Login:

- `POST /api/auth/login`

Usuarios seed:

- `admin / admin123`
- `mesero / mesero123`
- `cocina / cocina123`

## Ejecutar con Docker Compose

```bash
docker compose up --build
```

Servicios:

- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`
- PostgreSQL: `localhost:5432`

Variables importantes:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_JWT_SECRET`
- `APP_JWT_EXPIRATION_MINUTES`

## Endpoints principales

### Auth

- `POST /api/auth/login`

### Mesas

- `POST /api/mesas`
- `GET /api/mesas`
- `PATCH /api/mesas/{id}/estado`
- `GET /api/mesas/{id}/qr`

### Menu

- `GET /api/menu/categorias`
- `POST /api/menu/categorias`
- `GET /api/menu/productos`
- `POST /api/menu/productos`
- `PATCH /api/menu/productos/{id}/activar`
- `PATCH /api/menu/productos/{id}/desactivar`

### Pedidos

- `POST /api/pedidos`
- `GET /api/pedidos/{id}`
- `GET /api/pedidos/mesa/{mesaId}/activo`
- `GET /api/pedidos/pendientes`
- `GET /api/pedidos/cocina/pendientes`
- `PATCH /api/pedidos/{id}/validar`
- `PATCH /api/pedidos/{id}/estado`
- `PATCH /api/pedidos/{id}/cancelar`

### Pagos y facturacion

- `POST /api/pagos/efectivo`
- `POST /api/pagos/pasarela/simular`
- `GET /api/pagos/pendiente-efectivo`
- `POST /api/facturas/generar/{pedidoId}`
- `GET /api/facturas/{id}`

### Inventario

- `POST /api/inventario/items`
- `GET /api/inventario/items`
- `GET /api/inventario/items/{id}`
- `PATCH /api/inventario/items/{id}`
- `POST /api/inventario/movimientos/entrada`
- `POST /api/inventario/movimientos/salida`
- `GET /api/inventario/stock`
- `GET /api/inventario/stock/bajo`
- `GET /api/inventario/stock/critico`
- `GET /api/inventario/stock/agotado`
- `GET /api/inventario/parametros`
- `PUT /api/inventario/parametros`
- `POST /api/inventario/prediccion/generar`
- `GET /api/inventario/prediccion`
- `GET /api/inventario/prediccion/item/{itemId}`
- `POST /api/inventario/prediccion/{id}/generar-orden-compra`
- `GET /api/inventario/alertas`
- `PATCH /api/inventario/alertas/{id}/atendida`

### Compras

- `POST /api/compras/proveedores`
- `GET /api/compras/proveedores`
- `POST /api/compras/ordenes`
- `GET /api/compras/ordenes`
- `PATCH /api/compras/ordenes/{id}/aprobar`
- `PATCH /api/compras/ordenes/{id}/recibir`

### Notificaciones

- `GET /api/notificaciones`
- `PATCH /api/notificaciones/{id}/leer`
- `GET /api/notificaciones/stream`

### Personal

- `GET /api/personal/usuarios`
- `POST /api/personal/usuarios`
- `PATCH /api/personal/usuarios/{id}/activar`
- `PATCH /api/personal/usuarios/{id}/desactivar`

### Incidencias

- `POST /api/incidencias`
- `GET /api/incidencias`
- `GET /api/incidencias/pendientes`
- `PATCH /api/incidencias/{id}/estado`

### Reportes

- `GET /api/reportes/ventas/rango`
- `GET /api/reportes/ventas/productos`
- `GET /api/reportes/ventas/metodos`
- `GET /api/reportes/ventas/meseros`
- `GET /api/reportes/inventario/consumo`
- `GET /api/reportes/inventario/consumo-vs-prediccion`

### Paneles operativos

- `GET /api/mesas/mapa`
- `GET /api/pedidos/cocina/pendientes`

### Configuracion

- `GET /api/configuracion/restaurante`
- `PUT /api/configuracion/restaurante`

## Prediccion de inventario

El motor local actual calcula:

- `consumoPromedioDiario`
- `diasHastaAgotamiento`
- `fechaEstimadaAgotamiento`
- `cantidadSugeridaCompra`
- `nivelRiesgo`
- `motivo`
- `confianza`

Formula base:

```text
consumoPromedioDiario = salidas / diasAnalisis
diasHastaAgotamiento = stockActual / consumoPromedioDiario
cantidadSugeridaCompra = (consumoPromedioDiario * (diasEntrega + diasCobertura)) * (1 + margen) - stockActual
```

Si no hay historial suficiente, el motor cae a reglas simples usando stock minimo.

## Ejemplos JSON

### Crear pedido

```json
{
  "mesaId": "00000000-0000-0000-0000-000000000201",
  "metodoPago": "EFECTIVO",
  "detalles": [
    {
      "productoId": "00000000-0000-0000-0000-000000000501",
      "cantidad": 2
    },
    {
      "productoId": "00000000-0000-0000-0000-000000000503",
      "cantidad": 1
    }
  ]
}
```

### Registrar entrada de inventario

```json
{
  "itemInventarioId": "00000000-0000-0000-0000-000000000405",
  "cantidad": 10,
  "motivo": "Recepcion manual",
  "referencia": "AJUSTE-001"
}
```

### Generar producto con receta

```json
{
  "nombre": "Hamburguesa premium",
  "descripcion": "Hamburguesa con doble queso",
  "precio": 25,
  "categoriaId": "00000000-0000-0000-0000-000000000301",
  "receta": [
    {
      "itemInventarioId": "00000000-0000-0000-0000-000000000401",
      "cantidadNecesaria": 1
    },
    {
      "itemInventarioId": "00000000-0000-0000-0000-000000000402",
      "cantidadNecesaria": 1
    }
  ]
}
```

## Estado actual

El proyecto ya tiene dos bloques fuertes montados:

- Sprint 1: flujo base del restaurante, inventario inteligente, compras, pagos y facturacion.
- Sprint 2: operacion y analitica con personal, incidencias, paneles y reportes.

La validacion de compilacion no pudo ejecutarse en este entorno porque no hay `Java`, `Maven` ni daemon de `Docker` activos localmente.
