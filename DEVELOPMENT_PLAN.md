# 📋 Plan Detallado de Desarrollo Resto-Connect - Sprint 4 en Adelante

**Fecha:** Abril 14, 2026  
**Estado Actual:** Sprints 0-3 COMPLETADOS ✅ | Servidores en ejecución  
**Próximo Objetivo:** Sprint 4 - Order Management System  

---

## 📊 Estado Actual del Proyecto

### ✅ COMPLETADO
- **Sprint 0**: Fundamentos (Arquitectura Hexagonal, Estructura Modular)
- **Sprint 1**: Auth & User Management (JWT, Registro, Login)
- **Sprint 2**: Restaurant CRUD (Create, Read, Update, Delete, List con Paginación)
- **Sprint 3**: Menu Management (Menús, Items, Categorías, Precios)

### 🔄 EN PROGRESO
- **Desarrollo:** Ambos servidores corriendo (Backend: 3000, Frontend: 3001)
- **Dependencias:** Todas instaladas (Backend: 290 pkg, Frontend: 234 pkg)
- **Build:** Sin errores de compilación

### ⏳ POR HACER
- **Sprint 4**: Order Management - PRÓXIMO
- **Sprint 5**: Order Fulfillment & Payments
- **Sprint 6**: Analytics & Reports

---

## 🎯 SPRINT 4: ORDER MANAGEMENT SYSTEM

**Duración Estimada:** 2-3 semanas  
**Objetivo Principal:** Crear sistema completo de órdenes con validación, estado y tracking básico

### 📋 Fase 1: Diseño del Bounded Context de Órdenes (Día 1-2)

#### Tareas:

1. **Crear Documentación de Diseño** `docs/ORDER_DESIGN.md`
   ```
   Contenido:
   - Diagrama de agregados (Order es root, OrderItem es child)
   - Estados de órdenes: Pending → Confirmed → Preparing → Ready → Completed
   - Transiciones válidas entre estados
   - Validaciones de negocio
   - Relaciones con otros contextos (Menu, Restaurant, User)
   - Schema de datos esperado
   ```

2. **Definir Value Objects Necesarios**
   - `OrderId` - UUID único para cada orden
   - `OrderStatus` - Enum: PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED
   - `OrderItemId` - Identificador para items dentro de orden
   - `OrderTotal` - Encapsula cálculos de total con validación

3. **Definir Domain Events** (preparación futura para event sourcing)
   ```typescript
   // tipos
   - OrderCreatedEvent
   - OrderConfirmedEvent
   - OrderStatusChangedEvent
   - OrderCancelledEvent
   ```

### 📦 Fase 2: Backend - Domain Layer (Día 3-4)

#### Location: `src/domain/`

**Archivo 1: `value-objects/OrderId.ts`**
```typescript
export class OrderId {
  readonly value: string;

  private constructor(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('OrderId cannot be empty');
    }
    this.value = value;
  }

  static create(): OrderId {
    return new OrderId(generateUUID());
  }

  static fromString(value: string): OrderId {
    return new OrderId(value);
  }

  equals(other: OrderId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

**Archivo 2: `value-objects/OrderStatus.ts`**
```typescript
export enum OrderStatusEnum {
  PENDING = 'PENDING',        // Recién creada, no confirmada
  CONFIRMED = 'CONFIRMED',    // Cliente confirmó, esperando kitchen
  PREPARING = 'PREPARING',    // Kitchen está preparando
  READY = 'READY',            // Lista para entrega
  COMPLETED = 'COMPLETED',    // Completada y entregada
  CANCELLED = 'CANCELLED'     // Cancelada por cualquier razón
}

export class OrderStatus {
  readonly value: OrderStatusEnum;

  // Validar transiciones permitidas
  static VALID_TRANSITIONS: Record<OrderStatusEnum, OrderStatusEnum[]> = {
    [OrderStatusEnum.PENDING]: [OrderStatusEnum.CONFIRMED, OrderStatusEnum.CANCELLED],
    [OrderStatusEnum.CONFIRMED]: [OrderStatusEnum.PREPARING, OrderStatusEnum.CANCELLED],
    [OrderStatusEnum.PREPARING]: [OrderStatusEnum.READY, OrderStatusEnum.CANCELLED],
    [OrderStatusEnum.READY]: [OrderStatusEnum.COMPLETED],
    [OrderStatusEnum.COMPLETED]: [],
    [OrderStatusEnum.CANCELLED]: []
  };

  constructor(value: OrderStatusEnum) {
    this.value = value;
  }

  canTransitionTo(nextStatus: OrderStatus): boolean {
    const validTransitions = OrderStatus.VALID_TRANSITIONS[this.value];
    return validTransitions.includes(nextStatus.value);
  }

  static createPending(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.PENDING);
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

**Archivo 3: `value-objects/OrderItem.ts`**
```typescript
// Similar a MenuItem pero específico para órdenes
export class OrderItem {
  readonly menuItemId: string;      // Referencia al MenuItem original
  readonly name: string;             // Copia del nombre (para histórico)
  readonly description: string;      // Copia de descripción
  readonly price: number;           // Precio en el momento de orden (por si cambió)
  readonly quantity: number;        // Cantidad solicitada
  readonly category: string;        // Categoría del item
  readonly specialInstructions?: string; // "Sin cebolla", "Extra spicy", etc.

  constructor(
    menuItemId: string,
    name: string,
    description: string,
    price: number,
    quantity: number,
    category: string,
    specialInstructions?: string
  ) {
    if (quantity <= 0) {
      throw new Error('Order item quantity must be greater than 0');
    }
    if (price < 0) {
      throw new Error('Order item price cannot be negative');
    }
    this.menuItemId = menuItemId;
    this.name = name;
    this.description = description;
    this.price = price;
    this.quantity = quantity;
    this.category = category;
    this.specialInstructions = specialInstructions;
  }

  // Retorna el subtotal para este item
  getSubtotal(): number {
    return this.price * this.quantity;
  }

  // Crear desde MenuItem para mantener histórico
  static fromMenuItem(
    menuItem: MenuItem,
    quantity: number,
    specialInstructions?: string
  ): OrderItem {
    return new OrderItem(
      'id-del-menu-item', // Necesitaremos pasar esto
      menuItem.name,
      menuItem.description,
      menuItem.price,
      quantity,
      menuItem.category,
      specialInstructions
    );
  }
}
```

**Archivo 4: `value-objects/OrderTotal.ts`**
```typescript
export class OrderTotal {
  readonly subtotal: number;    // Suma de items
  readonly taxPercentage: number; // 10% por defecto
  readonly tax: number;         // Monto calculado del impuesto
  readonly total: number;       // Subtotal + tax

  constructor(subtotal: number, taxPercentage: number = 10) {
    if (subtotal < 0) {
      throw new Error('Subtotal cannot be negative');
    }
    if (taxPercentage < 0 || taxPercentage > 100) {
      throw new Error('Tax percentage must be between 0 and 100');
    }

    this.subtotal = subtotal;
    this.taxPercentage = taxPercentage;
    this.tax = (subtotal * taxPercentage) / 100;
    this.total = subtotal + this.tax;
  }

  static fromItems(items: OrderItem[]): OrderTotal {
    const subtotal = items.reduce((sum, item) => sum + item.getSubtotal(), 0);
    return new OrderTotal(subtotal);
  }

  equals(other: OrderTotal): boolean {
    return (
      this.subtotal === other.subtotal &&
      this.taxPercentage === other.taxPercentage &&
      this.total === other.total
    );
  }
}
```

**Archivo 5: `aggregates/Order.ts`** (AGGREGATE ROOT)
```typescript
export class Order {
  readonly id: OrderId;
  readonly restaurantId: RestaurantId;
  readonly customerId: UserId;
  readonly items: OrderItem[];
  readonly status: OrderStatus;
  readonly total: OrderTotal;
  readonly notes?: string;           // Notas especiales del cliente
  readonly estimatedTime?: number;   // Minutos estimados de preparación
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(
    id: OrderId,
    restaurantId: RestaurantId,
    customerId: UserId,
    items: OrderItem[],
    status: OrderStatus,
    total: OrderTotal,
    notes?: string,
    estimatedTime?: number,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    if (items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    this.id = id;
    this.restaurantId = restaurantId;
    this.customerId = customerId;
    this.items = items;
    this.status = status;
    this.total = total;
    this.notes = notes;
    this.estimatedTime = estimatedTime;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  // Factory: Crear nueva orden
  static createNew(
    restaurantId: RestaurantId,
    customerId: UserId,
    items: OrderItem[],
    notes?: string,
    estimatedTime: number = 30
  ): Order {
    const total = OrderTotal.fromItems(items);
    return new Order(
      OrderId.create(),
      restaurantId,
      customerId,
      items,
      OrderStatus.createPending(),
      total,
      notes,
      estimatedTime
    );
  }

  // Cambiadores de estado
  confirm(): void {
    const nextStatus = new OrderStatus(OrderStatusEnum.CONFIRMED);
    if (!this.status.canTransitionTo(nextStatus)) {
      throw new Error(`Cannot transition from ${this.status.value} to CONFIRMED`);
    }
    // this.status = nextStatus;  // En realidad esto es inmutable, retornaríamos new Order
  }

  changeStatus(newStatus: OrderStatus): Order {
    if (!this.status.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this.status.value} to ${newStatus.value}`
      );
    }

    return new Order(
      this.id,
      this.restaurantId,
      this.customerId,
      this.items,
      newStatus,
      this.total,
      this.notes,
      this.estimatedTime,
      this.createdAt,
      new Date() // Actualizar updatedAt
    );
  }

  // Métodos de consulta
  isCompleted(): boolean {
    return this.status.value === OrderStatusEnum.COMPLETED;
  }

  isCancelled(): boolean {
    return this.status.value === OrderStatusEnum.CANCELLED;
  }

  canBeCancelled(): boolean {
    return [
      OrderStatusEnum.PENDING,
      OrderStatusEnum.CONFIRMED
    ].includes(this.status.value);
  }

  getItemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  // Duplicar orden (para re-ordenes)
  duplicate(): Order {
    return Order.createNew(
      this.restaurantId,
      this.customerId,
      this.items,
      this.notes,
      this.estimatedTime
    );
  }
}
```

**Archivo 6: `aggregates/IOrderRepository.ts`**
```typescript
export interface IOrderRepository {
  // CRUD básico
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  update(order: Order): Promise<void>;
  deleteById(id: OrderId): Promise<void>;

  // Queries específicas
  findByRestaurantId(
    restaurantId: RestaurantId,
    page?: number,
    limit?: number
  ): Promise<{ data: Order[]; pagination: Pagination }>;

  findByCustomerId(
    customerId: UserId,
    page?: number,
    limit?: number
  ): Promise<{ data: Order[]; pagination: Pagination }>;

  findByRestaurantIdAndStatus(
    restaurantId: RestaurantId,
    status: OrderStatus
  ): Promise<Order[]>;

  findByCustomerIdAndStatus(
    customerId: UserId,
    status: OrderStatus
  ): Promise<Order[]>;

  // Analytics
  findAllByDateRange(
    startDate: Date,
    endDate: Date,
    restaurantId?: RestaurantId
  ): Promise<Order[]>;

  countByStatus(
    restaurantId: RestaurantId,
    status: OrderStatus
  ): Promise<number>;
}
```

### 🏗️ Fase 3: Backend - Application Layer (Día 5-6)

#### Location: `src/application/`

**Archivo 1: `dtos/OrderDTO.ts`**
```typescript
export class CreateOrderDTO {
  restaurantId: string;
  customerId: string;
  items: CreateOrderItemDTO[];
  notes?: string;
  estimatedTime?: number;
}

export class CreateOrderItemDTO {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
}

export class UpdateOrderStatusDTO {
  orderId: string;
  newStatus: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
}

export class OrderResponseDTO {
  id: string;
  restaurantId: string;
  customerId: string;
  status: string;
  items: OrderItemResponseDTO[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  estimatedTime?: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderItemResponseDTO {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  category: string;
  specialInstructions?: string;
}

export class OrderListResponseDTO {
  data: OrderResponseDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

**Archivo 2: `use-cases/CreateOrderUseCase.ts`**
```typescript
export class CreateOrderUseCase implements IUseCase<CreateOrderDTO, OrderResponseDTO> {
  constructor(
    private orderRepository: IOrderRepository,
    private menuRepository: IMenuRepository,
    private restaurantRepository: IRestaurantRepository
  ) {}

  async execute(input: CreateOrderDTO): Promise<OrderResponseDTO> {
    // 1. Validar que restaurant existe
    const restaurant = await this.restaurantRepository.findById(
      RestaurantId.fromString(input.restaurantId)
    );
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    // 2. Validar que customer existe
    const customer = await userRepository.findById(
      UserId.fromString(input.customerId)
    );
    if (!customer) {
      throw new Error('Customer not found');
    }

    // 3. Validar items: que existan en el menú y estén disponibles
    const menu = await this.menuRepository.findByRestaurantId(restaurant.id);
    if (!menu) {
      throw new Error('Restaurant has no menu');
    }

    const orderItems: OrderItem[] = [];
    for (const itemInput of input.items) {
      const menuItem = menu.getItems().find(item => item.id === itemInput.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item ${itemInput.menuItemId} not found`);
      }
      if (!menuItem.available) {
        throw new Error(`Menu item ${menuItem.name} is not available`);
      }

      orderItems.push(
        new OrderItem(
          itemInput.menuItemId,
          menuItem.name,
          menuItem.description || '',
          menuItem.price,
          itemInput.quantity,
          menuItem.category,
          itemInput.specialInstructions
        )
      );
    }

    // 4. Crear orden
    const order = Order.createNew(
      restaurant.id,
      customer.id,
      orderItems,
      input.notes,
      input.estimatedTime
    );

    // 5. Guardar
    await this.orderRepository.save(order);

    // 6. Retornar DTO
    return OrderResponseDTO.fromOrder(order);
  }
}
```

**Archivo 3: `use-cases/GetOrderUseCase.ts`**
```typescript
export class GetOrderUseCase implements IUseCase<{ orderId: string }, OrderResponseDTO> {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(input: { orderId: string }): Promise<OrderResponseDTO> {
    const order = await this.orderRepository.findById(OrderId.fromString(input.orderId));

    if (!order) {
      throw new Error('Order not found');
    }

    return OrderResponseDTO.fromOrder(order);
  }
}
```

**Archivo 4: `use-cases/ListOrdersByRestaurantUseCase.ts`**
```typescript
export class ListOrdersByRestaurantUseCase
  implements IUseCase<{ restaurantId: string; page?: number; limit?: number }, OrderListResponseDTO>
{
  constructor(private orderRepository: IOrderRepository) {}

  async execute(input: {
    restaurantId: string;
    page?: number;
    limit?: number;
  }): Promise<OrderListResponseDTO> {
    const result = await this.orderRepository.findByRestaurantId(
      RestaurantId.fromString(input.restaurantId),
      input.page || 1,
      input.limit || 10
    );

    return new OrderListResponseDTO(
      result.data.map(order => OrderResponseDTO.fromOrder(order)),
      result.pagination
    );
  }
}
```

**Archivo 5: `use-cases/ListOrdersByCustomerUseCase.ts`**
```typescript
export class ListOrdersByCustomerUseCase
  implements IUseCase<{ customerId: string; page?: number; limit?: number }, OrderListResponseDTO>
{
  constructor(private orderRepository: IOrderRepository) {}

  async execute(input: {
    customerId: string;
    page?: number;
    limit?: number;
  }): Promise<OrderListResponseDTO> {
    const result = await this.orderRepository.findByCustomerId(
      UserId.fromString(input.customerId),
      input.page || 1,
      input.limit || 10
    );

    return new OrderListResponseDTO(
      result.data.map(order => OrderResponseDTO.fromOrder(order)),
      result.pagination
    );
  }
}
```

**Archivo 6: `use-cases/UpdateOrderStatusUseCase.ts`**
```typescript
export class UpdateOrderStatusUseCase
  implements IUseCase<UpdateOrderStatusDTO, OrderResponseDTO>
{
  constructor(private orderRepository: IOrderRepository) {}

  async execute(input: UpdateOrderStatusDTO): Promise<OrderResponseDTO> {
    const order = await this.orderRepository.findById(OrderId.fromString(input.orderId));

    if (!order) {
      throw new Error('Order not found');
    }

    const newStatus = new OrderStatus(input.newStatus as OrderStatusEnum);
    const updatedOrder = order.changeStatus(newStatus);

    await this.orderRepository.update(updatedOrder);

    return OrderResponseDTO.fromOrder(updatedOrder);
  }
}
```

**Archivo 7: `use-cases/CancelOrderUseCase.ts`**
```typescript
export class CancelOrderUseCase implements IUseCase<{ orderId: string }, OrderResponseDTO> {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(input: { orderId: string }): Promise<OrderResponseDTO> {
    const order = await this.orderRepository.findById(OrderId.fromString(input.orderId));

    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.canBeCancelled()) {
      throw new Error(
        `Cannot cancel order with status ${order.status.value}`
      );
    }

    const cancelledOrder = order.changeStatus(
      new OrderStatus(OrderStatusEnum.CANCELLED)
    );

    await this.orderRepository.update(cancelledOrder);

    return OrderResponseDTO.fromOrder(cancelledOrder);
  }
}
```

### 🔧 Fase 4: Backend - Infrastructure Layer (Día 7-8)

#### Location: `src/infrastructure/`

**Archivo 1: `persistence/repositories/InMemoryOrderRepository.ts`**
```typescript
export class InMemoryOrderRepository implements IOrderRepository {
  private orders = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id.toString(), order);
  }

  async findById(id: OrderId): Promise<Order | null> {
    return this.orders.get(id.toString()) || null;
  }

  async update(order: Order): Promise<void> {
    if (!this.orders.has(order.id.toString())) {
      throw new Error('Order not found');
    }
    this.orders.set(order.id.toString(), order);
  }

  async deleteById(id: OrderId): Promise<void> {
    this.orders.delete(id.toString());
  }

  async findByRestaurantId(
    restaurantId: RestaurantId,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Order[]; pagination: Pagination }> {
    const allOrders = Array.from(this.orders.values()).filter(
      order => order.restaurantId.equals(restaurantId)
    );

    const total = allOrders.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = allOrders.slice(start, start + limit);

    return {
      data,
      pagination: { page, limit, total, pages }
    };
  }

  async findByCustomerId(
    customerId: UserId,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Order[]; pagination: Pagination }> {
    const allOrders = Array.from(this.orders.values()).filter(
      order => order.customerId.equals(customerId)
    );

    const total = allOrders.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = allOrders.slice(start, start + limit);

    return {
      data,
      pagination: { page, limit, total, pages }
    };
  }

  async findByRestaurantIdAndStatus(
    restaurantId: RestaurantId,
    status: OrderStatus
  ): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order =>
        order.restaurantId.equals(restaurantId) && order.status.equals(status)
    );
  }

  async findByCustomerIdAndStatus(
    customerId: UserId,
    status: OrderStatus
  ): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order =>
        order.customerId.equals(customerId) && order.status.equals(status)
    );
  }

  async findAllByDateRange(
    startDate: Date,
    endDate: Date,
    restaurantId?: RestaurantId
  ): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => {
      const inDateRange =
        order.createdAt >= startDate && order.createdAt <= endDate;
      if (restaurantId) {
        return inDateRange && order.restaurantId.equals(restaurantId);
      }
      return inDateRange;
    });
  }

  async countByStatus(
    restaurantId: RestaurantId,
    status: OrderStatus
  ): Promise<number> {
    return (
      await this.findByRestaurantIdAndStatus(restaurantId, status)
    ).length;
  }
}
```

**Archivo 2: `http/controllers/OrderController.ts`**
```typescript
export class OrderController {
  constructor(
    private createOrderUseCase: CreateOrderUseCase,
    private getOrderUseCase: GetOrderUseCase,
    private listOrdersByRestaurantUseCase: ListOrdersByRestaurantUseCase,
    private listOrdersByCustomerUseCase: ListOrdersByCustomerUseCase,
    private updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private cancelOrderUseCase: CancelOrderUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createOrderUseCase.execute(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getOrderUseCase.execute({
        orderId: req.params.orderId
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async listByRestaurant(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.listOrdersByRestaurantUseCase.execute({
        restaurantId: req.params.restaurantId,
        page,
        limit
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async listByCustomer(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.user?.id; // Asumiendo que auth middleware pone user en req

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const result = await this.listOrdersByCustomerUseCase.execute({
        customerId: userId,
        page,
        limit
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.updateOrderStatusUseCase.execute({
        orderId: req.params.orderId,
        newStatus: req.body.newStatus
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.cancelOrderUseCase.execute({
        orderId: req.params.orderId
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
```

**Archivo 3: `http/routes/orderRoutes.ts`**
```typescript
export function setupOrderRoutes(
  router: Router,
  orderController: OrderController,
  authMiddleware: AuthMiddleware
) {
  // Crear orden (cliente autenticado)
  router.post(
    '/orders',
    authMiddleware.authenticate(),
    (req, res) => orderController.create(req, res)
  );

  // Obtener orden por ID
  router.get(
    '/orders/:orderId',
    authMiddleware.authenticate(),
    (req, res) => orderController.getById(req, res)
  );

  // Listar órdenes del cliente actual
  router.get(
    '/orders/customer/my-orders',
    authMiddleware.authenticate(),
    (req, res) => orderController.listByCustomer(req, res)
  );

  // Listar órdenes de un restaurante (propietario/admin)
  router.get(
    '/orders/restaurant/:restaurantId',
    authMiddleware.authenticate(),
    (req, res) => orderController.listByRestaurant(req, res)
  );

  // Actualizar estado de orden (propietario/admin)
  router.put(
    '/orders/:orderId/status',
    authMiddleware.authenticate(),
    (req, res) => orderController.updateStatus(req, res)
  );

  // Cancelar orden (cliente antes de confirmar)
  router.delete(
    '/orders/:orderId',
    authMiddleware.authenticate(),
    (req, res) => orderController.cancel(req, res)
  );
}
```

**Archivo 4: `index.ts` - Registrar rutas de órdenes**
```typescript
// En el main setup:
const orderRepository = new InMemoryOrderRepository();
const createOrderUseCase = new CreateOrderUseCase(
  orderRepository,
  menuRepository,
  restaurantRepository
);
const getOrderUseCase = new GetOrderUseCase(orderRepository);
const listOrdersByRestaurantUseCase = new ListOrdersByRestaurantUseCase(orderRepository);
const listOrdersByCustomerUseCase = new ListOrdersByCustomerUseCase(orderRepository);
const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);
const cancelOrderUseCase = new CancelOrderUseCase(orderRepository);

const orderController = new OrderController(
  createOrderUseCase,
  getOrderUseCase,
  listOrdersByRestaurantUseCase,
  listOrdersByCustomerUseCase,
  updateOrderStatusUseCase,
  cancelOrderUseCase
);

// Registrar rutas
setupOrderRoutes(app, orderController, authMiddleware);
```

### 🎨 Fase 5: Frontend - Services (Día 9)

#### Location: `src/core/services/`

**Archivo: `OrderService.ts`**
```typescript
export class OrderService {
  private static API_URL = '/api/orders';

  static async createOrder(restaurantId: string, items: OrderItemInput[], notes?: string) {
    const response = await fetch(`${this.API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${useAuthStore.getState().token}`
      },
      body: JSON.stringify({
        restaurantId,
        customerId: useAuthStore.getState().user?.id, // Se obtiene del auth store
        items,
        notes
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    return response.json();
  }

  static async getOrder(orderId: string) {
    const response = await fetch(`${this.API_URL}/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Order not found`);
    }

    return response.json();
  }

  static async listMyOrders(page = 1, limit = 10) {
    const response = await fetch(
      `${this.API_URL}/customer/my-orders?page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return response.json();
  }

  static async listRestaurantOrders(restaurantId: string, page = 1, limit = 10) {
    const response = await fetch(
      `${this.API_URL}/restaurant/${restaurantId}?page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch restaurant orders');
    }

    return response.json();
  }

  static async updateOrderStatus(orderId: string, newStatus: string) {
    const response = await fetch(`${this.API_URL}/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${useAuthStore.getState().token}`
      },
      body: JSON.stringify({ newStatus })
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    return response.json();
  }

  static async cancelOrder(orderId: string) {
    const response = await fetch(`${this.API_URL}/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to cancel order');
    }

    return response.json();
  }
}
```

### 📦 Fase 6: Frontend - Store (Zustand) (Día 9)

#### Location: `src/shared/hooks/`

**Archivo: `useOrderStore.ts`**
```typescript
interface OrderState {
  // State
  orders: Order[];
  currentOrder: Order | null;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;

  // Actions
  createOrder: (restaurantId: string, items: OrderItemInput[]) => Promise<void>;
  getOrder: (orderId: string) => Promise<void>;
  listMyOrders: (page: number, limit: number) => Promise<void>;
  listRestaurantOrders: (restaurantId: string, page: number, limit: number) => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  setPage: (page: number, restaurantId?: string) => Promise<void>;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  // Initial State
  orders: [],
  currentOrder: null,
  pagination: null,
  loading: false,
  error: null,

  // Actions
  createOrder: async (restaurantId: string, items: OrderItemInput[]) => {
    set({ loading: true, error: null });
    try {
      const response = await OrderService.createOrder(restaurantId, items);
      set(state => ({
        orders: [response.data, ...state.orders],
        currentOrder: response.data,
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getOrder: async (orderId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await OrderService.getOrder(orderId);
      set({ currentOrder: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  listMyOrders: async (page: number = 1, limit: number = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await OrderService.listMyOrders(page, limit);
      set({
        orders: response.data,
        pagination: response.pagination,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  listRestaurantOrders: async (restaurantId: string, page: number = 1, limit: number = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await OrderService.listRestaurantOrders(restaurantId, page, limit);
      set({
        orders: response.data,
        pagination: response.pagination,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateOrderStatus: async (orderId: string, newStatus: string) => {
    set({ loading: true, error: null });
    try {
      const response = await OrderService.updateOrderStatus(orderId, newStatus);
      set(state => ({
        orders: state.orders.map(order =>
          order.id === response.data.id ? response.data : order
        ),
        currentOrder: response.data,
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  cancelOrder: async (orderId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await OrderService.cancelOrder(orderId);
      set(state => ({
        orders: state.orders.map(order =>
          order.id === response.data.id ? response.data : order
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setPage: async (page: number, restaurantId?: string) => {
    if (restaurantId) {
      await useOrderStore.getState().listRestaurantOrders(restaurantId, page, 10);
    } else {
      await useOrderStore.getState().listMyOrders(page, 10);
    }
  },

  clearError: () => set({ error: null })
}));
```

### 🎨 Fase 7: Frontend - Components & Pages (Día 10-12)

#### Location: `src/modules/orders/`

**Estructura de carpetas:**
```
src/modules/orders/
├── pages/
│   ├── OrdersListPage.tsx          // Mis órdenes (cliente)
│   ├── OrderDetailPage.tsx         // Detalle de orden
│   ├── CreateOrderPage.tsx         // Crear orden (desde restaurante)
│   ├── RestaurantOrdersPage.tsx    // Ver órdenes del restaurante (admin)
│   └── OrderTrackingPage.tsx       // Tracking en tiempo real
├── components/
│   ├── OrderForm.tsx               // Formulario para crear orden
│   ├── OrderCard.tsx               // Tarjeta de orden resumida
│   ├── OrderDetail.tsx             // Detalle completo
│   ├── OrderStatusBadge.tsx        // Badge con estado
│   ├── OrderTimeline.tsx           // Timeline de cambios de estado
│   ├── OrderItemsList.tsx          // Lista de items en orden
│   └── OrderStatusUpdater.tsx      // Control para cambiar estado
└── styles/
    ├── OrderForm.css
    ├── OrderList.css
    ├── OrderDetail.css
    └── OrderTracking.css
```

**Archivo 1: `OrderCard.tsx`**
```typescript
export const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="order-card">
      <div className="order-header">
        <h3>Order #{order.id.slice(0, 8)}</h3>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="order-info">
        <p>
          <strong>Items:</strong> {order.itemCount}
        </p>
        <p>
          <strong>Total:</strong> ${order.total.toFixed(2)}
        </p>
        <p>
          <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      <button
        className="btn-primary"
        onClick={() => navigate(`/orders/${order.id}`)}
      >
        View Details
      </button>
    </div>
  );
};
```

**Archivo 2: `OrderStatusBadge.tsx`**
```typescript
export const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    PENDING: { color: 'yellow', label: 'Pending' },
    CONFIRMED: { color: 'blue', label: 'Confirmed' },
    PREPARING: { color: 'orange', label: 'Preparing' },
    READY: { color: 'green', label: 'Ready' },
    COMPLETED: { color: 'gray', label: 'Completed' },
    CANCELLED: { color: 'red', label: 'Cancelled' }
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`status-badge status-${config.color.toLowerCase()}`}>
      {config.label}
    </span>
  );
};
```

**Archivo 3: `OrderForm.tsx`**
```typescript
export const OrderForm: React.FC<{ restaurantId: string }> = ({ restaurantId }) => {
  const navigate = useNavigate();
  const { createOrder, error, loading } = useOrderStore();
  const { menu } = useMenuStore();
  const [items, setItems] = useState<OrderItemInput[]>([]);
  const [notes, setNotes] = useState('');

  const handleAddItem = (menuItemId: string, quantity: number) => {
    setItems(prevItems => {
      const existing = prevItems.find(item => item.menuItemId === menuItemId);
      if (existing) {
        return prevItems.map(item =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { menuItemId, quantity }];
    });
  };

  const handleRemoveItem = (menuItemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.menuItemId !== menuItemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      await createOrder(restaurantId, items, notes || undefined);
      navigate('/my-orders');
    } catch (error) {
      // Error ya está en store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="order-form">
      <h2>Create Order</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-section">
        <h3>Select Items</h3>
        {menu?.items.map(item => (
          <div key={item.id} className="menu-item-selector">
            <span>{item.name} - ${item.price}</span>
            <input
              type="number"
              min="0"
              max="99"
              defaultValue="0"
              onChange={e => {
                const qty = parseInt(e.target.value);
                if (qty > 0) {
                  handleAddItem(item.id, qty);
                } else {
                  handleRemoveItem(item.id);
                }
              }}
            />
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="form-section">
          <h3>Order Summary</h3>
          <OrderItemsList items={items} />
        </div>
      )}

      <div className="form-group">
        <label>Special Instructions</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any special requests?"
        />
      </div>

      <button type="submit" disabled={loading || items.length === 0}>
        {loading ? 'Creating...' : 'Place Order'}
      </button>
    </form>
  );
};
```

**Archivo 4: `pages/OrdersListPage.tsx`**
```typescript
export const OrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, pagination, loading, listMyOrders, setPage } = useOrderStore();
  const currentPage = pagination?.page || 1;

  useEffect(() => {
    listMyOrders(1, 10);
  }, [listMyOrders]);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="orders-list-page">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders yet</p>
          <button onClick={() => navigate('/restaurants')}>
            Browse Restaurants
          </button>
        </div>
      ) : (
        <>
          <div className="orders-grid">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {pagination.pages}
              </span>
              <button
                disabled={currentPage === pagination.pages}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
```

**Archivo 5: `pages/RestaurantOrdersPage.tsx`**
```typescript
export const RestaurantOrdersPage: React.FC = () => {
  const params = useParams<{ restaurantId: string }>();
  const { orders, pagination, loading, listRestaurantOrders, setPage } = useOrderStore();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    if (params.restaurantId) {
      listRestaurantOrders(params.restaurantId, 1, 10);
    }
  }, [params.restaurantId, listRestaurantOrders]);

  const filteredOrders = filterStatus
    ? orders.filter(order => order.status === filterStatus)
    : orders;

  return (
    <div className="restaurant-orders-page">
      <h1>Restaurant Orders</h1>

      <div className="filters">
        <button
          className={!filterStatus ? 'active' : ''}
          onClick={() => setFilterStatus(null)}
        >
          All
        </button>
        {['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].map(status => (
          <button
            key={status}
            className={filterStatus === status ? 'active' : ''}
            onClick={() => setFilterStatus(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div>Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">No orders with this status</div>
      ) : (
        <>
          <div className="orders-list">
            {filteredOrders.map(order => (
              <OrderDetailRow key={order.id} order={order} />
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              {/* Pagination controls... */}
            </div>
          )}
        </>
      )}
    </div>
  );
};
```

### 🎭 Fase 8: Frontend - Routing (Día 13)

**Actualizar `src/App.tsx`:**
```typescript
<Routes>
  {/* ... existing routes ... */}

  {/* Orders Routes */}
  <Route path="/my-orders" element={<OrdersListPage />} />
  <Route path="/orders/:orderId" element={<OrderDetailPage />} />
  <Route path="/restaurant/:restaurantId/orders" element={<RestaurantOrdersPage />} />
  <Route path="/restaurant/:restaurantId/create-order" element={<CreateOrderPage />} />
  <Route path="/orders/:orderId/tracking" element={<OrderTrackingPage />} />
</Routes>
```

### 🧪 Fase 9: Testing & Debugging (Día 14-15)

**Testing Checklist:**

1. **Backend Testing**
   - [ ] Crear orden con items válidos
   - [ ] Intentar crear orden con restaurante inválido
   - [ ] Intentar crear orden con items no disponibles
   - [ ] Validar transiciones de estado
   - [ ] Intentar cancelar orden en estado no permitido
   - [ ] Testear paginación en listados
   - [ ] Validar cálculo de totales con impuestos

2. **Frontend Testing**
   - [ ] Form se llena correctamente
   - [ ] Items se agregan/quitan del carrito
   - [ ] Total se calcula correctamente
   - [ ] Orden se crea y redirige
   - [ ] Listado muestra órdenes con paginación
   - [ ] Estado se actualiza en tiempo real
   - [ ] Errores se muestran al usuario

3. **Integration Testing**
   - [ ] Crear orden desde frontend → aparece en backend
   - [ ] Cambiar estado en backend → se refleja en frontend
   - [ ] Autenticación requerida para todas las operaciones
   - [ ] Propietario solo ve sus órdenes

---

## 🎯 SPRINT 5: ORDER FULFILLMENT & PAYMENTS

**Duración Estimada:** 2-3 semanas  
**Objetivo:** Agregar sistema de pagos y cumplimiento de órdenes

### Tareas Principales:

1. **Payment Integration**
   - Integrar Stripe o PayPal
   - Payment Domain Entity
   - PaymentUseCase
   - Payment status tracking (Pending, Processed, Failed, Refunded)

2. **Order Fulfillment**
   - Tiempo estimado por restaurante
   - Notificaciones cuando orden está lista
   - Entrega/Recolección
   - Rating & Review system

3. **Customer Notifications**
   - Email cuando orden es creada
   - Email cuando cambia estado
   - Push notifications (opcional)
   - SMS tracking (opcional)

---

## 🔍 SPRINT 6: ANALYTICS & REPORTS

**Duración Estimada:** 2 semanas  
**Objetivo:** Dashboard de análisis para restaurantes y administradores

### Tareas Principales:

1. **Dashboard de Restaurante**
   - Revenue por día/mes
   - Top dishes by sales
   - Customer analysis
   - Peak hours

2. **Admin Dashboard**
   - Platform revenue
   - Active users/restaurants
   - System health
   - Reports exportables

---

## 📝 NOTA IMPORTANTE: Próximos Pasos Inmediatos

Cuando termines Sprint 4, asegúrate de:

1. **Commit todos los cambios a git**
   ```bash
   git add .
   git commit -m "feat: Sprint 4 - Order Management System"
   ```

2. **Crear resumen de Sprint 4**
   - Crear archivo `SPRINT_4_SUMMARY.md`
   - Documentar todos los cambios
   - Listar endpoints disponibles
   - Guía de uso del sistema

3. **Actualizar TODO List**
   - Marcar Sprint 4 como completado
   - Activar Sprint 5

4. **Verificar Ambos Servidores**
   - Backend: `http://localhost:3000/api`
   - Frontend: `http://localhost:3001`

---

## 🚀 Atajos Útiles para el Desarrollo

### Reiniciar Servidores
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Limpiar & Reinstalar
```bash
# Backend
cd backend && rm -r node_modules && npm install --legacy-peer-deps

# Frontend
cd frontend && rm -r node_modules && npm install
```

### Build Production
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

---

## 📚 Recursos de Referencia

- **TypeScript Best Practices:** https://www.typescriptlang.org/docs/
- **Clean Architecture:** https://blog.cleancoder.com/
- **Hexagonal Architecture:** https://alistair.cockburn.us/hexagonal-architecture/
- **DDD (Domain-Driven Design):** https://www.domainlanguage.com/
- **Zustand Store:** https://github.com/pmndrs/zustand
- **React Router v6:** https://reactrouter.com/

---

**Esta guía se actualizará conforme avanzes en el desarrollo. ¡Mucho éxito!** 🎉
