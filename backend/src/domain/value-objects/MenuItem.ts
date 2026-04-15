/**
 * Value Object: MenuItem
 * Representa un artículo del menú (plato, bebida, postre, etc.)
 */
export class MenuItem {
  private name: string
  private description: string
  private price: number
  private cost: number
  private available: boolean
  private category: string

  constructor(props: {
    name: string
    description: string
    price: number
    cost: number
    category: string
    available?: boolean
  }) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('MenuItem name is required')
    }
    if (props.price <= 0) {
      throw new Error('MenuItem price must be greater than 0')
    }
    if (props.cost < 0 || props.cost > props.price) {
      throw new Error('MenuItem cost must be between 0 and price')
    }
    if (!props.category || props.category.trim().length === 0) {
      throw new Error('MenuItem category is required')
    }

    this.name = props.name
    this.description = props.description || ''
    this.price = props.price
    this.cost = props.cost
    this.category = props.category
    this.available = props.available !== false
  }

  getName(): string {
    return this.name
  }

  getDescription(): string {
    return this.description
  }

  getPrice(): number {
    return this.price
  }

  getCost(): number {
    return this.cost
  }

  getCategory(): string {
    return this.category
  }

  isAvailable(): boolean {
    return this.available
  }

  getProfit(): number {
    return this.price - this.cost
  }

  getProfitMargin(): number {
    return (this.getProfit() / this.price) * 100
  }

  updatePrice(newPrice: number): void {
    if (newPrice <= 0) {
      throw new Error('Price must be greater than 0')
    }
    if (this.cost > newPrice) {
      throw new Error('Price must be greater than or equal to cost')
    }
    this.price = newPrice
  }

  updateAvailability(isAvailable: boolean): void {
    this.available = isAvailable
  }

  equals(other: MenuItem): boolean {
    return (
      this.name === other.name &&
      this.price === other.price &&
      this.cost === other.cost &&
      this.category === other.category
    )
  }

  static create(props: {
    name: string
    description?: string
    price: number
    cost: number
    category: string
    available?: boolean
  }): MenuItem {
    return new MenuItem({
      name: props.name,
      description: props.description || '',
      price: props.price,
      cost: props.cost,
      category: props.category,
      available: props.available,
    })
  }
}
