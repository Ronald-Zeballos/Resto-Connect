import { Request, Response, NextFunction } from 'express'
import { IJwtTokenGenerator } from '../security/JwtTokenGenerator'

/**
 * Middleware de autenticación JWT
 * Valida el token y agrega la información del usuario al request
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
  }
}

export function createAuthMiddleware(tokenGenerator: IJwtTokenGenerator) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
      })
      return
    }

    const token = authHeader.substring(7)
    const decoded = tokenGenerator.validateToken(token)

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      })
      return
    }

    req.user = decoded
    next()
  }
}

/**
 * Middleware opcional de autenticación
 * No bloquea si no hay token, pero valida si existe
 */
export function createOptionalAuthMiddleware(tokenGenerator: IJwtTokenGenerator) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = tokenGenerator.validateToken(token)
      if (decoded) {
        req.user = decoded
      }
    }

    next()
  }
}
