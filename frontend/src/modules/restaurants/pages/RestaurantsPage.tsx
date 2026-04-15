import React from 'react'
import { RestaurantForm } from '../components/RestaurantForm'
import { RestaurantList } from '../components/RestaurantList'

export const RestaurantsPage: React.FC = () => {
  return (
    <div>
      <h1>Gestión de Restaurantes</h1>
      <RestaurantForm />
      <RestaurantList />
    </div>
  )
}
