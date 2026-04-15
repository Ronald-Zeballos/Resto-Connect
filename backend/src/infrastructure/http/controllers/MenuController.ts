import { Request, Response } from 'express'
import { CreateMenuDTO, MenuItemDTO } from '@application/dtos/MenuDTO'
import { CreateMenuUseCase } from '@application/use-cases/CreateMenuUseCase'
import { AddMenuItemUseCase } from '@application/use-cases/AddMenuItemUseCase'
import { UpdateMenuItemUseCase } from '@application/use-cases/UpdateMenuItemUseCase'
import { DeleteMenuItemUseCase } from '@application/use-cases/DeleteMenuItemUseCase'
import { GetMenuByRestaurantIdUseCase } from '@application/use-cases/GetMenuByRestaurantIdUseCase'

/**
 * Controller para el módulo de Menús
 * Adapta las solicitudes HTTP a casos de uso del dominio
 */
export class MenuController {
  constructor(
    private createMenuUseCase: CreateMenuUseCase,
    private addMenuItemUseCase: AddMenuItemUseCase,
    private updateMenuItemUseCase: UpdateMenuItemUseCase,
    private deleteMenuItemUseCase: DeleteMenuItemUseCase,
    private getMenuByRestaurantIdUseCase: GetMenuByRestaurantIdUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, name } = req.body

      const createDto = new CreateMenuDTO({
        restaurantId,
        name,
      })

      const result = await this.createMenuUseCase.execute(createDto)

      res.status(201).json({
        success: true,
        data: result,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  async getByRestaurant(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params

      const result = await this.getMenuByRestaurantIdUseCase.execute({
        restaurantId,
      })

      if (!result) {
        res.status(404).json({
          success: false,
          error: `Menu not found for restaurant ${restaurantId}`,
        })
        return
      }

      res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  async addMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const { menuId } = req.params
      const { name, description, price, cost, category, available } = req.body

      const itemDto = new MenuItemDTO({
        name,
        description,
        price,
        cost,
        category,
        available,
      })

      const result = await this.addMenuItemUseCase.execute({
        menuId,
        item: itemDto,
      })

      res.status(201).json({
        success: true,
        data: result,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  async updateMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const { menuId, itemIndex } = req.params
      const { name, description, price, cost, category, available } = req.body

      const result = await this.updateMenuItemUseCase.execute({
        menuId,
        itemIndex: parseInt(itemIndex),
        updates: {
          name,
          description,
          price,
          cost,
          category,
          available,
        },
      })

      res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  async deleteMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const { menuId, itemIndex } = req.params

      const result = await this.deleteMenuItemUseCase.execute({
        menuId,
        itemIndex: parseInt(itemIndex),
      })

      res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      })
    }
  }
}
