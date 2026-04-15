import { ValueObject } from './ValueObject'

/**
 * Rol del usuario en el sistema
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  CUSTOMER = 'CUSTOMER',
  DELIVERY_DRIVER = 'DELIVERY_DRIVER',
}

export class Role extends ValueObject<UserRole> {
  static create(role: UserRole): Role {
    return new Role(role)
  }

  static admin(): Role {
    return new Role(UserRole.ADMIN)
  }

  static restaurantOwner(): Role {
    return new Role(UserRole.RESTAURANT_OWNER)
  }

  static customer(): Role {
    return new Role(UserRole.CUSTOMER)
  }

  protected validate(value: UserRole): void {
    if (!Object.values(UserRole).includes(value)) {
      throw new Error(`Invalid role: ${value}`)
    }
  }

  isAdmin(): boolean {
    return this.value === UserRole.ADMIN
  }

  isRestaurantOwner(): boolean {
    return this.value === UserRole.RESTAURANT_OWNER
  }

  isCustomer(): boolean {
    return this.value === UserRole.CUSTOMER
  }

  equals(vo: Role): boolean {
    return this.value === vo.value
  }
}
