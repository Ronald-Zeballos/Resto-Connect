import { ValueObject } from './ValueObject'

export class Money extends ValueObject<number> {
  static readonly MAX_VALUE = 999999.99
  static readonly MIN_VALUE = 0

  static create(amount: number): Money {
    return new Money(amount)
  }

  protected validate(value: number): void {
    if (typeof value !== 'number' || value < Money.MIN_VALUE || value > Money.MAX_VALUE) {
      throw new Error(`Money must be between ${Money.MIN_VALUE} and ${Money.MAX_VALUE}`)
    }
  }

  add(money: Money): Money {
    return new Money(this.value + money.value)
  }

  subtract(money: Money): Money {
    return new Money(this.value - money.value)
  }

  equals(vo: Money): boolean {
    return this.value === vo.value
  }
}
