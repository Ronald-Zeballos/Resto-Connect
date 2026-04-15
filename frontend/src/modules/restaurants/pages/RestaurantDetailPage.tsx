import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RestaurantService } from '@core/services/RestaurantService'
import '../styles/RestaurantDetail.css'

interface RestaurantDetail {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export const RestaurantDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const loadRestaurant = async () => {
      if (!id) return
      try {
        const data = await RestaurantService.getById(id)
        setRestaurant(data as RestaurantDetail)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadRestaurant()
  }, [id])

  const handleDelete = async () => {
    if (!id) return

    try {
      await RestaurantService.delete(id)
      navigate('/restaurants')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (loading) return <div className="loading">Cargando...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!restaurant) return <div className="error">Restaurante no encontrado</div>

  return (
    <div className="detail-container">
      <button onClick={() => navigate('/restaurants')} className="btn-back">
        ← Volver
      </button>

      <div className="detail-card">
        <h1>{restaurant.name}</h1>

        <div className="detail-grid">
          <div className="detail-item">
            <label>Email:</label>
            <p>{restaurant.email}</p>
          </div>

          <div className="detail-item">
            <label>Teléfono:</label>
            <p>{restaurant.phone}</p>
          </div>

          <div className="detail-item">
            <label>Dirección:</label>
            <p>{restaurant.address}</p>
          </div>

          <div className="detail-item">
            <label>Ciudad:</label>
            <p>{restaurant.city}</p>
          </div>

          <div className="detail-item">
            <label>País:</label>
            <p>{restaurant.country}</p>
          </div>

          <div className="detail-item">
            <label>Estado:</label>
            <p className={restaurant.isActive ? 'status-active' : 'status-inactive'}>
              {restaurant.isActive ? 'Activo' : 'Inactivo'}
            </p>
          </div>

          <div className="detail-item">
            <label>Creado:</label>
            <p>{new Date(restaurant.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="detail-item">
            <label>Última actualización:</label>
            <p>{new Date(restaurant.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="action-buttons">
          <button
            onClick={() => navigate(`/restaurants/${restaurant.id}/menu`)}
            className="btn-primary"
          >
            📋 Gestionar Menú
          </button>

          <button
            onClick={() => navigate(`/restaurants/edit/${restaurant.id}`)}
            className="btn-primary"
          >
            ✏️ Editar
          </button>

          <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger">
            🗑️ Eliminar
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>¿Eliminar restaurante?</h2>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button onClick={handleDelete} className="btn-danger">
                Sí, eliminar
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
