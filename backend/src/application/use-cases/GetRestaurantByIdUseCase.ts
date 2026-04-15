import { IUseCase } from '../IUseCase'
import { RestaurantResponseDTO } from '../dtos/RestaurantDTO'
import { IRestaurantRepository } from '@domain/aggregates/IRestaurantRepository'

/**
 * Caso de uso: Obtener restaurante por ID
 */
export class GetRestaurantByIdUseCase
  implements IUseCase<{ id: string }, RestaurantResponseDTO>
{
  constructor(private restaurantRepository: IRestaurantRepository) {}

  async execute(request: { id: string }): Promise<RestaurantResponseDTO> {
    const restaurant = await this.restaurantRepository.findById(request.id)

    if (!restaurant) {
      throw new Error(`Restaurant with id ${request.id} not found`)
    }

    return this.toPresentationModel(restaurant)
  }

  private toPresentationModel(restaurant: any): RestaurantResponseDTO {
    return new RestaurantResponseDTO({
      id: restaurant.getId().getValue(),
      name: restaurant.getName(),
      email: restaurant.getEmail().getValue(),
      phone: restaurant.getPhone(),
      address: restaurant.getAddress(),
      city: restaurant.getCity(),
      country: restaurant.getCountry(),
      ownerId: restaurant.getOwnerId(),
      isActive: restaurant.isRestaurantActive(),
      createdAt: restaurant.getCreatedAt(),
      updatedAt: restaurant.getUpdatedAt(),
    })
  }
}
