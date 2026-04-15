import { v4 as uuidv4 } from 'uuid'

/**
 * Value Object: MenuId
 * Identificador único para un menú
 */
export class MenuId {
  private readonly value: string

  private constructor(value: string) {
    if (!value || typeof value !== 'string') {
      throw new Error('MenuId must be a non-empty string')
    }
    this.value = value
  }

  static create(): MenuId {
    return new MenuId(uuidv4())
  }

  static fromString(value: string): MenuId {
    return new MenuId(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: MenuId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
