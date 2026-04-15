import { IUseCase } from '../IUseCase'
import { MenuResponseDTO } from '../dtos/MenuDTO'
import { IMenuRepository } from '@domain/aggregates/IMenuRepository'

interface DeleteMenuItemRequest {
  menuId: string
  itemIndex: number
}

/**
 * Caso de uso: Eliminar un artículo del menú
 */
export class DeleteMenuItemUseCase
  implements IUseCase<DeleteMenuItemRequest, MenuResponseDTO>
{
  constructor(private menuRepository: IMenuRepository) {}

  async execute(request: DeleteMenuItemRequest): Promise<MenuResponseDTO> {
    // Buscar menú
    const menu = await this.menuRepository.findById(request.menuId)
    if (!menu) {
      throw new Error(`Menu with id ${request.menuId} not found`)
    }

    // Eliminar item por índice
    menu.removeMenuItemByIndex(request.itemIndex)

    // Persistir
    await this.menuRepository.update(menu)

    // Retornar DTO
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
