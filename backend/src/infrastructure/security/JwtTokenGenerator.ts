/**
 * Interfaz para generador de JWT tokens
 */
export interface IJwtTokenGenerator {
  generateAccessToken(userId: string, email: string): string
  generateRefreshToken(userId: string): string
  validateToken(token: string): { userId: string; email: string } | null
  validateRefreshToken(token: string): { userId: string } | null
}

/**
 * Implementación simulada de JWT generator
 * TODO: Usar jsonwebtoken library para producción
 */
export class JwtTokenGenerator implements IJwtTokenGenerator {
  private readonly accessTokenExpiry = 3600 // 1 hour
  private readonly refreshTokenExpiry = 604800 // 7 days

  generateAccessToken(userId: string, email: string): string {
    // Simulación para desarrollo
    // En producción usar: jwt.sign({userId, email}, SECRET, {expiresIn: '1h'})
    const payload = JSON.stringify({
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.accessTokenExpiry,
      type: 'access',
    })
    return Buffer.from(payload).toString('base64')
  }

  generateRefreshToken(userId: string): string {
    // Simulación para desarrollo
    const payload = JSON.stringify({
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.refreshTokenExpiry,
      type: 'refresh',
    })
    return Buffer.from(payload).toString('base64')
  }

  validateToken(token: string): { userId: string; email: string } | null {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())

      if (decoded.type !== 'access') {
        return null
      }

      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return null // Token expirado
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
      }
    } catch {
      return null
    }
  }

  validateRefreshToken(token: string): { userId: string } | null {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())

      if (decoded.type !== 'refresh') {
        return null
      }

      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return null // Token expirado
      }

      return {
        userId: decoded.userId,
      }
    } catch {
      return null
    }
  }
}
