import { create } from 'zustand'
import { RestaurantService } from '@core/services/RestaurantService'

interface Restaurant {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  ownerId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface RestaurantStore {
  restaurants: Restaurant[]
  loading: boolean
  error: string | null
  pagination: Pagination | null
  setRestaurants: (restaurants: Restaurant[]) => void
  addRestaurant: (restaurant: Restaurant) => void
  updateRestaurant: (id: string, restaurant: Partial<Restaurant>) => void
  removeRestaurant: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPage: (page: number, limit?: number) => Promise<void>
}

export const useRestaurantStore = create<RestaurantStore>((set) => ({
  restaurants: [],
  loading: false,
  error: null,
  pagination: null,

  setRestaurants: (restaurants) => set({ restaurants }),

  addRestaurant: (restaurant) =>
    set((state) => ({
      restaurants: [...state.restaurants, restaurant],
    })),

  updateRestaurant: (id, updates) =>
    set((state) => ({
      restaurants: state.restaurants.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  removeRestaurant: (id) =>
    set((state) => ({
      restaurants: state.restaurants.filter((r) => r.id !== id),
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setPage: async (page, limit = 10) => {
    set({ loading: true, error: null })
    try {
      const response = await RestaurantService.list(page, limit)
      set({
        restaurants: response.data,
        pagination: response.pagination,
        loading: false,
      })
    } catch (err) {
      set({
        error: (err as Error).message,
        loading: false,
      })
    }
  },
}))

