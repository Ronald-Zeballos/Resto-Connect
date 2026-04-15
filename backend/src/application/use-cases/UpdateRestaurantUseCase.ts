import { IUseCase } from '../IUseCase'
import { UpdateRestaurantDTO, RestaurantResponseDTO } from '../dtos/RestaurantDTO'
import { IRestaurantRepository } from '@domain/aggregates/IRestaurantRepository'

/**
 * Caso de uso: Actualizar datos básicos del restaurante
 */
export class UpdateRestaurantUseCase
  implements IUseCase<UpdateRestaurantDTO, RestaurantResponseDTO>
{
  constructor(private restaurantRepository: IRestaurantRepository) {}

  async execute(request: UpdateRestaurantDTO): Promise<RestaurantResponseDTO> {
    // Buscar restaurante
    const restaurant = await this.restaurantRepository.findById(request.id)

    if (!restaurant) {
      throw new Error(`Restaurant with id ${request.id} not found`)
    }

    // Actualizar datos (solo acepta ciertos campos)
    restaurant.updateBasicInfo({
      name: request.name,
      phone: request.phone,
      address: request.address,
      city: request.city,
      country: request.country,
    })

    // Persistir cambios
    await this.restaurantRepository.update(restaurant)

    // Retornar DTO
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
