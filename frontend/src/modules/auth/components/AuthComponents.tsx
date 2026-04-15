import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@shared/hooks/useAuthStore'
import { AuthService } from '@core/services/AuthService'

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())

  if (!isAuthenticated) {
    const user = useAuthStore((state) => state.user)
    const accessToken = useAuthStore((state) => state.accessToken)

    // Si no hay user en store, intentar recargarlo desde localStorage
    if (!user || !accessToken) {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('accessToken')
      const storedRefreshToken = localStorage.getItem('refreshToken')

      if (storedUser && storedToken && storedRefreshToken) {
        useAuthStore.setState({
          user: JSON.parse(storedUser),
          accessToken: storedToken,
          refreshToken: storedRefreshToken,
        })
        return <>{children}</>
      }

      return (
        <div className='protected-route-error'>
          <h2>Acceso Denegado</h2>
          <p>Debes iniciar sesión para acceder a esta página.</p>
          <a href='/login'>Ir a Login</a>
        </div>
      )
    }
  }

  return <>{children}</>
}

export const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    AuthService.logout()
    logout()
    navigate('/login')
  }

  return (
    <nav className='navbar'>
      <div className='navbar-brand'>🍽️ Resto-Connect</div>
      <div className='navbar-menu'>
        {user ? (
          <>
            <span className='navbar-user'>
              {user.name} ({user.role})
            </span>
            <button onClick={handleLogout} className='navbar-logout'>
              Logout
            </button>
          </>
        ) : (
          <>
            <a href='/login'>Login</a>
            <a href='/register'>Register</a>
          </>
        )}
      </div>
    </nav>
  )
}
