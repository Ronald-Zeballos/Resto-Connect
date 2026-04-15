import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
}

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  
  setTokens: (accessToken, refreshToken) =>
    set({ accessToken, refreshToken }),
  
  setError: (error) => set({ error }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  logout: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
    }),
  
  isAuthenticated: () => {
    const { user, accessToken } = get()
    return !!user && !!accessToken
  },
}))
