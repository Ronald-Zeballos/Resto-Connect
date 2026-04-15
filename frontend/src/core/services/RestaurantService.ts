import axios from 'axios'

// Usar URL relativa para que Vite proxy lo haga funcionar correctamente
const API_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface ListResponse {
  data: any[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export class RestaurantService {
  // Create
  static async create(data: any) {
    const response = await apiClient.post('/restaurants', data)
    return response.data.data
  }

  static async createRestaurant(data: any) {
    return this.create(data)
  }

  // Get by ID
  static async getById(id: string) {
    const response = await apiClient.get(`/restaurants/${id}`)
    return response.data.data
  }

  static async getRestaurantById(id: string) {
    return this.getById(id)
  }

  // List all with pagination
  static async list(page = 1, limit = 10): Promise<ListResponse> {
    const response = await apiClient.get('/restaurants', {
      params: { page, limit },
    })
    return response.data
  }

  static async getAllRestaurants() {
    const response = await this.list(1, 100)
    return response.data
  }

  // Update
  static async update(id: string, data: any) {
    const response = await apiClient.put(`/restaurants/${id}`, data)
    return response.data.data
  }

  // Delete (soft delete)
  static async delete(id: string) {
    await apiClient.delete(`/restaurants/${id}`)
  }

  // Get restaurants by owner
  static async getByOwner(ownerId: string, page = 1, limit = 10): Promise<ListResponse> {
    const response = await apiClient.get(`/restaurants/owner/${ownerId}`, {
      params: { page, limit },
    })
    return response.data
  }
}

export default apiClient
