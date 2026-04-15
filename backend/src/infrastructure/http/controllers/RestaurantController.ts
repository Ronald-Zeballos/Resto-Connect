import { Request, Response } from 'express'
import { CreateRestaurantDTO, UpdateRestaurantDTO } from '@application/dtos/RestaurantDTO'
import { CreateRestaurantUseCase } from '@application/use-cases/CreateRestaurantUseCase'
import { GetRestaurantByIdUseCase } from '@application/use-cases/GetRestaurantByIdUseCase'
import { UpdateRestaurantUseCase } from '@application/use-cases/UpdateRestaurantUseCase'
import { DeleteRestaurantUseCase } from '@application/use-cases/DeleteRestaurantUseCase'
import {
  ListRestaurantsUseCase,
  GetRestaurantsByOwnerUseCase,
} from '@application/use-cases/ListRestaurantsUseCase'

/**
 * Controller para el módulo de Restaurantes
 * Adapta las solicitudes HTTP a casos de uso del dominio
 */
export class RestaurantController {
  constructor(
    private createRestaurantUseCase: CreateRestaurantUseCase,
    private getRestaurantByIdUseCase: GetRestaurantByIdUseCase,
    private updateRestaurantUseCase: UpdateRestaurantUseCase,
    private deleteRestaurantUseCase: DeleteRestaurantUseCase,
    private listRestaurantsUseCase: ListRestaurantsUseCase,
    private getRestaurantsByOwnerUseCase: GetRestaurantsByOwnerUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, address, city, country, ownerId } = req.body

      const createDto = new CreateRestaurantDTO({
        name,
        email,
        phone,
        address,
        city,
        country,
        ownerId,
      })

      const result = await this.createRestaurantUseCase.execute(createDto)

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

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const result = await this.getRestaurantByIdUseCase.execute({ id })

      res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { name, phone, address, city, country } = req.body

      const updateDto = new UpdateRestaurantDTO({
        id,
        name,
        phone,
        address,
        city,
        country,
      })

      const result = await this.updateRestaurantUseCase.execute(updateDto)

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

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      await this.deleteRestaurantUseCase.execute({ id })

      res.status(204).send()
    } catch (error) {
      res.status(404).json({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined

      const result = await this.listRestaurantsUseCase.execute({
        page,
        limit,
      })

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  async getByOwner(req: Request, res: Response): Promise<void> {
    try {
      const { ownerId } = req.params
      const page = req.query.page ? parseInt(req.query.page as string) : undefined
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined

      const result = await this.getRestaurantsByOwnerUseCase.execute({
        ownerId,
        page,
        limit,
      })

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      })
    }
  }
}
