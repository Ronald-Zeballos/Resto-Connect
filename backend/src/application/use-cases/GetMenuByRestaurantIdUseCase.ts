import { IUseCase } from '../IUseCase'
import { MenuResponseDTO } from '../dtos/MenuDTO'
import { IMenuRepository } from '@domain/aggregates/IMenuRepository'

interface GetMenuByRestaurantIdRequest {
  restaurantId: string
}

/**
 * Caso de uso: Obtener el menú de un restaurante
 */
export class GetMenuByRestaurantIdUseCase
  implements IUseCase<GetMenuByRestaurantIdRequest, MenuResponseDTO | null>
{
  constructor(private menuRepository: IMenuRepository) {}

  async execute(
    request: GetMenuByRestaurantIdRequest
  ): Promise<MenuResponseDTO | null> {
    // Buscar menús del restaurante (generalmente hay uno principal)
    const menus = await this.menuRepository.findByRestaurantId(request.restaurantId)

    if (menus.length === 0) {
      return null
    }

    // Retornar el primer menú activo, o el primero en la lista
    const menu = menus.find((m) => m.isMenuActive()) || menus[0]

    return this.toPresentationModel(menu)
  }

  private toPresentationModel(menu: any): MenuResponseDTO {
    const items = menu.getItems().map((item: any) => ({
      name: item.getName(),
      description: item.getDescription(),
      price: item.getPrice(),
      cost: item.getCost(),
      category: item.getCategory(),
      available: item.isAvailable(),
    }))

    return new MenuResponseDTO({
      id: menu.getId().getValue(),
      restaurantId: menu.getRestaurantId().getValue(),
      name: menu.getName(),
      items,
      itemCount: menu.getItemCount(),
      isActive: menu.isMenuActive(),
      createdAt: menu.getCreatedAt(),
      updatedAt: menu.getUpdatedAt(),
    })
  }
}
