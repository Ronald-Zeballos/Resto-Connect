import { IUseCase } from '../IUseCase'
import { IJwtTokenGenerator } from '@infrastructure/security/JwtTokenGenerator'

/**
 * Caso de uso: Validar token JWT
 */
export class ValidateTokenUseCase
  implements IUseCase<{ token: string }, { userId: string; email: string }>
{
  constructor(private tokenGenerator: IJwtTokenGenerator) {}

  async execute(request: { token: string }): Promise<{
    userId: string
    email: string
  }> {
    const decoded = this.tokenGenerator.validateToken(request.token)

    if (!decoded) {
      throw new Error('Invalid or expired token')
    }

    return decoded
  }
}

/**
 * Caso de uso: Renovar token con refresh token
 */
export class RefreshTokenUseCase
  implements IUseCase<{ refreshToken: string }, { accessToken: string }>
{
  constructor(private tokenGenerator: IJwtTokenGenerator) {}

  async execute(request: { refreshToken: string }): Promise<{
    accessToken: string
  }> {
    const decoded = this.tokenGenerator.validateRefreshToken(request.refreshToken)

    if (!decoded) {
      throw new Error('Invalid or expired refresh token')
    }

    // Generar nuevo access token
    // Nota: Idealmente reconstruiríamos el usuario completo, pero para simplificar
    // usamos solo el userId. En un caso real, buscaríamos el usuario en DB.
    const accessToken = this.tokenGenerator.generateAccessToken(
      decoded.userId,
      '' // Email no disponible aquí
    )

    return { accessToken }
  }
}
