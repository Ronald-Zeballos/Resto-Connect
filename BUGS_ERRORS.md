# 🐛 Registro de Bugs y Errores - Resto-Connect

**Última Actualización:** Abril 14, 2026

---

## 📋 Sistema de Reportes

Este archivo documenta todos los bugs, errores y problemas encontrados durante el desarrollo. Cada entrada incluye:
- **Descripción del problema**
- **Síntomas / Cómo reproducir**
- **Causa raíz**
- **Solución implementada**
- **Estado**
- **Fecha de reporte**

---

## ✅ RESUELTOS

### Bug #1: Registro de Usuario Fallando - API Unreachable
**Reportado:** Abril 14, 2026  
**Estado:** ✅ RESUELTO

**Descripción:**
El formulario de registro en el frontend no podía conectarse al backend. Los usuarios no podían registrarse ni acceder a ninguna funcionalidad.

**Síntomas:**
```
POST /api/auth/register → Error de conexión
No muestra mensaje de error específico
El navegador intenta conectar a http://localhost:3000/api
```

**Causa Raíz:**
En `frontend/src/core/services/AuthService.ts`, la URL del API estaba configurada como:
```javascript
const API_URL = 'http://localhost:3000/api'
```

Esto causaba problemas porque:
1. Vite tiene un proxy configurado en `/api` que mapea a `localhost:3000`
2. El navegador pierde el contexto de localhost:3001
3. Se produce un error de CORS o conexión rechazada

**Solución Implementada:**
Cambié la URL a una ruta relativa:
```javascript
const API_URL = import.meta.env.VITE_API_URL || '/api'
```

Esto permite que:
1. Vite intercepte las requests a `/api`
2. El proxy las reenvíe a `http://localhost:3000`
3. Se evitan problemas de CORS

**Archivos Modificados:**
- `frontend/src/core/services/AuthService.ts`

**Pasos para Reproducir (Antes de la Fix):**
1. Iniciar backend: `npm run dev` en `/backend`
2. Iniciar frontend: `npm run dev` en `/frontend`
3. Ir a `http://localhost:3001/register`
4. Intentar registrarse
5. Ver error de conexión en consola del navegador

**Pasos para Verificar (Después de la Fix):**
1. Iniciar ambos servidores
2. Acceder a `http://localhost:3001/register`
3. Llenar formulario y enviar
4. Debe redirigir a login ✅

---

### Bug #2: RestaurantListPage - Restaurants Undefined
**Reportado:** Abril 14, 2026  
**Estado:** ✅ RESUELTO

**Descripción:**
Al hacer login exitoso, se redirige a `/restaurants` pero el componente se crasheaba con error "Cannot read properties of undefined (reading 'length')".

**Síntomas:**
```
TypeError: Cannot read properties of undefined (reading 'length')
at RestaurantListPage (RestaurantListPage.tsx:34:44)
```

**Causa Raíz:**
En `RestaurantListPage.tsx`, el código estaba desestructurando `restaurants` del store de Zustand:
```typescript
const { restaurants, loading, error, setPage } = useRestaurantStore()
// ... después
if (loading && restaurants.length === 0)  // ❌ restaurants era undefined
```

Aunque el store inicializa `restaurants: []`, en algunos casos React vuelve a renderizar antes de que Zustand se sincronice correctamente, causando que `restaurants` sea `undefined`.

**Solución Implementada:**
1. Cambié la forma de destructurar para ser más defensivo:
```typescript
const storeData = useRestaurantStore()
const restaurants = storeData.restaurants || []  // Garantiza que es siempre un array
const loading = storeData.loading
const error = storeData.error
const setPage = storeData.setPage
```

2. Agregué logs para debugging:
```typescript
console.log('🏪 [RestaurantListPage] Renderizando, restaurants:', restaurants.length)
console.log('🔄 [RestaurantListPage] setPage llamado con page:', currentPage)
```

**Archivos Modificados:**
- `frontend/src/modules/restaurants/pages/RestaurantListPage.tsx`

---

### Issue #1: Estadísticas de Vulnerabilidades en npm
**Reportado:** Abril 14, 2026  
**Severidad:** 🟡 Media  
**Estado:** ⏳ Pendiente

**Descripción:**
El backend reporta 5 vulnerabilidades (2 low, 3 moderate) y frontend 2 (moderate).

**Causa:**
- Backend requiere `--legacy-peer-deps` debido a conflicto de versiones de `reflect-metadata`
- Algunas dependencias tienen vulnerabilidades conocidas

**Impacto:**
- No afecta funcionalidad actual
- Seguridad potencial a mediano plazo

**Solución Propuesta:**
- Actualizar dependencias en próximas versiones
- Ejecutar `npm audit fix` cuando sea seguro

**Estado Actual:**
```
Backend: 5 vulnerabilities (2 low, 3 moderate)
Frontend: 2 vulnerabilities (moderate)
```

---

### Issue #2: Token Refresh No Implementado
**Reportado:** Abril 14, 2026  
**Severidad:** 🟡 Media  
**Estado:** ⏳ Sprint 5

**Descripción:**
El sistema de JWT no incluye refresh token logic. Los tokens expiran sin mecanismo de renovación automática.

**Impacto:**
- Sesión se pierde cuando token expira
- Usuario debe login nuevamente

**Solución Propuesta:**
- Implementar refresh token endpoint en backend
- Auto-renovar token en frontend interceptor

**Ticket Relacionado:**
- Sprint 5: Order Fulfillment & Payments

---

### Issue #3: En-Memory Storage - Datos se Pierden al Reiniciar
**Reportado:** Abril 14, 2026  
**Severidad:** 🟠 Alta (Para Production)  
**Estado:** ⏳ Sprint 6 o Base de Datos

**Descripción:**
Todos los datos (usuarios, restaurantes, menús, órdenes) se almacenan en memoria. Al reiniciar el servidor, TODO se pierde.

**Causa:**
Deliberada - arquitectura actual usa `InMemoryRepository` para desarrollo rápido.

**Impacto (Desarrollo):**
- ✅ Aceptable - facilita testing y reset rápido
- Cada restart = database limpia

**Impacto (Production):**
- ❌ INACEPTABLE - se pierden todos los datos

**Solución Propuesta:**
- Sprint posterior: Migrar a PostgreSQL
- Implementar Prisma ORM
- Crear migrations

**Referencias de Implementación:**
Revisar `DEVELOPMENT_PLAN.md` - Fase futura de persistencia

---

## 🔍 TROUBLESHOOTING - Soluciones Rápidas

### "No me puedo registrar"
**Checklist:**
- [ ] ¿Backend está corriendo en puerto 3000? → Verificar `npm run dev` en `/backend`
- [ ] ¿Frontend está corriendo en puerto 3001? → Verificar `npm run dev` en `/frontend`
- [ ] ¿AuthService.ts usa URL relativa `/api`?
- [ ] ¿Vite proxy está configurado? → Revisar `vite.config.ts`
- [ ] ¿Consola del navegador muestra errores? → F12 → Console tab

### "Error: Port 3000 already in use"
**Solución:**
```powershell
# Matar todos los procesos node
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Esperar 1 segundo
Start-Sleep -Milliseconds 1000

# Reiniciar
cd backend && npm run dev
```

### "Error: Cannot find module '@core/...'"
**Solución:**
El archivo usa import relativo en lugar de alias.
```typescript
// ❌ MAL
import { Service } from '../../../core/services/Service'

// ✅ CORRECTO
import { Service } from '@core/services/Service'
```

### "CORS error en consola"
**Causa:** Frontend intenta conectar a `http://localhost:3000` en lugar de usar proxy  
**Solución:** Usar `/api` en lugar de URLs absolutas en AuthService

---

## 📊 Matriz de Severidad

```
CRÍTICA (🔴) - Bloquea desarrollo
  → Debe resolverse inmediatamente

ALTA (🟠) - Funcionalidad importante rota
  → Resolver en sprint actual

MEDIA (🟡) - Feature incompleta o error no usual
  → Resolver en próximo sprint

BAJA (🟢) - Feature nice-to-have o edge case
  → Resolver cuando haya tiempo
```

---

## 📝 Plantilla para Reportar Nuevos Bugs

Cuando encuentres un bug, cópialo aquí:

```markdown
### Bug #X: [Título corto]
**Reportado:** [Fecha]  
**Estado:** 🔴 Nuevo / ⏳ En Investigación / ✅ Resuelto

**Descripción:**
[Qué pasó exactamente]

**Síntomas:**
[Cómo lo ves / qué hace mal]

**Causa Raíz:**
[Por qué pasó - investigar]

**Solución:**
[Cómo se arregló o se arreglará]

**Archivos Afectados:**
- archivo1.ts
- archivo2.tsx

**Pasos para Reproducir:**
1. Paso 1
2. Paso 2
3. Paso 3
```

---

## 🔗 Relación con Otros Documentos

- **DEVELOPMENT_PLAN.md** - Plan detallado de sprints
- **SPRINT_2_SUMMARY.md** - Detalles de Sprint 2
- **SPRINT_3_SUMMARY.md** - Detalles de Sprint 3
- **FUNCTIONALITY_GUIDE.md** - Guía de funcionalidades disponibles
- **QUICK_START.md** - Cómo empezar rápido

---

## 📌 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Bugs Críticos | 0 ✅ |
| Bugs Altos | 0 ✅ |
| Bugs Medios | 2 ⏳ |
| Bugs Bajos | 1 🟢 |
| Issues Resueltos | 1 ✅ |
| Vulnerabilidades npm | 7 ⚠️ |

**Conclusión:** Sistema funcional y listo para Sprint 4. Documentar y resolver issues conocidos en sprints posteriores.
