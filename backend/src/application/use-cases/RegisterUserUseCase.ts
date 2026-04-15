import { IUseCase } from '../IUseCase'
import { RegisterUserDTO, UserResponseDTO } from '../dtos/AuthDTO'
import { IUserRepository } from '@domain/aggregates/IUserRepository'
import { User } from '@domain/aggregates/User'
import { Email } from '@domain/value-objects/Email'
import { Password } from '@domain/value-objects/Password'
import { Role, UserRole } from '@domain/value-objects/Role'
import { IPasswordHasher } from '@infrastructure/security/PasswordHasher'

/**
 * Caso de uso: Registrar nuevo usuario
 */
export class RegisterUserUseCase
  implements IUseCase<RegisterUserDTO, UserResponseDTO>
{
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(request: RegisterUserDTO): Promise<UserResponseDTO> {
    // Validar email
    const email = Email.create(request.email)

    // Verificar si email ya existe
    const existingUser = await this.userRepository.findByEmail(request.email)
    if (existingUser) {
      throw new Error(`User with email ${request.email} already exists`)
    }

    // Crear y validar password
    const plainPassword = Password.create(request.password)

    // Hashear password
    const hashedPassword = await this.passwordHasher.hash(request.password)
    const hashedPasswordVo = Password.createFromHash(hashedPassword)

    // Determinar rol
    const role = request.role
      ? Role.create(request.role as UserRole)
      : Role.customer()

    // Crear agregado
    const user = User.create({
      email,
      password: hashedPasswordVo,
      name: request.name,
      role,
    })

    // Persistir
    await this.userRepository.save(user)

    // Retornar DTO
    return this.toPresentationModel(user)
  }

  private toPresentationModel(user: User): UserResponseDTO {
    return new UserResponseDTO({
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      name: user.getName(),
      role: user.getRole().getValue(),
      isActive: user.isUserActive(),
      lastLoginAt: user.getLastLoginAt(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    })
  }
}
