# Prompt para Skill Frontend - RestoConnect Pro

Actua como una skill senior de frontend, diseño UI/UX y consumo de APIs. Debes crear un frontend completo, moderno y visualmente atractivo para el proyecto `RestoConnect Pro`, conectado al backend existente en Spring Boot.

## Contexto del proyecto

El repositorio actual contiene solo backend:

- Java 21
- Spring Boot 3.4
- Maven
- PostgreSQL
- Spring Security con JWT
- Server-Sent Events para notificaciones en tiempo real
- Swagger en `http://localhost:8080/swagger-ui.html`
- API base: `http://localhost:8080`

El sistema es una plataforma operativa para restaurantes. Debe sentirse como un producto SaaS profesional para administrar restaurante, mesas, cocina, pedidos, inventario, compras y reportes. No debe parecer una landing page ni una demo vacia.

## Objetivo

Genera una aplicacion frontend completa y hermosa para `RestoConnect Pro`, con datos visuales ya cargados, imagenes reales o assets generados, navegacion funcional, estados de carga, estados vacios, errores, autenticacion y pantallas listas para conectar al backend.

Si no existe frontend en el repo, crea uno nuevo en una carpeta `frontend`.

## Stack recomendado

Usa:

- React + TypeScript + Vite
- Tailwind CSS
- shadcn/ui o componentes propios bien pulidos
- lucide-react para iconos
- React Router
- TanStack Query para llamadas API
- Recharts para graficas
- Zustand o Context API para sesion/auth

No uses una landing page como primera pantalla. La primera experiencia despues del login debe ser un dashboard operativo real.

## Identidad visual

Diseña una interfaz premium, clara y gastronomica, sin caer en exceso de marron/naranja ni beige. Debe verse moderna, limpia y apetecible.

Direccion visual:

- Fondo principal claro con tonos neutros calidos muy suaves.
- Acentos en verde hierba, rojo tomate y amarillo maiz, usados con moderacion.
- Sidebar oscuro elegante o barra superior compacta.
- Tarjetas con radio maximo de 8px.
- Tablas limpias, densas y escaneables.
- Estados con badges de color.
- Botones con iconos lucide.
- Tipografia sobria, profesional y legible.
- Nada de blobs, orbs, gradientes decorativos genericos o tarjetas dentro de tarjetas.

Debe sentirse como una herramienta diaria para un restaurante ocupado, no como una plantilla generica.

## Assets e imagenes obligatorias

Incluye imagenes ya cargadas en el proyecto frontend, preferiblemente en:

`frontend/public/images`

Crea o descarga/genera assets para:

- `burger-simple.jpg`
- `burger-cheese.jpg`
- `burger-double.jpg`
- `fries.jpg`
- `crispy-chicken.jpg`
- `chicken-taco.jpg`
- `beef-taco.jpg`
- `fresh-salad.jpg`
- `soda.jpg`
- `restaurant-hero.jpg`
- `kitchen-pass.jpg`
- `inventory-shelves.jpg`
- `qr-table.jpg`

Usa esas imagenes en productos, panel de cocina, dashboard, menu QR y secciones operativas. Si no puedes descargar imagenes, genera placeholders visuales de alta calidad con CSS/canvas, pero deja los archivos listos y referenciados.

No dejes productos con imagen rota ni `null`. Usa fallback local por categoria.

## Usuarios seed para login

El backend trae estos usuarios:

- Admin: `admin / admin123`
- Mesero: `mesero / mesero123`
- Cocina: `cocina / cocina123`

Implementa pantalla de login con accesos rapidos para esos tres roles. Al autenticar, guarda el JWT y manda `Authorization: Bearer <token>` en requests protegidos.

## Pantallas requeridas

### 1. Login

- Branding `RestoConnect Pro`.
- Imagen gastronomica lateral o fondo visual real.
- Formulario compacto.
- Botones de acceso rapido para Admin, Mesero y Cocina.
- Manejo de error de credenciales.

### 2. Dashboard Admin

Debe mostrar resumen operativo:

- Ventas del dia.
- Pedidos activos.
- Mesas libres/ocupadas/bloqueadas.
- Stock critico.
- Alertas recientes.
- Productos mas vendidos.
- Grafica de ventas.
- Panel de notificaciones en tiempo real usando SSE desde `/api/notificaciones/stream`.

### 3. Mapa de mesas

Consume:

- `GET /api/mesas/mapa`
- `GET /api/mesas`
- `PATCH /api/mesas/{id}/estado`
- `GET /api/mesas/{id}/qr`

Diseña un plano visual de mesas con estados:

- LIBRE
- OCUPADA
- BLOQUEADA
- INACTIVA si aparece

Cada mesa debe tener acciones rapidas: ver QR, cambiar estado, ver pedido activo.

### 4. Menu y productos

Consume:

- `GET /api/menu/categorias`
- `GET /api/menu/productos`
- `POST /api/menu/categorias`
- `POST /api/menu/productos`
- `PATCH /api/menu/productos/{id}/activar`
- `PATCH /api/menu/productos/{id}/desactivar`

Muestra un catalogo visual con imagenes locales para:

- Hamburguesa simple
- Hamburguesa con queso
- Papas fritas
- Pollo crispy
- Taco de pollo
- Taco de carne
- Ensalada fresca
- Combo burger
- Refresco regular
- Hamburguesa doble

Incluye filtros por categoria, busqueda, estado disponible/no disponible y formulario modal para crear producto.

### 5. Toma de pedido para mesero

Consume:

- `POST /api/pedidos`
- `GET /api/pedidos/mesa/{mesaId}/activo`
- `GET /api/pedidos/pendientes`
- `PATCH /api/pedidos/{id}/validar`
- `PATCH /api/pedidos/{id}/cancelar`

Construye una pantalla rapida para meseros:

- Seleccion de mesa.
- Catalogo con imagenes.
- Carrito lateral.
- Cantidades.
- Total.
- Enviar pedido.
- Validar pedido.
- Cancelar pedido con motivo.

Debe ser usable en tablet.

### 6. Panel de cocina

Consume:

- `GET /api/pedidos/cocina/pendientes`
- `PATCH /api/pedidos/{id}/estado`

Diseña un tablero tipo kitchen display system:

- Columnas por estado.
- Tiempo transcurrido.
- Detalle de productos.
- Botones grandes para avanzar estado.
- Vista densa, legible a distancia.

### 7. Pagos y facturacion

Consume:

- `POST /api/pagos/efectivo`
- `POST /api/pagos/pasarela/simular`
- `GET /api/pagos/pendiente-efectivo`
- `POST /api/facturas/generar/{pedidoId}`
- `GET /api/facturas/{id}`

Pantallas:

- Pagos pendientes.
- Confirmar efectivo.
- Simular pasarela.
- Generar factura.
- Vista de factura limpia e imprimible.

### 8. Inventario inteligente

Consume:

- `GET /api/inventario/items`
- `POST /api/inventario/items`
- `PATCH /api/inventario/items/{id}`
- `POST /api/inventario/movimientos/entrada`
- `POST /api/inventario/movimientos/salida`
- `GET /api/inventario/stock`
- `GET /api/inventario/stock/bajo`
- `GET /api/inventario/stock/critico`
- `GET /api/inventario/stock/agotado`
- `GET /api/inventario/alertas`
- `PATCH /api/inventario/alertas/{id}/atendida`

Diseña:

- Tabla de inventario con barras de stock.
- Badges ABC.
- Indicadores de bajo, critico y agotado.
- Formulario de entradas/salidas.
- Alertas visuales.
- Imagen de estanteria o bodega como cabecera contextual.

### 9. Prediccion y compras

Consume:

- `POST /api/inventario/prediccion/generar`
- `GET /api/inventario/prediccion`
- `GET /api/inventario/prediccion/item/{itemId}`
- `POST /api/inventario/prediccion/{id}/generar-orden-compra`
- `GET /api/inventario/parametros`
- `PUT /api/inventario/parametros`
- `GET /api/compras/proveedores`
- `POST /api/compras/proveedores`
- `GET /api/compras/ordenes`
- `POST /api/compras/ordenes`
- `PATCH /api/compras/ordenes/{id}/aprobar`
- `PATCH /api/compras/ordenes/{id}/recibir`

Incluye:

- Predicciones con nivel de riesgo.
- Dias hasta agotamiento.
- Cantidad sugerida.
- Confianza.
- Boton para generar orden de compra.
- Flujo de ordenes: borrador, aprobada, recibida.

### 10. Incidencias

Consume:

- `GET /api/incidencias`
- `GET /api/incidencias/pendientes`
- `POST /api/incidencias`
- `PATCH /api/incidencias/{id}/estado`

Diseña un tablero simple de incidencias con prioridad, categoria, estado y resolucion.

### 11. Reportes

Consume:

- `GET /api/reportes/ventas/rango`
- `GET /api/reportes/ventas/productos`
- `GET /api/reportes/ventas/metodos`
- `GET /api/reportes/ventas/meseros`
- `GET /api/reportes/inventario/consumo`
- `GET /api/reportes/inventario/consumo-vs-prediccion`

Incluye graficas con Recharts:

- Ventas por rango.
- Productos mas vendidos.
- Ventas por metodo de pago.
- Ventas por mesero.
- Consumo real vs prediccion.

### 12. Configuracion

Consume:

- `GET /api/configuracion/restaurante`
- `PUT /api/configuracion/restaurante`

Debe permitir editar:

- Nombre comercial.
- Razon social.
- NIT.
- Telefono.
- Direccion.
- Email.
- Moneda.
- Porcentaje de impuesto.

## Navegacion por roles

ADMIN ve todo.

MESERO ve:

- Dashboard operativo ligero.
- Mesas.
- Toma de pedidos.
- Pagos pendientes.
- Incidencias.

COCINA ve:

- Panel de cocina.
- Pedidos pendientes.
- Incidencias.

CLIENTE_QR, si se implementa, ve:

- Menu publico.
- Pedido por mesa QR.

## Cliente API

Crea un cliente central:

- `src/lib/api.ts`
- Base URL por variable `VITE_API_URL`, fallback `http://localhost:8080`.
- Interceptor o wrapper para JWT.
- Manejo uniforme de errores.
- Tipos TypeScript para respuestas principales.

Implementa servicios por modulo:

- `authService`
- `mesaService`
- `menuService`
- `pedidoService`
- `pagoService`
- `inventarioService`
- `comprasService`
- `reportesService`
- `incidenciasService`
- `configuracionService`
- `notificationService`

## Datos mock y fallback

Aunque el backend debe ser la fuente real, agrega fallback visual para desarrollo si la API esta apagada:

- Productos seed con los nombres del backend.
- Mesas 1 a 5.
- Inventario seed:
  - Pan hamburguesa
  - Carne hamburguesa
  - Lechuga fresca
  - Queso laminado
  - Papas congeladas
  - Aceite vegetal
  - Pollo marinado
  - Tortilla de trigo
  - Tomate
  - Jarabe gaseosa
- Proveedores:
  - Distribuidora Andina
  - Abastos del Sur

El fallback debe estar marcado como modo demo, pero la app debe intentar usar API real primero.

## Calidad visual y responsive

Verifica:

- Desktop 1440px.
- Tablet 1024px.
- Mobile 390px.

Nada debe solaparse. Los textos deben caber en botones, badges, tablas y tarjetas. Las tablas deben tener alternativa responsive. Los formularios deben ser claros y no enormes.

## Entregables

1. Crear el frontend completo en `frontend`.
2. Incluir README del frontend con:
   - instalacion
   - variables env
   - comandos
   - credenciales seed
3. Incluir `.env.example`.
4. Dejar imagenes cargadas en `public/images`.
5. Probar build con `npm run build`.
6. Si es posible, iniciar servidor con `npm run dev` y entregar URL local.

## Criterio de aceptacion

La app debe abrir, verse profesional desde la primera pantalla, tener imagenes visibles, navegar por los modulos principales, permitir login contra el backend, consumir endpoints reales cuando esten disponibles y tener fallback demo si la API no responde.
