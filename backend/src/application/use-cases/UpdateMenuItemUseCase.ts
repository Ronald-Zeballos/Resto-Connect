import { IUseCase } from '../IUseCase'
import { MenuResponseDTO } from '../dtos/MenuDTO'
import { IMenuRepository } from '@domain/aggregates/IMenuRepository'

interface UpdateMenuItemRequest {
  menuId: string
  itemIndex: number
  updates: {
    name?: string
    description?: string
    price?: number
    cost?: number
    category?: string
    available?: boolean
  }
}

/**
 * Caso de uso: Actualizar un artículo del menú
 */
export class UpdateMenuItemUseCase
  implements IUseCase<UpdateMenuItemRequest, MenuResponseDTO>
{
  constructor(private menuRepository: IMenuRepository) {}

  async execute(request: UpdateMenuItemRequest): Promise<MenuResponseDTO> {
    // Buscar menú
    const menu = await this.menuRepository.findById(request.menuId)
    if (!menu) {
      throw new Error(`Menu with id ${request.menuId} not found`)
    }

    // Obtener item actual
    const items = menu.getItems()
    if (request.itemIndex < 0 || request.itemIndex >= items.length) {
      throw new Error('Menu item index out of bounds')
    }

    const currentItem = items[request.itemIndex]

    // Importar MenuItem para crear uno nuevo con los cambios
    const { MenuItem } = await import('@domain/value-objects/MenuItem')

    const updatedItem = MenuItem.create({
      name: request.updates.name || currentItem.getName(),
      description: request.updates.description ?? currentItem.getDescription(),
      price: request.updates.price ?? currentItem.getPrice(),
      cost: request.updates.cost ?? currentItem.getCost(),
      category: request.updates.category || currentItem.getCategory(),
      available: request.updates.available ?? currentItem.isAvailable(),
    })

    // Actualizar en menú
    menu.updateMenuItem(request.itemIndex, updatedItem)

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
