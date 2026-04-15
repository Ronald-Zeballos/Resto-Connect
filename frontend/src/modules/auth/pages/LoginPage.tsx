import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '@core/services/AuthService'
import { useAuthStore } from '@shared/hooks/useAuthStore'

interface LoginPageProps {
  onLoginSuccess?: () => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { setUser, setTokens, setLoading, setError } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    console.log('🔐 [LoginPage] Iniciando login...')
    console.log('📧 Email:', formData.email)

    try {
      setLoading(true)
      console.log('🔄 [LoginPage] Llamando AuthService.login()...')
      const result = await AuthService.login(formData)
      
      console.log('✅ [LoginPage] Login exitoso')
      console.log('👤 Usuario recibido:', result.user)
      
      setUser(result.user)
      setTokens(result.accessToken, result.refreshToken)
      
      // Guardar usuario en localStorage
      localStorage.setItem('user', JSON.stringify(result.user))
      
      setFormData({
        email: '',
        password: '',
      })
      
      if (onLoginSuccess) {
        onLoginSuccess()
      }

      console.log('🚀 [LoginPage] Redirigiendo a /restaurants')
      // Redirigir a restaurantes
      navigate('/restaurants')
    } catch (error) {
      const errorMsg = (error as Error).message
      console.error('❌ [LoginPage] Error en login:', errorMsg)
      console.error('🔍 Error completo:', error)
      setError(errorMsg)
    } finally {
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className='auth-container'>
      <form onSubmit={handleSubmit} className='auth-form'>
        <h2>Iniciar Sesión</h2>
        
        <input
          type='email'
          name='email'
          placeholder='Email'
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <input
          type='password'
          name='password'
          placeholder='Contraseña'
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        <button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  )
}
