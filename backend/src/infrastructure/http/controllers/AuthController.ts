import { Request, Response } from 'express'
import { RegisterUserDTO, LoginUserDTO } from '@application/dtos/AuthDTO'
import { RegisterUserUseCase } from '@application/use-cases/RegisterUserUseCase'
import { LoginUserUseCase } from '@application/use-cases/LoginUserUseCase'
import { ValidateTokenUseCase } from '@application/use-cases/TokenUseCase'

/**
 * Controller para autenticación
 * Adapta las solicitudes HTTP a casos de uso del dominio
 */
export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private validateTokenUseCase: ValidateTokenUseCase
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, role } = req.body

      const registerDto = new RegisterUserDTO({
        email,
        password,
        name,
        role,
      })

      const result = await this.registerUserUseCase.execute(registerDto)

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    console.log('🔐 [AuthController.login] Iniciando login')
    console.log('📧 Email recibido:', req.body?.email)
    
    try {
      const { email, password } = req.body
      
      console.log('✓ Email:', email)
      console.log('✓ Password length:', password?.length)

      const loginDto = new LoginUserDTO({
        email,
        password,
      })
      
      console.log('🔄 Ejecutando LoginUserUseCase...')
      const result = await this.loginUserUseCase.execute(loginDto)
      console.log('✅ Login exitoso')

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      })
    } catch (error) {
      console.error('❌ Error en login:', error)
      res.status(401).json({
        success: false,
        error: (error as Error).message,
      })
    }
  }

  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'Missing authorization header',
        })
        return
      }

      const token = authHeader.substring(7)
      const result = await this.validateTokenUseCase.execute({ token })

      res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      res.status(401).json({
        success: false,
        error: (error as Error).message,
      })
    }
  }
}
