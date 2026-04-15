import { IUseCase } from '../IUseCase'
import { IRestaurantRepository } from '@domain/aggregates/IRestaurantRepository'

/**
 * Caso de uso: Eliminar (soft delete) un restaurante
 */
export class DeleteRestaurantUseCase implements IUseCase<{ id: string }, void> {
  constructor(private restaurantRepository: IRestaurantRepository) {}

  async execute(request: { id: string }): Promise<void> {
    // Buscar restaurante
    const restaurant = await this.restaurantRepository.findById(request.id)

    if (!restaurant) {
      throw new Error(`Restaurant with id ${request.id} not found`)
    }

    // Soft delete - desactivar en lugar de borrar
    restaurant.deactivate()

    // Persistir cambio
    await this.restaurantRepository.update(restaurant)
  }
}
