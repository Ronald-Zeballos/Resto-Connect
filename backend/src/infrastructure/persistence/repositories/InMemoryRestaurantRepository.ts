import { Restaurant } from '@domain/aggregates/Restaurant'
import { IRestaurantRepository } from '@domain/aggregates/IRestaurantRepository'
import { RestaurantId } from '@domain/value-objects/RestaurantId'
import { Email } from '@domain/value-objects/Email'

/**
 * Implementación en memory del repositorio (desarrollo/testing)
 * En producción, usar una base de datos real (PostgreSQL, MongoDB, etc)
 */
export class InMemoryRestaurantRepository implements IRestaurantRepository {
  private restaurants: Map<string, any> = new Map()

  async save(restaurant: Restaurant): Promise<void> {
    const id = restaurant.getId().getValue()
    this.restaurants.set(id, restaurant)
  }

  async findById(id: string): Promise<Restaurant | null> {
    return this.restaurants.get(id) || null
  }

  async findByOwnerId(ownerId: string): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(
      (r) => r.getOwnerId() === ownerId
    )
  }

  async findAll(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values())
  }

  async update(restaurant: Restaurant): Promise<void> {
    const id = restaurant.getId().getValue()
    if (!this.restaurants.has(id)) {
      throw new Error(`Restaurant with id ${id} not found`)
    }
    this.restaurants.set(id, restaurant)
  }

  async delete(id: string): Promise<void> {
    this.restaurants.delete(id)
  }
}
