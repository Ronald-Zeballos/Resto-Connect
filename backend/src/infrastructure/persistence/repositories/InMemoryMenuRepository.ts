import { Menu } from '@domain/aggregates/Menu'
import { IMenuRepository } from '@domain/aggregates/IMenuRepository'

/**
 * Implementación en memory del repositorio de Menu (desarrollo/testing)
 * En producción, usar una base de datos real (PostgreSQL, MongoDB, etc)
 */
export class InMemoryMenuRepository implements IMenuRepository {
  private menus: Map<string, any> = new Map()

  async save(menu: Menu): Promise<void> {
    const id = menu.getId().getValue()
    this.menus.set(id, menu)
  }

  async findById(id: string): Promise<Menu | null> {
    return this.menus.get(id) || null
  }

  async findByRestaurantId(restaurantId: string): Promise<Menu[]> {
    return Array.from(this.menus.values()).filter(
      (m) => m.getRestaurantId().getValue() === restaurantId
    )
  }

  async findAll(): Promise<Menu[]> {
    return Array.from(this.menus.values())
  }

  async update(menu: Menu): Promise<void> {
    const id = menu.getId().getValue()
    if (!this.menus.has(id)) {
      throw new Error(`Menu with id ${id} not found`)
    }
    this.menus.set(id, menu)
  }

  async delete(id: string): Promise<void> {
    this.menus.delete(id)
  }
}
