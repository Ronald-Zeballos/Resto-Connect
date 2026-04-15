import { Entity } from '../entities/Entity'
import { MenuId } from '../value-objects/MenuId'
import { RestaurantId } from '../value-objects/RestaurantId'
import { MenuItem } from '../value-objects/MenuItem'

/**
 * Agregado: Menú
 * Contiene todos los artículos/platos del menú de un restaurante
 */
export class Menu extends Entity<MenuId> {
  private restaurantId: RestaurantId
  private items: Map<string, MenuItem> = new Map()
  private name: string
  private isActive: boolean

  private constructor(
    id: MenuId,
    restaurantId: RestaurantId,
    name: string,
    items?: MenuItem[],
    isActive?: boolean,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt)
    this.restaurantId = restaurantId
    this.name = name
    this.isActive = isActive !== false
    
    items?.forEach((item, index) => {
      this.items.set(`item-${index}`, item)
    })
  }

  static create(props: {
    id?: MenuId
    restaurantId: RestaurantId
    name: string
  }): Menu {
    const id = props.id || MenuId.create()
    return new Menu(id, props.restaurantId, props.name)
  }

  static reconstruct(props: {
    id: MenuId
    restaurantId: RestaurantId
    name: string
    items: MenuItem[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }): Menu {
    return new Menu(
      props.id,
      props.restaurantId,
      props.name,
      props.items,
      props.isActive,
      props.createdAt,
      props.updatedAt
    )
  }

  getRestaurantId(): RestaurantId {
    return this.restaurantId
  }

  getName(): string {
    return this.name
  }

  isMenuActive(): boolean {
    return this.isActive
  }

  getItems(): MenuItem[] {
    return Array.from(this.items.values())
  }

  getItemCount(): number {
    return this.items.size
  }

  addMenuItem(item: MenuItem): void {
    if (!this.isActive) {
      throw new Error('Cannot add items to an inactive menu')
    }
    
    // Generar clave única basada en nombre
    const key = `item-${Date.now()}-${Math.random()}`
    this.items.set(key, item)
    this.updateTimestamp()
  }

  updateMenuItem(index: number, updatedItem: MenuItem): void {
    if (!this.isActive) {
      throw new Error('Cannot update items in an inactive menu')
    }

    const keys = Array.from(this.items.keys())
    if (index < 0 || index >= keys.length) {
      throw new Error('Menu item index out of bounds')
    }

    const key = keys[index]
    this.items.set(key, updatedItem)
    this.updateTimestamp()
  }

  removeMenuItemByIndex(index: number): void {
    if (!this.isActive) {
      throw new Error('Cannot remove items from an inactive menu')
    }

    const keys = Array.from(this.items.keys())
    if (index < 0 || index >= keys.length) {
      throw new Error('Menu item index out of bounds')
    }

    const key = keys[index]
    this.items.delete(key)
    this.updateTimestamp()
  }

  updateMenuName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Menu name is required')
    }
    this.name = newName
    this.updateTimestamp()
  }

  activate(): void {
    if (this.isActive) {
      throw new Error('Menu is already active')
    }
    this.isActive = true
    this.updateTimestamp()
  }

  deactivate(): void {
    if (!this.isActive) {
      throw new Error('Menu is already inactive')
    }
    this.isActive = false
    this.updateTimestamp()
  }

  getTotalRevenue(quantity: number = 1): number {
    return this.getItems().reduce((sum, item) => sum + item.getPrice() * quantity, 0)
  }

  getAveragePricePerItem(): number {
    const items = this.getItems()
    if (items.length === 0) return 0
    return items.reduce((sum, item) => sum + item.getPrice(), 0) / items.length
  }
}
