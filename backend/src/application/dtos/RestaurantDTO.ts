/**
 * DTO para crear un nuevo restaurante
 * Datos que llegan desde el cliente
 */
export class CreateRestaurantDTO {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  ownerId: string

  constructor(props: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    country: string
    ownerId: string
  }) {
    this.name = props.name
    this.email = props.email
    this.phone = props.phone
    this.address = props.address
    this.city = props.city
    this.country = props.country
    this.ownerId = props.ownerId
  }
}

/**
 * DTO para actualizar un restaurante
 */
export class UpdateRestaurantDTO {
  id: string
  name?: string
  phone?: string
  address?: string
  city?: string
  country?: string

  constructor(props: {
    id: string
    name?: string
    phone?: string
    address?: string
    city?: string
    country?: string
  }) {
    this.id = props.id
    this.name = props.name
    this.phone = props.phone
    this.address = props.address
    this.city = props.city
    this.country = props.country
  }
}

/**
 * DTO de respuesta del restaurante
 * Datos que se envían al cliente
 */
export class RestaurantResponseDTO {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  ownerId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date

  constructor(props: {
    id: string
    name: string
    email: string
    phone: string
    address: string
    city: string
    country: string
    ownerId: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = props.id
    this.name = props.name
    this.email = props.email
    this.phone = props.phone
    this.address = props.address
    this.city = props.city
    this.country = props.country
    this.ownerId = props.ownerId
    this.isActive = props.isActive
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}
