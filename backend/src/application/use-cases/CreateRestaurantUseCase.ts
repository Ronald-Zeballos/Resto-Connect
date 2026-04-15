import { IUseCase } from '../IUseCase'
import { CreateRestaurantDTO, RestaurantResponseDTO } from '../dtos/RestaurantDTO'
import { IRestaurantRepository } from '@domain/aggregates/IRestaurantRepository'
import { Restaurant } from '@domain/aggregates/Restaurant'
import { Email } from '@domain/value-objects/Email'
import { RestaurantId } from '@domain/value-objects/RestaurantId'

/**
 * Caso de uso: Crear un nuevo restaurante
 */
export class CreateRestaurantUseCase
  implements IUseCase<CreateRestaurantDTO, RestaurantResponseDTO>
{
  constructor(private restaurantRepository: IRestaurantRepository) {}

  async execute(request: CreateRestaurantDTO): Promise<RestaurantResponseDTO> {
    // Validar email
    const email = Email.create(request.email)

    // Crear agregado
    const restaurant = Restaurant.create({
      name: request.name,
      email,
      phone: request.phone,
      address: request.address,
      city: request.city,
      country: request.country,
      ownerId: request.ownerId,
    })

    // Persistir
    await this.restaurantRepository.save(restaurant)

    // Retornar DTO
    return this.toPresentationModel(restaurant)
  }

  private toPresentationModel(restaurant: Restaurant): RestaurantResponseDTO {
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
