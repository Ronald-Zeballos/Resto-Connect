/**
 * DTO para registrar nuevo usuario
 */
export class RegisterUserDTO {
  email: string
  password: string
  name: string
  role?: string

  constructor(props: {
    email: string
    password: string
    name: string
    role?: string
  }) {
    this.email = props.email
    this.password = props.password
    this.name = props.name
    this.role = props.role
  }
}

/**
 * DTO para login
 */
export class LoginUserDTO {
  email: string
  password: string

  constructor(props: { email: string; password: string }) {
    this.email = props.email
    this.password = props.password
  }
}

/**
 * DTO para cambiar password
 */
export class ChangePasswordDTO {
  userId: string
  currentPassword: string
  newPassword: string

  constructor(props: {
    userId: string
    currentPassword: string
    newPassword: string
  }) {
    this.userId = props.userId
    this.currentPassword = props.currentPassword
    this.newPassword = props.newPassword
  }
}

/**
 * DTO de respuesta del usuario
 */
export class UserResponseDTO {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date

  constructor(props: {
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    lastLoginAt?: Date
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = props.id
    this.email = props.email
    this.name = props.name
    this.role = props.role
    this.isActive = props.isActive
    this.lastLoginAt = props.lastLoginAt
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}

/**
 * DTO de respuesta de login (con token)
 */
export class AuthResponseDTO {
  accessToken: string
  refreshToken: string
  user: UserResponseDTO

  constructor(props: {
    accessToken: string
    refreshToken: string
    user: UserResponseDTO
  }) {
    this.accessToken = props.accessToken
    this.refreshToken = props.refreshToken
    this.user = props.user
  }
}
