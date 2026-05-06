# Sprint 1 - Base funcional del backend

## Objetivo

Levantar una primera version funcional de `restoconnect-api` desde un repositorio vacio, manteniendo arquitectura por paquetes de negocio y priorizando el flujo completo de pedidos, inventario y compras.

## Cambios realizados

- Bootstrapping del proyecto con `Spring Boot 3`, `Maven`, `Java 21`, `Swagger`, `Flyway` y `Docker Compose`.
- Configuracion base de seguridad con `JWT`, filtros y roles `ADMIN`, `MESERO`, `COCINA`, `CLIENTE_QR`.
- Modulo `shared` con:
  - `BaseEntity`
  - manejo global de excepciones
  - beans comunes
  - notificaciones persistidas + SSE
- Modulo `mesa` con QR y estados de mesa.
- Modulo `menu` con categorias, productos y recetas enlazadas a inventario.
- Modulo `inventario` con:
  - items parametrizables
  - entradas y salidas con historial
  - alertas
  - parametros configurables
  - prediccion de reposicion
  - stock y disponibilidad automatica de productos
- Modulo `pedido` con:
  - creacion
  - validacion por mesero
  - descuento automatico de insumos
  - consulta por mesa
  - cambio de estado
  - cancelacion controlada
- Modulo `pago` con:
  - efectivo
  - pasarela simulada
  - pendientes de confirmacion
- Modulo `facturacion` con generacion de factura solo tras pago.
- Modulo `compras` con proveedores, ordenes manuales, aprobacion, recepcion y generacion sugerida desde prediccion.
- Migraciones `Flyway` iniciales y seed data coherente.
- Tests unitarios de casos de uso criticos.

## Fixes y decisiones dentro del sprint

- Se corrigieron relaciones `LAZY` que iban a chocar con `open-in-view=false`.
- Se ajustaron repositorios con `@EntityGraph` para evitar lecturas incompletas en pedidos y ordenes.
- Se mantuvo `Server-Sent Events` en lugar de `WebSocket` para reducir complejidad y dejar tiempo real funcional desde el primer corte.
- Se uso motor local de prediccion por reglas/promedio movil, dejando el adaptador de IA externa como evolucion natural para sprint posterior.
- Aunque la guia sugeria empujar base de datos al final, se adelanto en este sprint para que el backend no quede solo como esqueleto sin persistencia real.

## Riesgos abiertos

- Falta validar compilacion/arranque porque el entorno no tiene `java`, `mvn` ni Docker daemon activo.
- Reporteria avanzada, incidencias y gestion de personal aun no estan cubiertas.
- No hay pruebas de integracion HTTP ni pruebas de persistencia completas.

