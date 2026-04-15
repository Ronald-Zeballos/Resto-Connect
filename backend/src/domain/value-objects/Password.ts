import { ValueObject } from './ValueObject'
import crypto from 'crypto'

/**
 * Password hasheada y segura
 * Valida longitud mínima y prepara para hashing
 */
export class Password extends ValueObject<string> {
  static readonly MIN_LENGTH = 8
  static readonly MAX_LENGTH = 255

  // Para reconstruir desde BD (ya hasheado)
  static createFromHash(hash: string): Password {
    return new Password(hash)
  }

  // Para crear nuevo password (plain text, será hasheado después)
  static create(plainPassword: string): Password {
    return new Password(plainPassword)
  }

  protected validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('Password must be a valid string')
    }

    // Solo validar longitud si es password plain (no hasheado)
    // Los hasheados son más largos (~60 chars bcrypt)
    if (!value.startsWith('$2')) {
      if (value.length < Password.MIN_LENGTH) {
        throw new Error(`Password must be at least ${Password.MIN_LENGTH} characters`)
      }
      if (value.length > Password.MAX_LENGTH) {
        throw new Error(`Password must be at most ${Password.MAX_LENGTH} characters`)
      }
    }
  }

  isPlainText(): boolean {
    // Detecta si es plain text (no hasheado)
    return !this.value.startsWith('$2')
  }

  equals(vo: Password): boolean {
    return this.value === vo.value
  }
}
