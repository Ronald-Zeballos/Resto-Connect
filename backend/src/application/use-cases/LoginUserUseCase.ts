import { IUseCase } from '../IUseCase'
import { LoginUserDTO, AuthResponseDTO } from '../dtos/AuthDTO'
import { IUserRepository } from '@domain/aggregates/IUserRepository'
import { IPasswordHasher } from '@infrastructure/security/PasswordHasher'
import { IJwtTokenGenerator } from '@infrastructure/security/JwtTokenGenerator'
import { UserResponseDTO } from '../dtos/AuthDTO'

/**
 * Caso de uso: Login de usuario con email y password
 */
export class LoginUserUseCase implements IUseCase<LoginUserDTO, AuthResponseDTO> {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
    private tokenGenerator: IJwtTokenGenerator
  ) {}

  async execute(request: LoginUserDTO): Promise<AuthResponseDTO> {
    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(request.email)

    if (!user) {
      throw new Error(`User with email ${request.email} not found`)
    }

    // Validar que usuario está activo
    if (!user.isUserActive()) {
      throw new Error('User account is inactive')
    }

    // Validar contraseña
    const passwordMatch = await this.passwordHasher.compare(
      request.password,
      user.getPassword().getValue()
    )

    if (!passwordMatch) {
      throw new Error('Invalid credentials')
    }

    // Registrar login en el agregado
    user.recordLogin()
    await this.userRepository.update(user)

    // Generar tokens
    const accessToken = this.tokenGenerator.generateAccessToken(
      user.getId().getValue(),
      user.getEmail().getValue()
    )
    const refreshToken = this.tokenGenerator.generateRefreshToken(
      user.getId().getValue()
    )

    // Retornar respuesta
    return new AuthResponseDTO({
      accessToken,
      refreshToken,
      user: this.toPresentationModel(user),
    })
  }

  private toPresentationModel(user: any): UserResponseDTO {
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
