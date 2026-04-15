import { User } from '../aggregates/User'

/**
 * Interfaz de repositorio para el agregado User
 * Define el contrato que debe cumplir cualquier implementación de persistencia
 */
export interface IUserRepository {
  save(user: User): Promise<void>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findAll(): Promise<User[]>
  update(user: User): Promise<void>
  delete(id: string): Promise<void>
}
