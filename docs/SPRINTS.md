# Plan de Sprints - Resto-Connect

## 📅 Visión de Roadmap (6 Sprints - ~3 meses)

### **Sprint 0: Fundamentos (Completado ✅)**
**Duración**: 1 semana  
**Objetivo**: Establecer arquitectura base y estructura de proyecto

**Tareas**:
- ✅ Estructura hexagonal backend
- ✅ Estructura modular frontend
- ✅ Configuración TypeScript y Build
- ✅ Documentación arquitectónica
- ✅ Domain Map inicial

**Entregables**: Repo con estructura base, documentación

---

## **Sprint 1: Auth & User Management**
**Duración**: 2 semanas  
**Objetivo**: Sistema de autenticación y gestión de usuarios

### Backend Tasks
1. **User Bounded Context**
   - [ ] Entity: `User` con id, email, password, role
   - [ ] Value Objects: `Email`, `Password`, `UserId`
   - [ ] Agregado: `User` con validaciones
   - [ ] Repository: `IUserRepository`

2. **Authentication Use Cases**
   - [ ] `RegisterUserUseCase` - Registro
   - [ ] `LoginUserUseCase` - Login con JWT
   - [ ] `ValidateTokenUseCase` - Validación
   - [ ] `RefreshTokenUseCase` - Renovación

3. **Infrastructure**
   - [ ] JWT middleware
   - [ ] Password hashing (bcrypt)
   - [ ] Auth controller
   - [ ] Protected routes

4. **Database**
   - [ ] Prisma setup
   - [ ] User schema
   - [ ] Migrations

### Frontend Tasks
1. **Auth Module**
   - [ ] LoginPage component
   - [ ] RegisterPage component
   - [ ] AuthController service
   - [ ] useAuthStore hook con Zustand

2. **Auth Guards**
   - [ ] ProtectedRoute component
   - [ ] Redirect a login si no autenticado
   - [ ] Token storage (localStorage)

3. **Navigation**
   - [ ] Navbar con usuario
   - [ ] Logout button
   - [ ] Role display

**Criterios de Aceptación**:
- Usuario puede registrarse
- Usuario puede login con credenciales
- JWT se almacena y valida
- Rutas protegidas reclaman autenticación
- Refresh token funciona

**Métricas**:
- Coverage de tests: >80%
- 0 vulnerabilidades de seguridad

---

## **Sprint 2: Restaurant CRUD Completo**
**Duración**: 2 semanas  
**Objetivo**: Operaciones completas de Restaurants (Create, Read, Update, Delete)

### Backend Tasks
1. **Enhanced Restaurant Bounded Context**
   - [ ] Value Objects: `RestaurantStatus`, `OperatingHours`
   - [ ] Repository methods expand
   - [ ] Add soft delete support

2. **Use Cases**
   - [ ] CreateRestaurantUseCase ✅ (ya existe)
   - [ ] GetRestaurantUseCase ✅ (ya existe)
   - [ ] UpdateRestaurantUseCase
   - [ ] DeleteRestaurantUseCase (soft delete)
   - [ ] ListRestaurantsUseCase (con paginación)
   - [ ] GetRestaurantsByOwnerUseCase

3. **Controllers**
   - [ ] Expand RestaurantController
   - [ ] Input validation DTOs
   - [ ] Error handling

4. **Database**
   - [ ] PostgreSQL migrations para restaurants
   - [ ] Indexes en ownerId, email

### Frontend Tasks
1. **Restaurant Pages**
   - [ ] RestaurantDetailPage
   - [ ] EditRestaurantPage
   - [ ] RestaurantListPage (con paginación)

2. **Components**
   - [ ] RestaurantCard component
   - [ ] RestaurantForm refactor (Create/Edit)
   - [ ] DeleteConfirmation modal

3. **Services**
   - [ ] RestaurantService completo (CRUD)
   - [ ] Error handling y toasts

4. **State**
   - [ ] Expand useRestaurantStore
   - [ ] Pagination logic

**Criterios de Aceptación**:
- CRUD completo funcional
- Validaciones en frontend y backend
- Pérdida de conexión está manejada
- Server-side validation
- User solo ve/modifica sus restaurantes

---

## **Sprint 3: Menu Management**
**Duración**: 2 semanas  
**Objetivo**: Gestión de menús y platos

### Backend Tasks
1. **Menu Bounded Context**
   - [ ] Entities: `Menu`, `Dish`
   - [ ] Value Objects: `DishCategory`, `Price` (Money)
   - [ ] Agregados: `Menu` root aggregate
   - [ ] Repository: `IMenuRepository`, `IDishRepository`

2. **Use Cases**
   - [ ] CreateMenuUseCase
   - [ ] AddDishToMenuUseCase
   - [ ] UpdateDishUseCase
   - [ ] RemoveDishUseCase
   - [ ] GetMenuByRestaurantUseCase

3. **Controllers & Routes**
   - [ ] MenuController
   - [ ] DishController
   - [ ] Routes setup

### Frontend Tasks
1. **Menu Module**
   - [ ] MenuListPage
   - [ ] MenuEditPage
   - [ ] DishForm component
   - [ ] DishCard component

2. **Services**
   - [ ] MenuService
   - [ ] DishService

3. **State**
   - [ ] useMenuStore
   - [ ] useDishStore

**Criterios de Aceptación**:
- Manager puede crear/editar menú
- Platos con precios validados
- UI intuitiva para agregar items
- Categories funcional

---

## **Sprint 4: Order Management (Part 1)**
**Duración**: 2 semanas  
**Objetivo**: Creación y tracking básico de órdenes

### Backend Tasks
1. **Order Bounded Context**
   - [ ] Entities: `Order`, `OrderItem`
   - [ ] Value Objects: `OrderStatus`, `OrderId`
   - [ ] Agregados: `Order` root
   - [ ] Repository: `IOrderRepository`

2. **Use Cases**
   - [ ] CreateOrderUseCase
   - [ ] GetOrderUseCase
   - [ ] ListOrdersUseCase
   - [ ] UpdateOrderStatusUseCase

3. **Business Logic**
   - [ ] Validar items disponibles
   - [ ] Calcular total
   - [ ] State transitions (validar)

### Frontend Tasks
1. **Order Module**
   - [ ] OrderFormPage (crear orden)
   - [ ] OrderListPage
   - [ ] OrderDetailPage
   - [ ] OrderStatusTimeline

2. **Cart Logic**
   - [ ] useCartStore
   - [ ] CartSidebar component

**Criterios de Aceptación**:
- Usuario puede crear orden
- Items validados con menú
- Status visible en tiempo real
- Notificaciones de cambio de estado

---

## **Sprint 5: Payments & Final Polish**
**Duración**: 2 semanas  
**Objetivo**: Procesamiento de pagos e integraciones finales

### Backend Tasks
1. **Payment Bounded Context**
   - [ ] Entities: `Payment`, `Transaction`
   - [ ] Value Objects: `PaymentMethod`, `PaymentStatus`
   - [ ] Use Cases: `ProcessPaymentUseCase`, `RefundUseCase`

2. **Payment Gateway Integration**
   - [ ] Stripe/PayPal integration
   - [ ] Webhook handling

3. **Testing**
   - [ ] Unit tests (alcanzar 80%)
   - [ ] Integration tests para main flows

### Frontend Tasks
1. **Payment Module**
   - [ ] PaymentForm component
   - [ ] Stripe integration
   - [ ] Order confirmation page

2. **Polish**
   - [ ] Error pages (404, 500)
   - [ ] Loading states
   - [ ] Toast notifications
   - [ ] Responsive design

3. **Analytics Dashboard** (básico)
   - [ ] Dashboard page
   - [ ] KPI cards
   - [ ] Charts with recharts

**Criterios de Aceptación**:
- Pagos procesados correctamente
- Manejo de errores
- UX pulida
- Responsive en mobile

---

## **Sprint 6: Delivery & DevOps** (Opcional - puede ir al siguiente ciclo)
**Duración**: 2 semanas  
**Objetivo**: Setup de deploying y preparar para producción

### Backend Tasks
1. [ ] Docker setup
2. [ ] PostgreSQL containerized
3. [ ] Environment configs (dev, staging, prod)
4. [ ] Logging y monitoring (Winston, Sentry)
5. [ ] Rate limiting

### DevOps & Deployment
1. [ ] GitHub Actions CI/CD
2. [ ] Tests automated
3. [ ] Deploy a Heroku/AWS
4. [ ] Database migrations automated
5. [ ] Backup strategy

### Frontend Tasks
1. [ ] Build optimization
2. [ ] SEO optimization
3. [ ] Performance monitoring
4. [ ] Deploy a Vercel/Netlify

---

## 📊 Timeline Visual

```
Week 1    [Sprint 0: Fundamentos] ✅
Week 2-3  [Sprint 1: Auth]
Week 4-5  [Sprint 2: Restaurant CRUD]
Week 6-7  [Sprint 3: Menu Management]
Week 8-9  [Sprint 4: Orders]
Week 10-11 [Sprint 5: Payments & Polish]
Week 12-13 [Sprint 6: DevOps & Deploy]
```

---

## 🎯 Principios de Desarrollo

1. **Test-Driven Development** (TDD)
   - Tests primero para use cases
   - Coverage mínimo 80%

2. **Continuous Integration**
   - Tests automáticos en PR
   - Linting en cada commit

3. **Domain-Driven Design**
   - Mantener límites claros
   - Validaciones en dominio
   - Eventos de dominio cuando sea necesario

4. **Code Review**
   - 2 approvals antes de merge
   - Focus en arquitectura y DDD

5. **Documentation**
   - README en cada módulo
   - Comments para lógica compleja
   - OpenAPI docs

---

## 📝 Notas

- Sprints son **iterativos** - se pueden ajustar según feedback
- Cada sprint entrega **valor tangible**
- **Retrospectivas** al final de cada sprint
- Canales de comunicación: GitHub Issues, PR discussions
- **Definition of Done**: Tests + Docs + Code Review

---

**Próximo**: Comenzar Sprint 1 - Auth & User Management
