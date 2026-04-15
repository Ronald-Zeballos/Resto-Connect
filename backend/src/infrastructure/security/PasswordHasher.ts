/**
 * Interfaz para el servicio de hashing de passwords
 */
export interface IPasswordHasher {
  hash(plainPassword: string): Promise<string>
  compare(plainPassword: string, hash: string): Promise<boolean>
}

/**
 * Implementación de PasswordHasher (será usado por use cases)
 * Usa bcrypt para seguridad
 */
export class PasswordHasher implements IPasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    // TODO: Implementar con bcrypt cuando se agregue dependencia
    // Por ahora simulamos con encoding simple para desarrollo
    return Buffer.from(`bcrypt:${plainPassword}`).toString('base64')
  }

  async compare(plainPassword: string, hash: string): Promise<boolean> {
    // TODO: Implementar con bcrypt.compare cuando sea disponible
    const encoded = Buffer.from(`bcrypt:${plainPassword}`).toString('base64')
    return encoded === hash
  }
}
