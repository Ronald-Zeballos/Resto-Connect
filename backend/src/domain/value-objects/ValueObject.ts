/**
 * Clase base para Value Objects (Objetos de Valor)
 * Representan conceptos sin identidad, solo comparable por su valor
 */
export abstract class ValueObject<T> {
  protected readonly value: T

  constructor(value: T) {
    this.validate(value)
    this.value = value
  }

  getValue(): T {
    return this.value
  }

  protected abstract validate(value: T): void | never

  abstract equals(vo: ValueObject<T>): boolean
}
