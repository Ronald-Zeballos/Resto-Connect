import { User } from '@domain/aggregates/User'
import { IUserRepository } from '@domain/aggregates/IUserRepository'

/**
 * Implementación en memory del repositorio User (desarrollo/testing)
 * En producción, usar PostgreSQL + Prisma
 */
export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map()

  async save(user: User): Promise<void> {
    const id = user.getId().getValue()
    this.users.set(id, user)
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(
      (u) => u.getEmail().getValue() === email
    )
    return user || null
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values())
  }

  async update(user: User): Promise<void> {
    const id = user.getId().getValue()
    if (!this.users.has(id)) {
      throw new Error(`User with id ${id} not found`)
    }
    this.users.set(id, user)
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id)
  }
}
