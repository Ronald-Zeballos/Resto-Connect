import axios from 'axios'

// Usar URL relativa para que Vite proxy lo haga funcionar correctamente
const API_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a las peticiones
apiClient.interceptors.request.use((config) => {
  console.log(`📤 [API Request] ${config.method?.toUpperCase()} ${config.url}`)
  console.log('📦 Config:', {
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    hasBody: !!config.data
  })
  
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('🔐 Token agregado al header')
  }
  return config
})

// Interceptor para logs de respuesta
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Response] ${response.status} ${response.config.url}`)
    console.log('📊 Response data:', response.data)
    return response
  },
  (error) => {
    console.error(`❌ [API Error] ${error.response?.status} ${error.config?.url}`)
    console.error('📋 Error response:', error.response?.data)
    console.error('📌 Error message:', error.message)
    return Promise.reject(error)
  }
)

export class AuthService {
  static async register(data: {
    email: string
    password: string
    name: string
    role?: string
  }) {
    const response = await apiClient.post('/auth/register', data)
    return response.data.data
  }

  static async login(data: { email: string; password: string }) {
    console.log('🔐 [AuthService.login] Iniciando login con email:', data.email)
    console.log('📤 [AuthService.login] Enviando POST a /auth/login')
    
    try {
      const response = await apiClient.post('/auth/login', data)
      
      console.log('✅ [AuthService.login] Respuesta exitosa')
      console.log('📊 Response data:', response.data)
      
      const { accessToken, refreshToken, user } = response.data.data
      
      console.log('💾 Guardando tokens en localStorage')
      // Guardar tokens
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      console.log('✅ [AuthService.login] Login completado')
      return { user, accessToken, refreshToken }
    } catch (error) {
      console.error('❌ [AuthService.login] Error:', error)
      throw error
    }
  }

  static async logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  static getStoredToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  static getStoredUser(): any | null {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}

export default apiClient
