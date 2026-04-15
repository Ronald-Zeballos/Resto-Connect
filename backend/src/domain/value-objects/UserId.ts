import { ValueObject } from './ValueObject'

/**
 * Identidad única del usuario
 */
export class UserId extends ValueObject<string> {
  static create(id?: string): UserId {
    return new UserId(id || crypto.randomUUID())
  }

  protected validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('UserId must be a valid string')
    }
  }

  equals(vo: UserId): boolean {
    return this.value === vo.value
  }
}
