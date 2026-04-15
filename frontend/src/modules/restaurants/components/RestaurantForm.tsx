import React, { useState } from 'react'
import { RestaurantService } from '@core/services/RestaurantService'
import { useRestaurantStore } from '@shared/hooks/useRestaurantStore'

export const RestaurantForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    ownerId: '',
  })

  const { addRestaurant, setLoading, setError } = useRestaurantStore()
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

    try {
      setLoading(true)
      const newRestaurant = await RestaurantService.createRestaurant(formData)
      addRestaurant(newRestaurant)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        ownerId: '',
      })
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear Restaurante</h2>
      <input
        type="text"
        name="name"
        placeholder="Nombre del restaurante"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="tel"
        name="phone"
        placeholder="Teléfono"
        value={formData.phone}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="address"
        placeholder="Dirección"
        value={formData.address}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="city"
        placeholder="Ciudad"
        value={formData.city}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="country"
        placeholder="País"
        value={formData.country}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="ownerId"
        placeholder="ID del propietario"
        value={formData.ownerId}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creando...' : 'Crear Restaurante'}
      </button>
    </form>
  )
}
