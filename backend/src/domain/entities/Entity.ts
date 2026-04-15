/**
 * Clase base para todas las entidades del dominio
 * Implementa lógica común y propiedades universales
 */
export abstract class Entity<T> {
  protected readonly id: T
  protected readonly createdAt: Date
  protected updatedAt: Date

  constructor(id: T, createdAt?: Date, updatedAt?: Date) {
    this.id = id
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  getId(): T {
    return this.id
  }

  getCreatedAt(): Date {
    return this.createdAt
  }

  getUpdatedAt(): Date {
    return this.updatedAt
  }

  updateTimestamp(): void {
    this.updatedAt = new Date()
  }

  equals(entity: Entity<T>): boolean {
    if (!(entity instanceof this.constructor)) {
      return false
    }
    return this.id === (entity as Entity<T>).id
  }
}
