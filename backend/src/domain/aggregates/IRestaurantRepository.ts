import { Restaurant } from '../aggregates/Restaurant'

/**
 * Interfaz de repositorio para el agregado Restaurant
 * Define el contrato que debe cumplir cualquier implementación de persistencia
 */
export interface IRestaurantRepository {
  save(restaurant: Restaurant): Promise<void>
  findById(id: string): Promise<Restaurant | null>
  findByOwnerId(ownerId: string): Promise<Restaurant[]>
  findAll(): Promise<Restaurant[]>
  update(restaurant: Restaurant): Promise<void>
  delete(id: string): Promise<void>
}
