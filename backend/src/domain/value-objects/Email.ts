import { ValueObject } from './ValueObject'

export class Email extends ValueObject<string> {
  static readonly MAX_LENGTH = 255
  static readonly MIN_LENGTH = 5

  static create(email: string): Email {
    return new Email(email)
  }

  protected validate(value: string): void {
    if (!value || value.length < Email.MIN_LENGTH || value.length > Email.MAX_LENGTH) {
      throw new Error(`Email must be between ${Email.MIN_LENGTH} and ${Email.MAX_LENGTH} characters`)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format')
    }
  }

  equals(vo: Email): boolean {
    return this.value === vo.value
  }
}
