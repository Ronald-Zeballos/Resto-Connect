import { IUseCase } from '../IUseCase'
import { RestaurantResponseDTO } from '../dtos/RestaurantDTO'
import { IRestaurantRepository } from '@domain/aggregates/IRestaurantRepository'

/**
 * DTO para lista paginada
 */
export class PaginationDTO {
  page: number = 1
  limit: number = 10
  total: number = 0
  pages: number = 0
}

export class ListRestaurantsResponseDTO {
  data: RestaurantResponseDTO[]
  pagination: PaginationDTO
}

/**
 * Caso de uso: Listar todos los restaurantes activos con paginación
 */
export class ListRestaurantsUseCase
  implements IUseCase<{ page?: number; limit?: number }, ListRestaurantsResponseDTO>
{
  constructor(private restaurantRepository: IRestaurantRepository) {}

  async execute(request: {
    page?: number
    limit?: number
  }): Promise<ListRestaurantsResponseDTO> {
    const page = Math.max(1, request.page || 1)
    const limit = Math.min(100, Math.max(1, request.limit || 10))

    // Obtener todos los restaurantes
    const allRestaurants = await this.restaurantRepository.findAll()

    // Filtrar solo activos
    const activeRestaurants = allRestaurants.filter((r) => r.isRestaurantActive())

    // Calcular paginación
    const total = activeRestaurants.length
    const pages = Math.ceil(total / limit)
    const offset = (page - 1) * limit

    // Aplicar paginación
    const paginatedRestaurants = activeRestaurants.slice(offset, offset + limit)

    // Convertir a DTOs
    const data = paginatedRestaurants.map((r) => this.toPresentationModel(r))

    return new ListRestaurantsResponseDTO({
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    })
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

/**
 * Caso de uso: Listar restaurantes del propietario logueado
 */
export class GetRestaurantsByOwnerUseCase
  implements
    IUseCase<
      { ownerId: string; page?: number; limit?: number },
      ListRestaurantsResponseDTO
    >
{
  constructor(private restaurantRepository: IRestaurantRepository) {}

  async execute(request: {
    ownerId: string
    page?: number
    limit?: number
  }): Promise<ListRestaurantsResponseDTO> {
    const page = Math.max(1, request.page || 1)
    const limit = Math.min(100, Math.max(1, request.limit || 10))

    // Obtener restaurantes del owner
    const ownerRestaurants = await this.restaurantRepository.findByOwnerId(
      request.ownerId
    )

    // Filtrar solo activos
    const activeRestaurants = ownerRestaurants.filter((r) => r.isRestaurantActive())

    // Calcular paginación
    const total = activeRestaurants.length
    const pages = Math.ceil(total / limit)
    const offset = (page - 1) * limit

    // Aplicar paginación
    const paginatedRestaurants = activeRestaurants.slice(offset, offset + limit)

    // Convertir a DTOs
    const data = paginatedRestaurants.map((r) => this.toPresentationModel(r))

    return new ListRestaurantsResponseDTO({
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    })
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
