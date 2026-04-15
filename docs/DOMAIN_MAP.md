# Domain Map - Resto-Connect

## 🗺️ Mapa del Dominio

```
RESTO-CONNECT (Plataforma de Gestión de Restaurantes)
│
├── 👥 User Bounded Context
│   ├── User Aggregate
│   ├── Role (Chef, Manager, Waiter, Admin)
│   └── Permissions
│
├── 🍽️ Restaurant Management Bounded Context
│   ├── Restaurant Aggregate
│   │   ├── RestaurantId (Value Object)
│   │   ├── Name, Email, Phone
│   │   ├── Address, City, Country
│   │   └── OperatingHours
│   │
│   ├── Menu Aggregate
│   │   ├── MenuId
│   │   ├── Dish (Entity)
│   │   │   ├── DishId
│   │   │   ├── Name, Description
│   │   │   ├── Price (Money - Value Object)
│   │   │   ├── Category
│   │   │   └── Availability
│   │   └── DishGroup
│   │
│   └── Staff Aggregate
│       ├── StaffMember (Entity)
│       ├── Position (Chef, Waiter, etc)
│       └── Schedule
│
├── 📦 Order Management Bounded Context
│   ├── Order Aggregate
│   │   ├── OrderId
│   │   ├── OrderStatus (PENDING, CONFIRMED, PREPARING, READY, DELIVERED)
│   │   ├── OrderedItems (Collection de OrderItem)
│   │   │   ├── OrderItem (Entity)
│   │   │   ├── Dish reference
│   │   │   ├── Quantity
│   │   │   ├── SpecialInstructions
│   │   │   └── Price
│   │   ├── TotalPrice (Money)
│   │   ├── OrderDate
│   │   ├── DeliveryAddress
│   │   └── Customer reference
│   │
│   ├── Table Aggregate (para restaurantes con comedor)
│   │   ├── TableId
│   │   ├── TableNumber
│   │   ├── Capacity
│   │   └── Status (AVAILABLE, OCCUPIED, RESERVED)
│   │
│   └── Reservation Aggregate
│       ├── ReservationId
│       ├── Customer
│       ├── DateTime
│       ├── PartySize
│       └── Status
│
├── 💳 Payment Bounded Context
│   ├── Payment Aggregate
│   │   ├── PaymentId
│   │   ├── Amount (Money)
│   │   ├── Currency
│   │   ├── PaymentMethod (CARD, CASH, WALLET)
│   │   ├── PaymentStatus (PENDING, COMPLETED, FAILED, REFUNDED)
│   │   ├── TransactionId
│   │   └── Timestamp
│   │
│   └── Refund Aggregate
│       ├── RefundId
│       ├── OriginalPayment reference
│       ├── Amount (Money)
│       └── Reason
│
├── 🚚 Delivery Bounded Context
│   ├── Delivery Aggregate
│   │   ├── DeliveryId
│   │   ├── Order reference
│   │   ├── DeliveryStatus (PENDING, IN_TRANSIT, DELIVERED, FAILED)
│   │   ├── Driver reference
│   │   ├── Location (Geolocation)
│   │   ├── EstimatedTime
│   │   └── ActualTime of delivery
│   │
│   └── DeliveryDriver Aggregate
│       ├── DriverId
│       ├── Name, Phone, Email
│       ├── Vehicle info
│       ├── Rating
│       └── Availability
│
├── ⭐ Review & Rating Bounded Context
│   ├── Review Aggregate
│   │   ├── ReviewId
│   │   ├── Order reference
│   │   ├── Restaurant reference
│   │   ├── Rating (1-5)
│   │   ├── Comment
│   │   ├── CreatedAt
│   │   └── Useful count
│   │
│   └── RestaurantRating (Value Object)
│       ├── AverageRating
│       ├── TotalReviews
│       └── LastUpdated
│
└── 📊 Analytics Bounded Context
    ├── OrderMetrics Aggregate
    │   ├── TotalOrders
    │   ├── AverageOrderValue (Money)
    │   ├── OrderStatusDistribution
    │   └── TimePeriod
    │
    └── RestaurantMetrics Aggregate
        ├── RevenueMetrics
        ├── PopularDishes
        ├── PeakHours
        └── CustomerMetrics

## 🔗 Relaciones entre Bounded Contexts

User ---> Restaurant Management (propietario)
        \---> Orders (cliente)
                 └---> Payments
                 └---> Delivery (si aplica)
                 └---> Reviews

Restaurant Management ---> Orders (restaurante recibe órdenes)
                      ---> Analytics (datos de restaurante)

Delivery <---> Orders (entrega de órdenes)
         <---> DeliveryDriver

## 📍 Eventos de Dominio (Future DDD)

- RestaurantCreated
- OrderPlaced
- OrderConfirmed
- OrderPreparationStarted
- OrderReady
- PaymentProcessed
- DeliveryStarted
- DeliveryCompleted
- ReviewSubmitted
- RestaurantRatingUpdated

## 🎯 Agregados Raíz (Tipos de Entidades Principales)

1. **Restaurant** - República del restaurante
2. **Order** - Pedido con todos sus componentes
3. **User** - Usuario con rol y permisos
4. **Payment** - Transacción financiera
5. **Delivery** - Entrega y tracking
6. **Review** - Calificación y comentarios

---

**Nota**: Este mapa evolucionará con los sprints. Algunos contexts se consolidarán, otros se expandirán según los requisitos del negocio.
