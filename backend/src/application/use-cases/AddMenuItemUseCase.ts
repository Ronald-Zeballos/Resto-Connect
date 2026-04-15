import { IUseCase } from '../IUseCase'
import { MenuItemDTO, MenuResponseDTO } from '../dtos/MenuDTO'
import { IMenuRepository } from '@domain/aggregates/IMenuRepository'
import { MenuItem } from '@domain/value-objects/MenuItem'

interface AddMenuItemRequest {
  menuId: string
  item: MenuItemDTO
}

/**
 * Caso de uso: Agregar un artículo al menú
 */
export class AddMenuItemUseCase
  implements IUseCase<AddMenuItemRequest, MenuResponseDTO>
{
  constructor(private menuRepository: IMenuRepository) {}

  async execute(request: AddMenuItemRequest): Promise<MenuResponseDTO> {
    // Buscar menú
    const menu = await this.menuRepository.findById(request.menuId)
    if (!menu) {
      throw new Error(`Menu with id ${request.menuId} not found`)
    }

    // Crear MenuItem como value object
    const menuItem = MenuItem.create({
      name: request.item.name,
      description: request.item.description,
      price: request.item.price,
      cost: request.item.cost,
      category: request.item.category,
      available: request.item.available,
    })

    // Agregar al menú
    menu.addMenuItem(menuItem)

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
