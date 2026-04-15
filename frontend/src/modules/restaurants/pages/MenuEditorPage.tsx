import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MenuService } from '@core/services/MenuService'
import '../styles/MenuEditor.css'

interface MenuItem {
  name: string
  description: string
  price: number
  cost: number
  category: string
  available: boolean
}

export const MenuEditorPage = () => {
  const navigate = useNavigate()
  const { restaurantId } = useParams<{ restaurantId: string }>()
  const [menu, setMenu] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItem, setNewItem] = useState<MenuItem>({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    category: 'Main',
    available: true,
  })

  useEffect(() => {
    if (!restaurantId) return

    const loadMenu = async () => {
      try {
        const data = await MenuService.getOrCreateByRestaurant(restaurantId)
        setMenu(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [restaurantId])

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!menu) return

    try {
      const updatedMenu = await MenuService.addMenuItem(menu.id, newItem)
      setMenu(updatedMenu)
      setNewItem({
        name: '',
        description: '',
        price: 0,
        cost: 0,
        category: 'Main',
        available: true,
      })
      setIsAddingItem(false)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleDeleteItem = async (index: number) => {
    if (!menu) return

    try {
      const updatedMenu = await MenuService.deleteMenuItem(menu.id, index)
      setMenu(updatedMenu)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (loading) return <div className="loading">Cargando menú...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!menu) return <div className="error">Menú no encontrado</div>

  return (
    <div className="menu-editor-container">
      <button onClick={() => navigate(`/restaurants/${restaurantId}`)} className="btn-back">
        ← Volver a Restaurante
      </button>

      <div className="menu-header">
        <h1>Editar Menú: {menu.name}</h1>
        <p className="item-count">{menu.items.length} artículos</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="menu-items">
        {menu.items.length === 0 ? (
          <div className="empty-menu">
            <p>El menú está vacío. Agrega tu primer artículo.</p>
          </div>
        ) : (
          <div className="items-list">
            {menu.items.map((item: any, index: number) => (
              <div key={index} className="menu-item-card">
                <div className="item-header">
                  <h3>{item.name}</h3>
                  <button
                    onClick={() => handleDeleteItem(index)}
                    className="btn-delete-item"
                  >
                    ×
                  </button>
                </div>
                <p className="item-description">{item.description}</p>
                <div className="item-info">
                  <span className="category">{item.category}</span>
                  <span className="price">${item.price.toFixed(2)}</span>
                  <span className={`availability ${item.available ? 'available' : 'unavailable'}`}>
                    {item.available ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                <div className="item-details">
                  <small>Costo: ${item.cost.toFixed(2)}</small>
                  <small>Ganancia: ${(item.price - item.cost).toFixed(2)}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isAddingItem ? (
        <button onClick={() => setIsAddingItem(true)} className="btn-add-item">
          + Agregar Artículo
        </button>
      ) : (
        <form onSubmit={handleAddItem} className="add-item-form">
          <h3>Nuevo Artículo</h3>

          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoría *</label>
              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
              >
                <option>Main</option>
                <option>Side</option>
                <option>Dessert</option>
                <option>Beverage</option>
              </select>
            </div>

            <div className="form-group">
              <label>Precio *</label>
              <input
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: parseFloat(e.target.value) })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Costo *</label>
              <input
                type="number"
                step="0.01"
                value={newItem.cost}
                onChange={(e) =>
                  setNewItem({ ...newItem, cost: parseFloat(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="available"
              checked={newItem.available}
              onChange={(e) =>
                setNewItem({ ...newItem, available: e.target.checked })
              }
            />
            <label htmlFor="available">Disponible</label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Agregar
            </button>
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
