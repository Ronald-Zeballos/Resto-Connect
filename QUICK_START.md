# Quick Start - Resto-Connect

## ⚡ Arrancar el Proyecto en 5 minutos

### Opción 1: Desarrollo Local (Recomendado)

#### Backend
```bash
cd backend
npm install
npm run dev
```
✅ Server en: `http://localhost:3000`  
✅ Health check: `http://localhost:3000/health`

#### Frontend (en otra terminal)
```bash
cd frontend
npm install
npm run dev
```
✅ App en: `http://localhost:3001`  
✅ Auto proxy a API

### Opción 2: Docker (Full Stack)

```bash
# En la raíz del proyecto
docker-compose up

# Esperar a que se levanten todos los servicios
```

Servicios:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`
- Database: `localhost:5432`

## 🧪 Probar la Arquitectura

### 1. Health Check Backend
```bash
curl http://localhost:3000/health
```
Respuesta esperada:
```json
{
  "status": "OK",
  "timestamp": "2024-04-14T10:30:00.000Z"
}
```

### 2. Crear Restaurante (API)

```bash
curl -X POST http://localhost:3000/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Restaurante",
    "email": "contact@mirestaurante.com",
    "phone": "+34 911 111 111",
    "address": "Calle Principal 123",
    "city": "Madrid",
    "country": "España",
    "ownerId": "owner-001"
  }'
```

Respuesta esperada (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid-generado",
    "name": "Mi Restaurante",
    "email": "contact@mirestaurante.com",
    "phone": "+34 911 111 111",
    "address": "Calle Principal 123",
    "city": "Madrid",
    "country": "España",
    "ownerId": "owner-001",
    "isActive": true,
    "createdAt": "2024-04-14T10:35:20.123Z",
    "updatedAt": "2024-04-14T10:35:20.123Z"
  }
}
```

### 3. Obtener Restaurante

```bash
curl http://localhost:3000/api/restaurants/{uuid-del-paso-anterior}
```

### 4. Probar en Frontend

1. Ir a `http://localhost:3001`
2. Ver el formulario "Crear Restaurante"
3. Llenar el formulario:
   - Nombre: "Pizza Napoli"
   - Email: "info@pizzanapoli.com"
   - Teléfono: "+34 900 800 700"
   - Dirección: "Avenida Italia 45"
   - Ciudad: "Barcelona"
   - País: "España"
   - Owner ID: "owner-002"
4. Hacer click en "Crear Restaurante"
5. ✅ Debería aparecer en la lista abajo

## 📁 Estructura de Carpetas (Verificar)

```
backend/
├── src/
│   ├── domain/
│   │   ├── entities/Entity.ts
│   │   ├── value-objects/ (Email.ts, Money.ts, RestaurantId.ts)
│   │   └── aggregates/ (Restaurant.ts, IRestaurantRepository.ts)
│   ├── application/
│   │   ├── dtos/RestaurantDTO.ts
│   │   └── use-cases/ (CreateRestaurantUseCase.ts, GetRestaurantByIdUseCase.ts)
│   ├── infrastructure/
│   │   ├── persistence/repositories/InMemoryRestaurantRepository.ts
│   │   └── http/controllers/RestaurantController.ts
│   └── index.ts
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── modules/restaurants/
│   │   ├── pages/RestaurantsPage.tsx
│   │   └── components/ (RestaurantForm.tsx, RestaurantList.tsx)
│   ├── core/services/RestaurantService.ts
│   ├── shared/hooks/useRestaurantStore.ts
│   └── App.tsx
├── index.html
├── vite.config.ts
└── package.json

docs/
├── ARCHITECTURE.md
├── DOMAIN_MAP.md
├── SPRINTS.md
├── DEVELOPMENT_GUIDE.md
└── PROJECT_SUMMARY.md
```

## ✅ Checklist de Verificación

- [ ] Repository clonado
- [ ] Backend `npm install` completado
- [ ] Frontend `npm install` completado
- [ ] Backend `npm run dev` corriendo
- [ ] Frontend `npm run dev` corriendo
- [ ] Health check responde OK
- [ ] Puedo crear restaurante desde API
- [ ] Puedo ver restaurante desde API
- [ ] Puedo crear restaurante desde Frontend
- [ ] Frontend lista aparece actualizada
- [ ] Documentación (docs/*) accesible
- [ ] `git status` muestra cambios

## 🐛 Troubleshooting

### Puerto 3000 ya está en uso
```bash
# Cambiar puerto en backend/.env
PORT=3001
```

### Puerto 3001 ya está en uso
```bash
# Cambiar en frontend/vite.config.ts
server: {
  port: 3002
}
```

### Base de datos no conecta
```bash
# Si usas docker-compose
docker-compose down
docker-compose up --build
```

### Errores de TypeScript
```bash
# Limpiar node_modules
rm -rf node_modules
npm install
npm run build
```

## 📖 Lecturas Importantes

1. **Entiende la arquitectura**: Lee [ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. **Mapa del dominio**: Revisa [DOMAIN_MAP.md](docs/DOMAIN_MAP.md)
3. **Próximos pasos**: Consulta [SPRINTS.md](docs/SPRINTS.md)
4. **Cómo desarrollar**: Usa [DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)

## 🎯 Objetivos Sprint 0 ✅

- ✅ Arquitectura hexagonal base
- ✅ Ejemplo completo (Restaurante)
- ✅ Frontend modular con React
- ✅ API funcional
- ✅ Documentación
- ✅ Docker ready
- ✅ TypeScript configurado
- ✅ ESLint + Prettier setup

## 🚀 Próximo: Sprint 1 - Autenticación

```
Sprint 1: Auth & User Management (2 semanas)
├── JWT Implementation
├── User Entity & ValueObjects
├── Register & Login UseCases
├── Protected Routes
├── Auth Frontend Module
└── Tests

Ver [SPRINTS.md](docs/SPRINTS.md) para detalles
```

## 💡 Consejos

1. **Lee el código**: La arquitectura se entiende mejor viendo el código
2. **Experimenta**: Modifica una ruta, crea un Value Object nuevo
3. **Tests**: Escribe tests para entender mejor el flow
4. **Preguntas**: Abre issues con preguntas
5. **Documenta**: Agrega comentarios si descubres algo no claro

---

**¿Todo OK?** → Listo para empezar Sprint 1  
**¿Dudas?** → Abre una issue o discussion  
**¿Mejoras?** → Sugiere en PRs

Happy Coding! 🚀
