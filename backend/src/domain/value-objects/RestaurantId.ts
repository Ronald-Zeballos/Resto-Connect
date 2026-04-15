import { ValueObject } from './ValueObject'

export class RestaurantId extends ValueObject<string> {
  static create(id?: string): RestaurantId {
    return new RestaurantId(id || crypto.randomUUID())
  }

  protected validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('RestaurantId must be a valid string')
    }
  }

  equals(vo: RestaurantId): boolean {
    return this.value === vo.value
  }
}
