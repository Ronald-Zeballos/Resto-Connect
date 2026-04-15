import { Menu } from './Menu'

/**
 * Interfaz de repositorio para el agregado Menu
 * Define el contrato que debe cumplir cualquier implementación de persistencia
 */
export interface IMenuRepository {
  save(menu: Menu): Promise<void>
  findById(id: string): Promise<Menu | null>
  findByRestaurantId(restaurantId: string): Promise<Menu[]>
  findAll(): Promise<Menu[]>
  update(menu: Menu): Promise<void>
  delete(id: string): Promise<void>
}
