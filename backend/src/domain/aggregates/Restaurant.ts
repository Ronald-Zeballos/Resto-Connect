import { Entity } from '../entities/Entity'
import { RestaurantId } from '../value-objects/RestaurantId'
import { Email } from '../value-objects/Email'

/**
 * Agregado de Restaurante
 * Raíz del agregado que contiene toda la información del restaurante
 */
export class Restaurant extends Entity<RestaurantId> {
  private name: string
  private email: Email
  private phone: string
  private address: string
  private city: string
  private country: string
  private isActive: boolean
  private ownerId: string

  private constructor(
    id: RestaurantId,
    name: string,
    email: Email,
    phone: string,
    address: string,
    city: string,
    country: string,
    ownerId: string,
    isActive = true,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt)
    this.name = name
    this.email = email
    this.phone = phone
    this.address = address
    this.city = city
    this.country = country
    this.ownerId = ownerId
    this.isActive = isActive
  }

  static create(props: {
    id?: RestaurantId
    name: string
    email: Email
    phone: string
    address: string
    city: string
    country: string
    ownerId: string
  }): Restaurant {
    const id = props.id || RestaurantId.create()

    return new Restaurant(
      id,
      props.name,
      props.email,
      props.phone,
      props.address,
      props.city,
      props.country,
      props.ownerId
    )
  }

  static reconstruct(props: {
    id: RestaurantId
    name: string
    email: Email
    phone: string
    address: string
    city: string
    country: string
    ownerId: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }): Restaurant {
    return new Restaurant(
      props.id,
      props.name,
      props.email,
      props.phone,
      props.address,
      props.city,
      props.country,
      props.ownerId,
      props.isActive,
      props.createdAt,
      props.updatedAt
    )
  }

  getName(): string {
    return this.name
  }

  getEmail(): Email {
    return this.email
  }

  getPhone(): string {
    return this.phone
  }

  getAddress(): string {
    return this.address
  }

  getCity(): string {
    return this.city
  }

  getCountry(): string {
    return this.country
  }

  getOwnerId(): string {
    return this.ownerId
  }

  isRestaurantActive(): boolean {
    return this.isActive
  }

  updateBasicInfo(props: {
    name?: string
    phone?: string
    address?: string
    city?: string
    country?: string
  }): void {
    if (props.name) this.name = props.name
    if (props.phone) this.phone = props.phone
    if (props.address) this.address = props.address
    if (props.city) this.city = props.city
    if (props.country) this.country = props.country
    this.updateTimestamp()
  }

  activate(): void {
    if (this.isActive) {
      throw new Error('Restaurant is already active')
    }
    this.isActive = true
    this.updateTimestamp()
  }

  deactivate(): void {
    if (!this.isActive) {
      throw new Error('Restaurant is already inactive')
    }
    this.isActive = false
    this.updateTimestamp()
  }
}
