/**
 * DTO para crear un nuevo menú
 */
export class CreateMenuDTO {
  restaurantId: string
  name: string

  constructor(props: { restaurantId: string; name: string }) {
    this.restaurantId = props.restaurantId
    this.name = props.name
  }
}

/**
 * DTO para actualizar un menú
 */
export class UpdateMenuDTO {
  id: string
  name?: string

  constructor(props: { id: string; name?: string }) {
    this.id = props.id
    this.name = props.name
  }
}

/**
 * DTO para un artículo del menú
 */
export class MenuItemDTO {
  name: string
  description: string
  price: number
  cost: number
  category: string
  available: boolean

  constructor(props: {
    name: string
    description: string
    price: number
    cost: number
    category: string
    available?: boolean
  }) {
    this.name = props.name
    this.description = props.description
    this.price = props.price
    this.cost = props.cost
    this.category = props.category
    this.available = props.available !== false
  }
}

/**
 * DTO de respuesta para menú
 */
export class MenuResponseDTO {
  id: string
  restaurantId: string
  name: string
  items: MenuItemDTO[]
  itemCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date

  constructor(props: {
    id: string
    restaurantId: string
    name: string
    items: MenuItemDTO[]
    itemCount: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = props.id
    this.restaurantId = props.restaurantId
    this.name = props.name
    this.items = props.items
    this.itemCount = props.itemCount
    this.isActive = props.isActive
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}
