# Sprint 2 - Operacion y analitica

## Objetivo cumplido

Se extendio la base del backend con modulos operativos y de analitica para cubrir supervision diaria del restaurante.

## Entregado

- Modulo `personal`:
  - alta de usuarios operativos
  - listado
  - activacion y desactivacion
- Modulo `incidencia`:
  - registro
  - consulta general
  - pendientes
  - cambio de estado
  - notificaciones a roles operativos
- Modulo `configuracion.restaurante`:
  - consulta de datos operativos
  - actualizacion administrativa basica
- Modulo `reportes`:
  - ventas por rango
  - productos mas vendidos
  - ventas por metodo de pago
  - ventas por mesero
  - consumo de inventario por periodo
  - comparacion consumo real vs prediccion
- Paneles operativos:
  - mapa de mesas
  - pedidos pendientes para cocina
- Migraciones `V4__operacion_e_incidencias.sql` y `V5__configuracion_restaurante.sql`.
- Pruebas basicas para incidencias y reportes.

## Decisiones del sprint

- Se mantuvieron los reportes calculados sobre entidades persistidas ya existentes, evitando duplicar tablas de agregados.
- Para notificaciones en tiempo real se reutilizo el canal SSE ya implementado.
- La gestion de personal se apoyo en `auth.Usuario` para no fragmentar el dominio de usuarios.

## Pendientes despues de Sprint 2

- Gestion mas profunda de personal: edicion de perfil, reasignacion, permisos finos.
- Reportes con paginacion, exportacion y filtros mas avanzados.
- Incidencias con asignacion responsable, bitacora y SLA.
- Dashboard consolidado para frontend administrativo.

## Riesgos abiertos

- Sigue faltando validacion de compilacion y arranque real por ausencia de `java`, `mvn` y Docker daemon en este entorno.
- Faltan pruebas de integracion sobre consultas de reportes y endpoints HTTP.
