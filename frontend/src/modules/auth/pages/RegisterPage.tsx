import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '@core/services/AuthService'
import { useAuthStore } from '@shared/hooks/useAuthStore'

interface RegisterPageProps {
  onRegisterSuccess?: () => void
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'CUSTOMER',
  })

  const { setUser, setLoading, setError } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

    try {
      setLoading(true)
      const result = await AuthService.register(formData)
      
      setUser(result)
      
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'CUSTOMER',
      })
      
      if (onRegisterSuccess) {
        onRegisterSuccess()
      }

      // Redirigir a login
      navigate('/login')
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className='auth-container'>
      <form onSubmit={handleSubmit} className='auth-form'>
        <h2>Registrarse</h2>
        
        <input
          type='text'
          name='name'
          placeholder='Nombre completo'
          value={formData.name}
          onChange={handleChange}
          required
        />
        
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
          placeholder='Contraseña (mín. 8 caracteres)'
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
        />
        
        <select
          name='role'
          value={formData.role}
          onChange={handleChange}
        >
          <option value='CUSTOMER'>Cliente</option>
          <option value='RESTAURANT_OWNER'>Propietario de Restaurante</option>
          <option value='DELIVERY_DRIVER'>Repartidor</option>
        </select>
        
        <button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  )
}
