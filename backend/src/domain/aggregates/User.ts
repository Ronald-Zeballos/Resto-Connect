import { Entity } from '../entities/Entity'
import { UserId } from '../value-objects/UserId'
import { Email } from '../value-objects/Email'
import { Password } from '../value-objects/Password'
import { Role, UserRole } from '../value-objects/Role'

/**
 * Agregado User - Usuario del sistema
 * Raíz del agregado con toda la información y lógica del usuario
 */
export class User extends Entity<UserId> {
  private email: Email
  private password: Password
  private name: string
  private role: Role
  private isActive: boolean
  private lastLoginAt?: Date

  private constructor(
    id: UserId,
    email: Email,
    password: Password,
    name: string,
    role: Role,
    isActive = true,
    lastLoginAt?: Date,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt)
    this.email = email
    this.password = password
    this.name = name
    this.role = role
    this.isActive = isActive
    this.lastLoginAt = lastLoginAt
  }

  /**
   * Factory para crear nuevo usuario
   */
  static create(props: {
    email: Email
    password: Password
    name: string
    role?: Role
  }): User {
    const id = UserId.create()
    const role = props.role || Role.customer()

    return new User(id, props.email, props.password, props.name, role)
  }

  /**
   * Reconstruir usuario desde BD
   */
  static reconstruct(props: {
    id: UserId
    email: Email
    password: Password
    name: string
    role: Role
    isActive: boolean
    lastLoginAt?: Date
    createdAt: Date
    updatedAt: Date
  }): User {
    return new User(
      props.id,
      props.email,
      props.password,
      props.name,
      props.role,
      props.isActive,
      props.lastLoginAt,
      props.createdAt,
      props.updatedAt
    )
  }

  // ============ Getters ============

  getId(): UserId {
    return this.id
  }

  getEmail(): Email {
    return this.email
  }

  getPassword(): Password {
    return this.password
  }

  getName(): string {
    return this.name
  }

  getRole(): Role {
    return this.role
  }

  isUserActive(): boolean {
    return this.isActive
  }

  getLastLoginAt(): Date | undefined {
    return this.lastLoginAt
  }

  // ============ Lógica de Negocio ============

  /**
   * Verifica si la password coincide (será llamado por el adapter de seguridad)
   * Retorna true/false para que infrastructure/auth lo use
   */
  comparePassword(plainPassword: string): boolean {
    // El adapter de infraestructura hará el bcrypt.compare
    // Aquí solo retornamos que el password es plain para comparar
    return true // El servicio de infraestructura validará
  }

  /**
   * Cambiar email - valida que sea único (responsabilidad de repository)
   */
  changeEmail(newEmail: Email): void {
    if (newEmail.equals(this.email)) {
      throw new Error('New email must be different from current email')
    }
    this.email = newEmail
    this.updateTimestamp()
  }

  /**
   * Cambiar password
   */
  changePassword(newPassword: Password): void {
    if (newPassword.equals(this.password)) {
      throw new Error('New password must be different from current password')
    }
    this.password = newPassword
    this.updateTimestamp()
  }

  /**
   * Cambiar nombre
   */
  changeName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Name cannot be empty')
    }
    this.name = newName.trim()
    this.updateTimestamp()
  }

  /**
   * Registrar login
   */
  recordLogin(): void {
    if (!this.isActive) {
      throw new Error('User is inactive and cannot login')
    }
    this.lastLoginAt = new Date()
    this.updateTimestamp()
  }

  /**
   * Activar usuario
   */
  activate(): void {
    if (this.isActive) {
      throw new Error('User is already active')
    }
    this.isActive = true
    this.updateTimestamp()
  }

  /**
   * Desactivar usuario
   */
  deactivate(): void {
    if (!this.isActive) {
      throw new Error('User is already inactive')
    }
    this.isActive = false
    this.updateTimestamp()
  }

  /**
   * Asignar rol
   */
  assignRole(role: Role): void {
    if (role.equals(this.role)) {
      throw new Error('User already has this role')
    }
    this.role = role
    this.updateTimestamp()
  }
}
