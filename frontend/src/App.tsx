import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RestaurantListPage } from './modules/restaurants/pages/RestaurantListPage'
import { RestaurantDetailPage } from './modules/restaurants/pages/RestaurantDetailPage'
import { EditRestaurantPage } from './modules/restaurants/pages/EditRestaurantPage'
import { MenuEditorPage } from './modules/restaurants/pages/MenuEditorPage'
import { RestaurantsPage } from './modules/restaurants/pages/RestaurantsPage'
import { LoginPage } from './modules/auth/pages/LoginPage'
import { RegisterPage } from './modules/auth/pages/RegisterPage'
import { Navbar } from './modules/auth/components/AuthComponents'
import { ProtectedRoute } from './modules/auth/components/AuthComponents'
import { useAuthStore } from './shared/hooks/useAuthStore'
import './App.css'

function AppContent() {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')

    if (storedUser && storedToken && storedRefreshToken) {
      useAuthStore.setState({
        user: JSON.parse(storedUser),
        accessToken: storedToken,
        refreshToken: storedRefreshToken,
      })
    }
  }, [])

  return (
    <div className="app">
      <Navbar />
      <header>
        <h1>🍽️ Resto-Connect</h1>
      </header>

      <main>
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<LoginPage onLoginSuccess={() => {}} />} />
              <Route path="/register" element={<RegisterPage onRegisterSuccess={() => {}} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route path="/restaurants" element={<RestaurantListPage />} />
              <Route path="/restaurants/create" element={<RestaurantsPage />} />
              <Route path="/restaurants/edit/:id" element={<EditRestaurantPage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
              <Route path="/restaurants/:restaurantId/menu" element={<MenuEditorPage />} />
              <Route path="*" element={<Navigate to="/restaurants" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App

