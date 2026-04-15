import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRestaurantStore } from '@shared/hooks/useRestaurantStore'
import '../styles/RestaurantList.css'

export const RestaurantListPage = () => {
  const navigate = useNavigate()
  const storeData = useRestaurantStore()
  const restaurants = storeData.restaurants || []
  const loading = storeData.loading
  const error = storeData.error
  const setPage = storeData.setPage
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  console.log('🏪 [RestaurantListPage] Renderizando, restaurants:', restaurants.length)

  useEffect(() => {
    console.log('🔄 [RestaurantListPage] setPage llamado con page:', currentPage)
    setPage(currentPage)
  }, [currentPage, setPage])

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1)
  }

  if (loading && restaurants.length === 0) {
    return <div className="loading">Cargando restaurantes...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  const totalPages = Math.ceil(restaurants.length / itemsPerPage)

  return (
    <div className="list-container">
      <div className="list-header">
        <h1>Restaurantes</h1>
        <button
          onClick={() => navigate('/restaurants/create')}
          className="btn-primary"
        >
          + Nuevo Restaurante
        </button>
      </div>

      {restaurants.length === 0 ? (
        <div className="empty-state">
          <p>No hay restaurantes disponibles</p>
          <button
            onClick={() => navigate('/restaurants/create')}
            className="btn-primary"
          >
            Crear el primero
          </button>
        </div>
      ) : (
        <>
          <div className="restaurant-grid">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="restaurant-card">
                <h3>{restaurant.name}</h3>
                <p className="email">{restaurant.email}</p>
                <p className="location">
                  📍 {restaurant.city}, {restaurant.country}
                </p>
                <p className="phone">📱 {restaurant.phone}</p>

                <div className="card-actions">
                  <button
                    onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                    className="btn-secondary"
                  >
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => navigate(`/restaurants/edit/${restaurant.id}`)}
                    className="btn-secondary"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="btn-secondary"
            >
              ← Anterior
            </button>
            <span className="page-info">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="btn-secondary"
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
