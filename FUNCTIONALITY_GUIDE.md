# 📚 Guía Completa de Funcionalidades - Resto-Connect

**Versión:** 1.0  
**Última Actualización:** Abril 14, 2026  
**Estado:** Sprints 0-3 Completados, Listo para Sprint 4

---

## 🎯 Descripción General

Resto-Connect es una plataforma completa de gestión de restaurantes y pedidos. Permite:
- ✅ **Clientes:** Buscar restaurantes, ver menús, hacer pedidos
- ✅ **Propietarios:** Crear y gestionar restaurantes, menús y pedidos
- ✅ **Administradores:** Supervisar plataforma completa
- ✅ **Repartidores:** Gestionar entregas (Sprint 5)

---

## 🔐 AUTENTICACIÓN Y USUARIOS

### Roles Disponibles

**1. CUSTOMER (Cliente Regular)**
- Buscar restaurantes
- Ver menús
- Hacer pedidos
- Historial de órdenes
- Calificar restaurantes

**2. RESTAURANT_OWNER (Propietario de Restaurante)**
- Crear restaurantes ilimitados
- Gestionar información del restaurante
- Crear y editar menús
- Ver pedidos en tiempo real
- Gestionar estados de pedidos
- Ver reportes de ventas

**3. DELIVERY_DRIVER (Repartidor)**
- Ver pedidos asignados
- Actualizar estado de entrega
- Confirmar entrega
- Reportar problemas

**4. ADMIN (Administrador del Sistema)**
- Acceso a todo
- Ver estadísticas generales
- Gestionar usuarios
- Ver reportes de plataforma

### Registro de Usuario

**Ubicación:** `http://localhost:3001/register`

**Pasos:**
1. Click en "Registrarse"
2. Llenar formulario:
   - Nombre completo
   - Email (único)
   - Contraseña (mín. 8 caracteres)
   - Seleccionar rol
3. Hacer click en "Registrarse"
4. Serás redirigido a login automáticamente

**Validaciones:**
- ✅ Email válido
- ✅ Contraseña mínimo 8 caracteres
- ✅ Email no puede estar duplicado
- ✅ Nombre requerido

### Login

**Ubicación:** `http://localhost:3001/login`

**Pasos:**
1. Ingresar email
2. Ingresar contraseña
3. Click "Iniciar Sesión"
4. Serás redirigido a tu dashboard

**Recuperación de Sesión:**
Aunque no hay "Olvidé contraseña" aún, puedes:
- Crear nuevo cuenta con diferente email
- O reportar en `BUGS_ERRORS.md`

---

## 🏪 GESTIÓN DE RESTAURANTES

### Para Clientes

**Ver Lista de Restaurantes**
- **URL:** `http://localhost:3001/restaurants`
- **Qué ves:** Grid de restaurantes activos
- **Info mostrada:**
  - Nombre del restaurante
  - Email de contacto
  - Ubicación (ciudad, país)
  - Teléfono
  - Botones: Ver Detalles, Editar (si es tuyo)

**Ver Detalles del Restaurante**
- **URL:** `http://localhost:3001/restaurants/:id`
- **Qué ves:**
  - Información completa
  - Estado activo
  - Fecha de creación
  - Última actualización
  - Botones: Editar, Eliminar

### Para Propietarios

**Crear Nuevo Restaurante**
- **URL:** `http://localhost:3001/restaurants/create`
- **Campos:**
  - Nombre (obligatorio)
  - Email de contacto
  - Teléfono
  - Dirección
  - Ciudad
  - País
- **Después de crear:**
  - Se abre automáticamente la lista de restaurantes
  - Tu restaurante aparece en la lista

**Editar tu Restaurante**
- **URL:** `http://localhost:3001/restaurants/edit/:id`
- **Qué puedes cambiar:**
  - Nombre
  - Teléfono
  - Dirección
  - Ciudad
  - País
- **Nota:** Email no se puede cambiar (identificador único)

**Eliminar Restaurante**
- Haz click en botón "Eliminar" en detalle
- Se pide confirmación
- Es un soft delete (no se borra realmente, solo se marca inactivo)

**Ver tus Restaurantes**
- Tus restaurantes aparecen en la lista general
- También puedes filtrar por propietario (próximas versiones)

---

## 🍽️ GESTIÓN DE MENÚS

### Crear Menú

**Ubicación:** `http://localhost:3001/restaurant/:restaurantId/menu/create`

**Campos:**
- Nombre del menú (ej: "Menú Principal", "Desayunos", etc.)

**Después de crear:**
- Puedes agregar items al menú

### Agregar Items al Menú

**Para cada item necesitas:**

| Campo | Tipo | Rango | Ejemplo |
|-------|------|-------|---------|
| Nombre | Texto | 1-100 caracteres | "Pizza Margherita" |
| Descripción | Textarea | Opcional | "Pizza clásica italiana" |
| Categoría | Select | Ver opciones | "Main" |
| Precio | Número | > 0 | 12.99 |
| Costo | Número | 0 ≤ cost ≤ price | 4.50 |
| Disponible | Toggle | Sí/No | Sí |

**Categorías Disponibles:**
- Main (Plato Principal)
- Side (Acompañamiento)
- Dessert (Postre)
- Beverage (Bebida)
- Appetizer (Entrada)
- Other (Otro)

**Cálculos Automáticos:**
- Ganancia = Precio - Costo
- Margen = (Ganancia / Precio) × 100

### Editar Item del Menú

**Ubicación:** `http://localhost:3001/restaurant/:restaurantId/menu/edit/:itemId`

**Qué puedes cambiar:**
- Nombre
- Descripción
- Precio
- Costo
- Disponibilidad

### Eliminar Item del Menú

**Ubicación:** Desde página de editar menú
- Click en ícono de basura junto al item
- Se elimina inmediatamente (hard delete)

### Ver Menú (Como Cliente)

**Ubicación:** Integrado en página de crear pedido

**Ve:**
- Todos los items disponibles
- Nombre, descripción, precio
- Puede agregar cantidades para pedir

---

## 📦 GESTIÓN DE PEDIDOS (SPRINT 4)

**Estado Actual:** 🔄 En desarrollo - Revisá `DEVELOPMENT_PLAN.md`

### Crear Pedido (Próximamente)
- Cliente elige restaurante
- Selecciona items del menú
- Ingresa cantidad
- Agrega notas especiales
- `Coloca orden` → Se crea en backend

### Ver Mis Pedidos (Próximamente)
- Cliente ve historial completo
- Status de cada pedido
- Fecha y hora
- Total gastado

### Administrar Pedidos (Próximamente)
- Propietario ve todos los pedidos del restaurante
- Puede cambiar estado
- PENDING → CONFIRMED → PREPARING → READY → COMPLETED

### Cancelar Pedido (Próximamente)
- Cliente puede cancelar si está en PENDING o CONFIRMED
- Después de PREPARING no se puede cancelar

---

## 🚀 COMENZAR A USAR LA PLATAFORMA

### Para Clientes

**Paso 1: Registrarse**
```
1. Ir a http://localhost:3001/register
2. Llenar datos (seleccionar "Cliente")
3. Click Registrarse
4. Ir a login
```

**Paso 2: Ver Restaurantes**
```
1. Iniciar sesión
2. Se abre automáticamente lista de restaurantes
3. Ver detalles haciendo click en cada uno
```

**Paso 3: Crear Pedido** (Cuando Sprint 4 esté listo)
```
1. Desde restaurante, click "Hacer Pedido"
2. Seleccionar items y cantidades
3. Agregar notas si necesita
4. Confirmar y pagar
5. Rastrear en tiempo real
```

### Para Propietarios

**Paso 1: Registrarse**
```
1. Ir a http://localhost:3001/register
2. Seleccionar "Propietario de Restaurante"
3. Registrarse y login
```

**Paso 2: Crear Restaurante**
```
1. Click "Nuevo Restaurante"
2. Llenar datos (nombre, dirección, teléfono, etc.)
3. Guardar
```

**Paso 3: Crear Menú**
```
1. Ir al restaurante que creaste
2. Click "Ver Menú"
3. Agregar items:
   - Nombre, descripción
   - Precio y costo
   - Categoría
   - Disponibilidad
4. Guardar
```

**Paso 4: Gestionar Pedidos** (Cuando Sprint 4 esté listo)
```
1. Dashboard muestra pedidos en tiempo real
2. Cambiar de estado cuando esten listos
3. Ver reportes de ventas
```

---

## 🎨 NAVEGACIÓN

### Menú Principal (Navbar)

**Si NO estás autenticado:**
- Login
- Registrarse

**Si SOIS Cliente:**
- Inicio
- Restaurantes
- Mis Pedidos (Sprint 4)
- Mi Perfil
- Cerrar Sesión

**Si SOIS Propietario:**
- Inicio
- Mis Restaurantes
- Crear Restaurante
- Mis Pedidos (Sprint 4)
- Reportes (Sprint 6)
- Mi Perfil
- Cerrar Sesión

**Si SOIS Admin:**
- Dashboard
- Usuarios
- Restaurantes
- Pedidos
- Reportes
- Configuración
- Cerrar Sesión

---

## 📊 DATOS Y VALIDACIONES

### Email
- Formato: `usuario@dominio.com`
- Único en todo el sistema
- No case-sensitive para login

### Contraseña
- Mínimo 8 caracteres
- Se hashea con bcrypt (no se almacena en plain text)
- No se envía a frontend después de login

### Teléfono
- Formato libre (puede ser +34 600 123 456 o 600123456)
- Opcional en algunos formularios

### Dirección
- Calle completa (ej: "Calle Colón 123, Piso 2")

### City / Country
- Texto libre (ej: "Madrid", "España")

### Moneda
- USD (en ejemplo)
- Usando `.toFixed(2)` para 2 decimales

---

## ⚙️ ENDPOINTS DE API

### Autenticación
```
POST   /api/auth/register          → Registrar usuario
POST   /api/auth/login             → Login
POST   /api/auth/validate-token    → Validar JWT
```

### Restaurantes
```
GET    /api/restaurants              → Listar todos (paginado)
POST   /api/restaurants              → Crear nuevo
GET    /api/restaurants/:id          → Obtener detalles
PUT    /api/restaurants/:id          → Actualizar
DELETE /api/restaurants/:id          → Eliminar (soft)
GET    /api/restaurants/owner/:id    → Listar por propietario
```

### Menús
```
POST   /api/menus                              → Crear menú
GET    /api/menus/restaurant/:restaurantId   → Obtener menú
POST   /api/menus/:id/items                   → Agregar item
PUT    /api/menus/:id/items/:index            → Actualizar item
DELETE /api/menus/:id/items/:index            → Eliminar item
```

### Pedidos (Próximamente)
```
POST   /api/orders                           → Crear pedido
GET    /api/orders/:id                       → Obtener detalles
GET    /api/orders/customer/my-orders        → Mis pedidos
GET    /api/orders/restaurant/:id            → Pedidos del restaurante
PUT    /api/orders/:id/status                → Cambiar estado
DELETE /api/orders/:id                       → Cancelar pedido
```

---

## 🔑 TOKENS Y AUTENTICACIÓN

### JWT Token

**Dónde se guarda:**
- `localStorage.accessToken` - Token de acceso (corta duración)
- `localStorage.refreshToken` - Token de renovación (larga duración)

**Formato:**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cómo se usa:**
1. Después de login, se guarda en localStorage
2. En cada request, se envía en header `Authorization: Bearer <token>`
3. Backend valida el token
4. Si es válido, procesa la request

**Duración:**
- Access Token: 1 hora (predeterminado, configurable)
- Refresh Token: 7 días (predeterminado, configurable)

### Rutas Protegidas

Estas rutas requieren autenticación:
- `/restaurants/create` (propietarios)
- `/restaurants/edit/:id` (propietarios)
- `/restaurants/:id/menu/*` (propietarios)
- `/my-orders` (clientes)
- `/orders/:id` (clientes/propietarios)

Si no estás autenticado, serás redirigido a `/login`.

---

## 🐛 ERRORES COMUNES Y SOLUCIONES

### "Invalid token" o "Unauthorized"
**Causa:** Token expired o inválido  
**Solución:** Hacer logout y login nuevamente

### "User already exists"
**Causa:** Email ya fue registrado  
**Solución:** Usar diferente email o hacer login si ya tienes cuenta

### "Restaurant not found"
**Causa:** El restaurante fue eliminado o ID incorrecto  
**Solución:** Volver a listar y seleccionar otro

### "Cannot modify other user's restaurant"
**Causa:** Intentas editar restaurante de otro propietario  
**Solución:** Solo puedes editar tus propios restaurantes

---

## 📞 CONTACTO Y SOPORTE

Para errores o preguntas:
1. Revisar `BUGS_ERRORS.md` para bugs conocidos
2. Revisar `DEVELOPMENT_PLAN.md` para features en desarrollo
3. Revisar logs en consola del navegador (F12 → Console)
4. Revisar logs del backend en terminal

---

## 🗺️ ROADMAP DE SPRINTS

| Sprint | Objetivo | Estado |
|--------|----------|--------|
| 0 | Fundamentos | ✅ Completado |
| 1 | Auth & Usuarios | ✅ Completado |
| 2 | Restaurant CRUD | ✅ Completado |
| 3 | Menu Management | ✅ Completado |
| 4 | Order Management | 🔄 En Desarrollo |
| 5 | Order Fulfillment & Payments | ⏳ No iniciado |
| 6 | Analytics & Reports | ⏳ No iniciado |

---

## 📖 Documentos Relacionados

- **DEVELOPMENT_PLAN.md** - Plan detallado de próximos sprints
- **BUGS_ERRORS.md** - Registro de bugs y soluciones
- **QUICK_START.md** - Guía rápida para empezar
- **SPRINT_2_SUMMARY.md** - Detalles técnicos de Sprint 2
- **SPRINT_3_SUMMARY.md** - Detalles técnicos de Sprint 3
- **ARCHITECTURE.md** - Arquitectura técnica

---

**¡Gracias por usar Resto-Connect!** Esperamos tus comentarios. 🎉

Última actualización: Abril 14, 2026  
Próxima revisión: Después de Sprint 4
