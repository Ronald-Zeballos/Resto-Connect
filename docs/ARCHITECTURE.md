# Resto-Connect - Arquitectura Hexagonal con DDD

## 📋 Visión General

Resto-Connect es una plataforma de gestión de restaurantes construida con **arquitectura hexagonal** y **Domain-Driven Design (DDD)** como un **monolito modular evolutivo**.

## 🏗️ Estructura Arquitectónica

### Backend - Arquitectura Hexagonal

```
backend/src/
├── domain/                 # Capa de Dominio (Lógica de negocio pura)
│   ├── entities/          # Entidades del dominio
│   ├── value-objects/     # Value Objects (sin identidad)
│   └── aggregates/        # Agregados raíz
│
├── application/           # Capa de Aplicación (Casos de uso)
│   ├── use-cases/         # Casos de uso específicos
│   ├── dtos/              # Data Transfer Objects
│   └── service/           # Servicios de aplicación
│
├── infrastructure/        # Capa de Infraestructura (Detalles técnicos)
│   ├── persistence/       # Implementaciones de repositorios
│   ├── http/              # Controllers y middlewares HTTP
│   └── external/          # Integraciones externas
│
├── shared/                # Código compartido
│   ├── utils/             # Utilidades
│   └── types/             # Tipos compartidos
│
└── index.ts               # Punto de entrada
```

### Flujo de Datos

```
HTTP Request
    ↓
Controller (Infrastructure)
    ↓
Use Case (Application)
    ↓
Domain Logic (Entities, Aggregates)
    ↓
Repository Interface (Domain)
    ↓
Repository Implementation (Infrastructure)
    ↓
Database
```

## 🧩 Frontend - Arquitectura Modular

```
frontend/src/
├── modules/               # Módulos de negocio independientes
│   ├── restaurants/       # Módulo de Restaurants
│   │   ├── pages/        # Páginas/Vistas
│   │   └── components/   # Componentes específicos
│   ├── orders/           # Módulo de Pedidos
│   ├── auth/             # Módulo de Autenticación
│   └── ...
│
├── shared/               # Componentes y utilities compartidas
│   ├── components/       # Componentes reutilizables
│   ├── hooks/           # Custom React hooks
│   └── ...
│
├── core/                 # Servicios centrales
│   ├── services/        # Servicios de negocio (API calls)
│   └── guards/          # Route guards, interceptores
│
└── App.tsx              # Punto de entrada
```

## 🎯 Conceptos DDD Implementados

### 1. **Entidades (Entities)**
- Tienen identidad única
- Pueden cambiar su estado
- Ejemplo: `Restaurant`, `Order`

```typescript
class Restaurant extends Entity<RestaurantId> {
  // Identidad única
  // Comportamiento y estado
  // Invariantes del negocio
}
```

### 2. **Value Objects**
- Sin identidad propia
- Inmutables
- Comparables por valor
- Ejemplo: `Email`, `Money`, `RestaurantId`

```typescript
class Email extends ValueObject<string> {
  // Solo importa el valor
  // Validación incorporada
}
```

### 3. **Agregados**
- Grupu de entidades relacionadas
- Límites de consistencia transaccional
- Raíz del agregado: `Restaurant`

### 4. **Repositorios**
- Interfaces en dominio (Domain)
- Implementaciones en infraestructura
- Abstracción de persistencia

```typescript
interface IRestaurantRepository {
  save(restaurant: Restaurant): Promise<void>
  findById(id: string): Promise<Restaurant | null>
}
```

### 5. **Casos de Uso**
- Orquestación de la lógica de negocio
- Independientes de detalles técnicos
- Request → Logic → Response

```typescript
class CreateRestaurantUseCase {
  async execute(request: CreateRestaurantDTO): Promise<RestaurantResponseDTO>
}
```

## 🔄 Flujo de Creación de Restaurante (Ejemplo)

1. **Cliente (Frontend)** envía formulario
2. **Controller** recibe HTTP Request
3. **Use Case** orquesta la creación
4. **Entity** ejecuta lógica de dominio
5. **Value Objects** validan conceptos clave
6. **Repository** persiste en BD
7. **DTO** retorna respuesta al cliente

## 🚀 Características del Monolito Modular Evolutivo

### Modular
- Cada módulo es independiente
- Puede escalarse a microservicios después
- Límites claros de responsabilidad

### Evolutivo
- Fácil refactorizar
- Nuevos módulos sin afectar existentes
- Transición suave a microservicios

### Escalable
- Preparado para crecer
- DDD facilita cambios
- Arquitectura hexagonal es flexible

## 📦 Módulos Iniciales

- **Restaurants** - Gestión de restaurantes
- **Orders** - Gestión de pedidos
- **Auth** - Autenticación y autorización
- **Menu** - Gestión de menús
- **Payments** - Procesamiento de pagos
- **Analytics** - Reportes y análisis

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js 18+
- **Lenguaje**: TypeScript
- **Framework**: Express
- **BD**: PostgreSQL (futura)
- **ORM**: Prisma (futuro)
- **DI**: InversifyJS (futuro)
- **Testing**: Vitest

### Frontend
- **Framework**: React 18
- **Build**: Vite
- **Routing**: React Router v6
- **State**: Zustand
- **HTTP**: Axios
- **Styling**: CSS Modules + SASS
- **Testing**: Vitest + React Testing Library

## 📏 Principios de Diseño

1. **Separation of Concerns** - Cada capa tiene responsabilidad clara
2. **Dependency Inversion** - Dependen de abstracciones, no implementaciones
3. **Single Responsibility** - Cada clase una razón para cambiar
4. **Open/Closed** - Abierto para extensión, cerrado para modificación
5. **Liskov Substitution** - Subtipos intercambiables

## 🔐 Invariantes del Negocio (Ejemplos)

- Un email válido para cada restaurante
- Un restaurante solo puede ser creado por su propietario
- States válidos del pedido (pending → confirmed → delivered)
- Precios no negativos (Money > 0)

## 📊 Próximos Pasos

1. ✅ Estructura base
2. ⏳ Implementar autenticación JWT
3. ⏳ Conectar a PostgreSQL con Prisma
4. ⏳ Agregar módulo de Pedidos
5. ⏳ Tests unitarios y de integración
6. ⏳ Documentación OpenAPI/Swagger
7. ⏳ Docker y CI/CD
8. ⏳ Logging y Monitoring

---

**Nota**: Esta arquitectura está diseñada para **evolucionar**. Podemos comenzar como monolito y transicionar a microservicios cuando sea necesario, sin reescribir la lógica de dominio.
