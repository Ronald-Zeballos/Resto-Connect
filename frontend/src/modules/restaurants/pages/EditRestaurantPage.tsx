import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RestaurantService } from '@core/services/RestaurantService'
import { useRestaurantStore } from '@shared/hooks/useRestaurantStore'
import '../styles/RestaurantForm.css'

export const EditRestaurantPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { restaurants, loading, error } = useRestaurantStore()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Buscar el restaurante a editar
  useEffect(() => {
    if (id && restaurants.length > 0) {
      const restaurant = restaurants.find((r) => r.id === id)
      if (restaurant) {
        setFormData({
          name: restaurant.name,
          phone: restaurant.phone,
          address: restaurant.address,
          city: restaurant.city,
          country: restaurant.country,
        })
      }
    }
  }, [id, restaurants])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) {
      setSubmitError('ID no encontrado')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await RestaurantService.update(id, formData)
      navigate('/restaurants')
    } catch (err) {
      setSubmitError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="loading">Cargando...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="form-container">
      <h1>Editar Restaurante</h1>

      {submitError && <div className="error-message">{submitError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre *</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Teléfono *</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Dirección *</label>
          <input
            id="address"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">Ciudad *</label>
          <input
            id="city"
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">País *</label>
          <input
            id="country"
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/restaurants')}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
