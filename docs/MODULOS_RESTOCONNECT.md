# Guia De Modulos - RestoConnect

## 1. Proposito de este documento

Este documento explica el sistema modulo por modulo, con foco en:

- para que sirve cada modulo
- quien lo usa
- que operaciones permite
- con que otros modulos se conecta
- que archivos del frontend y backend suelen tocarse
- que estado funcional tiene hoy en el proyecto

La idea es que te sirva como mapa general del sistema tanto para negocio como para mantenimiento tecnico.

---

## 2. Vista general del sistema

RestoConnect es una plataforma para operar un restaurante con enfoque en:

- sala y mesas
- menu y productos
- pedidos y cocina
- pagos y caja
- inventario y recetas
- proveedores, clientes y personal
- contabilidad, reportes e incidencias
- experiencia QR para cliente final

En la practica, el sistema esta dividido en dos grandes capas:

### Frontend

Ubicacion principal:

- `interfaz/src`

Piezas importantes:

- `interfaz/src/core/app/AppRouter.tsx`
- `interfaz/src/core/modules/moduleCatalog.ts`
- `interfaz/src/core/modules/moduleRegistry.tsx`

El frontend renderiza:

- login interno
- app principal con shell administrativo
- menu QR publico por mesa

### Backend

Ubicacion principal:

- `src/main/java/com/restoconnect/api`

El backend expone:

- autenticacion JWT
- endpoints REST para operacion
- reglas de negocio
- integraciones de pago
- persistencia con PostgreSQL
- cache o soporte operativo con Redis

---

## 3. Flujo general del negocio

El flujo ideal del sistema es este:

1. Se configuran mesas, menu, productos, recetas e inventario.
2. El cliente pide por QR o el mesero registra el pedido manualmente.
3. El pedido pasa a cocina.
4. Cocina cambia estados del pedido.
5. Caja o QR registra el pago.
6. Si corresponde, se factura.
7. Inventario descuenta insumos segun receta.
8. Reportes y contabilidad consolidan resultados.
9. Inventario, benchmarking e incidencias ayudan a decisiones operativas.

---

## 4. Arquitectura del frontend

### Enrutamiento

El archivo `interfaz/src/core/app/AppRouter.tsx` define dos mundos:

- rutas publicas:
  - `/qr/:codigoQr`
  - `/login`
- rutas autenticadas:
  - todo lo demas dentro de `AppShell`

### Registro de modulos

`moduleCatalog.ts` define:

- id del modulo
- ruta
- nombre de navegacion
- titulo
- descripcion
- roles permitidos
- grupo visual

`moduleRegistry.tsx` conecta cada id con su pagina React real.

### Shell interno

La app administrativa usa un layout compartido y componentes visuales reutilizables como:

- `PageHeader`
- `ModulePanel`
- `StatCard`
- `Badge`
- `InlineFeedback`

Eso permite mantener una estetica consistente entre pantallas.

---

## 5. Modulo de Login

### Objetivo

Permitir el acceso del personal interno al sistema.

### Usuario objetivo

- admin
- gerente
- cajero
- mesero
- cocina
- inventario
- contador

### Responsabilidades

- capturar credenciales
- autenticar contra backend
- guardar sesion
- redirigir a la app interna

### Frontend relacionado

- `interfaz/src/modules/auth/interface/LoginPage.tsx`
- `interfaz/src/core/auth/sessionStore`

### Backend relacionado

- `auth`
- `SecurityConfig`
- JWT

### Observaciones

- el cliente QR no usa este login tradicional
- el QR usa un login especial por codigo de mesa

---

## 6. Modulo QR Menu

### Ruta

- `/qr/:codigoQr`

### Objetivo

Permitir que el cliente vea el menu, arme su pedido y haga seguimiento sin entrar al panel interno.

### Usuario objetivo

- cliente del restaurante

### Responsabilidades

- resolver la mesa por QR
- mostrar el menu disponible
- permitir buscar y filtrar productos
- agregar o quitar items
- elegir tipo de servicio:
  - para comer
  - para llevar
- confirmar pedido
- mostrar pedido activo
- permitir editar o cancelar mientras este pendiente
- simular ETA y progreso
- permitir pago QR cuando aplique

### Frontend relacionado

- `interfaz/src/modules/qr-menu/interface/QrMenuPage.tsx`
- `interfaz/src/data/demo.ts`

### Backend relacionado

- `GET /api/mesas/qr/{codigo}`
- `POST /api/auth/cliente-qr`
- `GET /api/menu/productos`
- `POST /api/pedidos`
- `PATCH /api/pedidos/{id}/cancelar`
- `POST /api/pagos/pasarela/simular`

### Estado actual importante

- si el backend esta activo, intenta usar flujo real
- si la mesa es una seed demo como `mesa-1-seed`, entra en modo demo local
- en modo demo no golpea `:8080` para confirmar, cancelar o pagar
- guarda el pedido en localStorage para no perder la experiencia si se recarga

### Valor del modulo

Es clave porque representa la cara visible para el cliente y reduce carga operativa del mesero.

---

## 7. Modulo Dashboard

### Objetivo

Dar una foto ejecutiva del restaurante.

### Usuario objetivo

- admin
- gerente
- cajero
- mesero
- cocina

### Responsabilidades

- mostrar estado general del turno
- resumir ventas
- mostrar alertas
- dar visibilidad de pedidos y mesas

### Frontend relacionado

- `interfaz/src/modules/dashboard/interface/DashboardPage.tsx`

### Backend relacionado

- varios endpoints agregados
- paneles operativos
- reportes
- alertas

### Valor del modulo

Sirve como centro de control rapido para entrar al resto del sistema.

---

## 8. Modulo Mesas

### Objetivo

Controlar la sala del restaurante y las mesas fisicas.

### Usuario objetivo

- admin
- gerente
- mesero

### Responsabilidades

- listar mesas
- cambiar estado:
  - libre
  - ocupada
  - reservada
  - bloqueada
  - inactiva
- gestionar QR
- visualizar previsualizacion del QR

### Frontend relacionado

- `interfaz/src/modules/mesas/interface/MesasPage.tsx`
- `interfaz/src/modules/mesas/interface/TableQrPreview.tsx`

### Backend relacionado

- `mesa`
- endpoints de mesas y QR

### Dependencias de negocio

- QR menu depende de que las mesas existan y tengan codigo valido
- pedidos dependen de la mesa

---

## 9. Modulo Menu

### Objetivo

Gestionar la carta comercial que ve el cliente y el personal.

### Usuario objetivo

- admin
- gerente
- mesero

### Responsabilidades

- crear y editar productos visibles del menu
- organizar por categorias
- activar o desactivar disponibilidad
- mantener precio, descripcion e imagen

### Frontend relacionado

- `interfaz/src/modules/menu/interface/MenuPage.tsx`

### Cambios recientes importantes

- la imagen ya no depende solo de URL
- ahora se puede subir imagen directamente

### Backend relacionado

- `menu.categoria`
- `menu.producto`

### Dependencias

- QR menu consume estos productos
- pedidos consumen estos productos
- recetas pueden ampliar detalle de cada plato

---

## 10. Modulo Productos

### Objetivo

Administrar un catalogo mas tecnico que el menu, incluyendo informacion operativa y de costos.

### Usuario objetivo

- admin
- gerente
- inventario

### Responsabilidades

- crear productos e insumos
- mantener codigos internos
- mantener costos
- definir impuestos y clasificacion funcional
- editar imagen del producto

### Frontend relacionado

- `interfaz/src/modules/productos/interface/ProductosPage.tsx`

### Backend relacionado

- `menu.producto`

### Diferencia con Menu

- `Menu` esta mas orientado a la carta comercial
- `Productos` esta mas orientado a configuracion operativa y tecnica

---

## 11. Modulo Recetas

### Objetivo

Definir como se compone un plato en terminos de inventario.

### Usuario objetivo

- admin
- gerente
- inventario
- cocina

### Responsabilidades

- asignar ingredientes a un producto
- definir cantidades necesarias
- crear recetas nuevas
- editar recetas existentes
- eliminar componentes de receta

### Frontend relacionado

- `interfaz/src/modules/recetas/interface/RecetasPage.tsx`

### Backend relacionado

- `menu.producto`
- `receta`

### Cambios recientes importantes

- ya no solo edita recetas existentes
- ahora permite crear una receta completa nueva desde cero
- se reforzo el id real de componentes de receta para borrar correctamente

### Dependencias de negocio

- inventario descuenta stock segun receta
- cocina y costos dependen de estas definiciones

---

## 12. Modulo Pedidos

### Objetivo

Registrar y administrar ordenes internas del restaurante.

### Usuario objetivo

- admin
- gerente
- mesero

### Responsabilidades

- crear pedidos manuales
- seleccionar mesa
- elegir productos y cantidades
- enviar a cocina
- consultar estados

### Frontend relacionado

- `interfaz/src/modules/pedidos/interface/PedidosPage.tsx`

### Backend relacionado

- `pedido`

### Dependencias

- usa mesas
- usa productos
- impacta cocina
- impacta pagos
- impacta facturacion
- impacta inventario si corresponde la validacion

---

## 13. Modulo Cocina

### Objetivo

Mostrar a cocina la cola operativa y permitir avanzar pedidos por estado.

### Usuario objetivo

- admin
- gerente
- cocina

### Responsabilidades

- ver pedidos pendientes
- ver pedidos en preparacion
- cambiar estados operativos
- priorizar salida de platos

### Frontend relacionado

- `interfaz/src/modules/cocina/interface/CocinaPage.tsx`

### Backend relacionado

- `pedido`
- endpoints de cocina

### Valor del modulo

Es el puente entre la captura del pedido y la entrega real del plato.

---

## 14. Modulo Pagos

### Objetivo

Registrar y controlar cobros del restaurante.

### Usuario objetivo

- admin
- gerente
- cajero
- mesero

### Responsabilidades

- cobro en efectivo
- cobro por pasarela o QR
- lectura de pagos pendientes
- asociacion con pedido
- soporte para facturacion

### Frontend relacionado

- `interfaz/src/modules/pagos/interface/PagosPage.tsx`

### Backend relacionado

- `pago`
- `facturacion`

### Dependencias

- pedido debe existir
- caja puede consolidar el turno
- contabilidad puede reflejar movimientos

---

## 15. Modulo Caja

### Objetivo

Controlar la operacion de apertura y cierre de caja del turno.

### Usuario objetivo

- admin
- gerente
- cajero

### Responsabilidades

- abrir caja
- cerrar caja
- registrar diferencias
- registrar gastos de caja
- conciliar saldos esperados vs reales

### Frontend relacionado

- `interfaz/src/modules/caja/interface/CajaPage.tsx`

### Backend relacionado

- `caja`
- pagos

### Valor del modulo

Es importante para el control financiero del turno y auditoria basica.

---

## 16. Modulo Inventario

### Objetivo

Controlar existencias, movimientos, lotes, conteos y alertas.

### Usuario objetivo

- admin
- gerente
- inventario

### Responsabilidades

- listar items
- editar parametros:
  - stock minimo
  - stock maximo
  - punto de reorden
  - costo unitario
- registrar entradas y salidas
- revisar lotes y vencimientos
- ejecutar conteo fisico
- revisar alertas
- generar sugerencias de reposicion solo para stock bajo
- registrar compra manual desde el mismo modulo

### Frontend relacionado

- `interfaz/src/modules/inventario/interface/InventarioPage.tsx`

### Backend relacionado

- `inventario.item`
- `inventario.movimiento`
- `inventario.stock`
- `inventario.alerta`
- `inventario.prediccion`

### Cambios recientes importantes

- la parte de reposicion ya no vive en compras tradicionales
- ahora esta integrada al flujo de inventario
- solo aparecen sugerencias o compras manuales para items bajo reorden

### Dependencias

- recetas consumen inventario
- pedidos pueden provocar salida de stock
- reportes consumen esta informacion

---

## 17. Modulo Benchmarking

### Ruta

- `/compras`

### Objetivo

Comparar precios del negocio con la competencia.

### Usuario objetivo

- admin
- gerente
- inventario

### Responsabilidades

- registrar observaciones de mercado
- comparar precios propios vs competencia
- guardar fuente y notas
- filtrar por canal
- detectar donde estamos mas caros o mas baratos

### Frontend relacionado

- `interfaz/src/modules/compras/interface/ComprasPage.tsx`

### Estado actual importante

- este modulo antes estaba pensado para compras y reposicion
- ahora fue reconvertido a benchmarking competitivo
- usa una logica mas asistida que automatizada

### Nota operativa importante

Plataformas como PedidosYa suelen tener capas dinamicas o protecciones que vuelven poco fiable un scraping simple de backend. Por eso la pantalla actual funciona como tablero de observaciones competitivas con enlace y captura manual estructurada.

### Relacion con Inventario

- benchmarking ya no gestiona reposicion
- reposicion operativa se movio a Inventario

---

## 18. Modulo Proveedores

### Objetivo

Gestionar la base de abastecimiento del restaurante.

### Usuario objetivo

- admin
- gerente
- inventario
- contador

### Responsabilidades

- alta de proveedor
- edicion de datos comerciales
- telefono, email, direccion
- persona de contacto
- pagina web
- baja logica o desactivacion

### Frontend relacionado

- `interfaz/src/modules/proveedores/interface/ProveedoresPage.tsx`

### Backend relacionado

- `compras.proveedor`

### Valor del modulo

Es el padrin de contactos para reabastecimiento y negociacion comercial.

---

## 19. Modulo Clientes

### Objetivo

Mantener la base de clientes y sus datos para contacto o facturacion.

### Usuario objetivo

- admin
- gerente
- cajero
- mesero

### Responsabilidades

- alta y edicion de clientes
- nombre
- documento
- telefono
- email
- direccion

### Frontend relacionado

- `interfaz/src/modules/clientes/interface/ClientesPage.tsx`

### Valor del modulo

Sirve como soporte para historial comercial, cobranza y facturacion.

---

## 20. Modulo Personal

### Objetivo

Gestionar usuarios internos del sistema y su rol operativo.

### Usuario objetivo

- admin
- gerente

### Responsabilidades

- crear usuarios
- asignar rol
- editar datos de acceso
- desactivar personal
- controlar quienes entran a cada modulo

### Frontend relacionado

- `interfaz/src/modules/personal/interface/PersonalPage.tsx`

### Backend relacionado

- `personal`
- `auth`
- seguridad por rol

### Valor del modulo

Es la base de permisos y trazabilidad operativa.

---

## 21. Modulo Contabilidad

### Objetivo

Registrar cartera, ingresos, gastos y lectura contable general.

### Usuario objetivo

- admin
- gerente
- contador

### Responsabilidades

- cuentas por pagar
- cuentas por cobrar
- gastos
- ingresos
- estado de resultados

### Frontend relacionado

- `interfaz/src/modules/contabilidad/interface/ContabilidadPage.tsx`

### Backend relacionado

- cuentas por pagar
- cuentas por cobrar
- gastos contables
- ingresos contables
- reportes financieros

### Cambios recientes importantes

- se reorganizo visualmente para que cada tab viva dentro de paneles blancos consistentes
- se consolidaron modales de alta y registro

### Dependencias

- pagos
- caja
- clientes
- proveedores

---

## 22. Modulo Reportes

### Objetivo

Transformar la operacion diaria en indicadores para decision.

### Usuario objetivo

- admin
- gerente
- contador

### Responsabilidades

- ventas por rango
- ventas por producto
- ventas por metodo
- ventas por mesero
- consumo de inventario
- consumo vs prediccion

### Frontend relacionado

- `interfaz/src/modules/reportes/interface/ReportesPage.tsx`

### Backend relacionado

- `reportes`

### Valor del modulo

Es el punto donde el sistema deja de solo operar y empieza a ayudar a decidir.

---

## 23. Modulo Incidencias

### Objetivo

Registrar problemas operativos, tareas y seguimientos.

### Usuario objetivo

- admin
- gerente
- mesero
- cocina

### Responsabilidades

- registrar incidencia
- asignar categoria
- marcar prioridad
- cambiar estado
- dar visibilidad a problemas del turno

### Frontend relacionado

- `interfaz/src/modules/incidencias/interface/IncidenciasPage.tsx`

### Backend relacionado

- `incidencia`

### Ejemplos de uso

- QR roto
- insumo faltante
- equipo de cocina con falla
- mesa bloqueada

---

## 24. Modulo Configuracion

### Objetivo

Guardar la configuracion general del negocio.

### Usuario objetivo

- admin
- gerente

### Responsabilidades

- datos fiscales
- datos del restaurante
- parametros operativos
- configuraciones base del local

### Frontend relacionado

- `interfaz/src/modules/configuracion/interface/ConfiguracionPage.tsx`

### Backend relacionado

- `configuracion.restaurante`

### Valor del modulo

Centraliza la identidad del negocio y los parametros que afectan varias areas.

---

## 25. Roles y acceso por modulo

Resumen de alto nivel:

- `ADMIN`: acceso amplio al sistema
- `GERENTE`: acceso amplio operativo y analitico
- `CAJERO`: pagos, caja, clientes y partes del dashboard
- `MESERO`: mesas, menu, pedidos, pagos basicos, clientes
- `COCINA`: cocina y visibilidad operativa
- `INVENTARIO`: productos, recetas, inventario, benchmarking, proveedores
- `CONTADOR`: contabilidad, reportes, proveedores
- `CLIENTE_QR`: experiencia publica del menu QR

El detalle visible de roles por modulo se encuentra en:

- `interfaz/src/core/modules/moduleCatalog.ts`

---

## 26. Relaciones entre modulos

### Flujo comercial

- Mesas -> QR Menu -> Pedidos -> Cocina -> Pagos -> Caja -> Contabilidad -> Reportes

### Flujo de producto

- Productos -> Menu -> Recetas -> Inventario -> Reportes

### Flujo de abastecimiento

- Inventario -> Proveedores -> Benchmarking -> decisiones de compra manual

### Flujo de personas

- Personal -> roles -> acceso a modulos
- Clientes -> pagos, facturacion, cuentas por cobrar

---

## 27. Archivos clave para entender el sistema rapido

Si alguien nuevo entra al proyecto, estos archivos le dan una muy buena foto:

### Frontend

- `interfaz/src/core/app/AppRouter.tsx`
- `interfaz/src/core/modules/moduleCatalog.ts`
- `interfaz/src/core/modules/moduleRegistry.tsx`
- `interfaz/src/shared/ui/primitives.tsx`
- `interfaz/src/types.ts`
- `interfaz/src/data/demo.ts`

### Backend

- `src/main/java/com/restoconnect/api/shared/security/SecurityConfig.java`
- `src/main/java/com/restoconnect/api/auth`
- `src/main/java/com/restoconnect/api/pedido`
- `src/main/java/com/restoconnect/api/menu/producto`
- `src/main/java/com/restoconnect/api/inventario`
- `src/main/resources/db/migration`

---

## 28. Estado actual del proyecto

Hoy el sistema ya cubre bastante del circuito real del restaurante:

- operacion de mesas
- menu y productos
- recetas
- pedidos
- cocina
- pagos
- inventario
- clientes
- proveedores
- personal
- contabilidad
- reportes
- incidencias
- configuracion
- experiencia QR

Tambien hay partes que hoy estan en modo mixto entre real y demo:

- QR menu puede trabajar contra backend o en demo local
- benchmarking competitivo hoy es principalmente asistido
- algunos flujos dependen del rol y del backend para responder sin `403`

---

## 29. Recomendaciones para evolucion futura

### Corto plazo

- persistir en backend el tipo de servicio del QR
- llevar ETA del QR a estados reales del pedido
- conectar benchmarking con capturas o importaciones estructuradas
- ampliar trazabilidad entre inventario y compras manuales

### Mediano plazo

- historial por cliente
- auditoria por usuario
- mejores dashboards de margen
- conciliacion mas fuerte entre pagos, caja y contabilidad

### Largo plazo

- automatizacion competitiva por canal
- costos y margen por plato en tiempo real
- prediccion de demanda mas avanzada
- alertas inteligentes por caida de margen o stock critico

---

## 30. Cierre

Si necesitas ampliar este documento, lo mas natural seria agregar despues:

- diagramas de flujo
- endpoints por modulo con ejemplos
- mapa de base de datos
- pantallas con capturas
- reglas de negocio criticas por caso de uso

Este archivo busca ser la base maestra para entender el sistema completo sin tener que abrir decenas de archivos primero.
