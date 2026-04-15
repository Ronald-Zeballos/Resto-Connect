import axios from 'axios'

// Usar URL relativa para que Vite proxy lo haga funcionar correctamente
const API_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface MenuItem {
  name: string
  description: string
  price: number
  cost: number
  category: string
  available: boolean
}

export class MenuService {
  // Create menu
  static async create(restaurantId: string, name: string) {
    const response = await apiClient.post('/menus', {
      restaurantId,
      name,
    })
    return response.data.data
  }

  // Get menu by restaurant
  static async getByRestaurant(restaurantId: string) {
    const response = await apiClient.get(`/menus/restaurant/${restaurantId}`)
    return response.data.data
  }

  // Get or create menu for restaurant
  static async getOrCreateByRestaurant(restaurantId: string) {
    try {
      return await this.getByRestaurant(restaurantId)
    } catch (error) {
      // If menu doesn't exist, create a default one
      return await this.create(restaurantId, 'Main Menu')
    }
  }

  // Add menu item
  static async addMenuItem(menuId: string, item: MenuItem) {
    const response = await apiClient.post(`/menus/${menuId}/items`, item)
    return response.data.data
  }

  // Update menu item
  static async updateMenuItem(
    menuId: string,
    itemIndex: number,
    updates: Partial<MenuItem>
  ) {
    const response = await apiClient.put(
      `/menus/${menuId}/items/${itemIndex}`,
      updates
    )
    return response.data.data
  }

  // Delete menu item
  static async deleteMenuItem(menuId: string, itemIndex: number) {
    const response = await apiClient.delete(
      `/menus/${menuId}/items/${itemIndex}`
    )
    return response.data.data
  }
}

export default apiClient
