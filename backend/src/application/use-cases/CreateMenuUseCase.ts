import { IUseCase } from '../IUseCase'
import { CreateMenuDTO, MenuResponseDTO } from '../dtos/MenuDTO'
import { IMenuRepository } from '@domain/aggregates/IMenuRepository'
import { Menu } from '@domain/aggregates/Menu'
import { RestaurantId } from '@domain/value-objects/RestaurantId'

/**
 * Caso de uso: Crear un nuevo menú para un restaurante
 */
export class CreateMenuUseCase implements IUseCase<CreateMenuDTO, MenuResponseDTO> {
  constructor(private menuRepository: IMenuRepository) {}

  async execute(request: CreateMenuDTO): Promise<MenuResponseDTO> {
    // Crear nuevo agregado Menu
    const menu = Menu.create({
      restaurantId: RestaurantId.fromString(request.restaurantId),
      name: request.name,
    })

    // Persistir
    await this.menuRepository.save(menu)

    // Retornar DTO
    return this.toPresentationModel(menu)
  }

  private toPresentationModel(menu: Menu): MenuResponseDTO {
    const items = menu.getItems().map((item) => ({
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
