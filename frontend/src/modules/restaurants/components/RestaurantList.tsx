import React from 'react'
import { useRestaurantStore } from '@shared/hooks/useRestaurantStore'

export const RestaurantList: React.FC = () => {
  const restaurants = useRestaurantStore((state) => state.restaurants)
  const loading = useRestaurantStore((state) => state.loading)
  const error = useRestaurantStore((state) => state.error)

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>
  if (restaurants.length === 0) return <div>No hay restaurantes</div>

  return (
    <div>
      <h2>Restaurantes</h2>
      <ul>
        {restaurants.map((restaurant) => (
          <li key={restaurant.id}>
            <h3>{restaurant.name}</h3>
            <p>Email: {restaurant.email}</p>
            <p>Teléfono: {restaurant.phone}</p>
            <p>Dirección: {restaurant.address}</p>
            <p>
              {restaurant.city}, {restaurant.country}
            </p>
            <p>Estado: {restaurant.isActive ? 'Activo' : 'Inactivo'}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
