import { createContext, useContext, useEffect, useReducer } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'minimal-shop-cart'

function loadInitialCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload
      const existing = state.find((item) => item.id === product.id)
      if (existing) {
        return state.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        )
      }
      return [
        ...state,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          stock: product.stock,
          quantity: Math.min(quantity, product.stock),
        },
      ]
    }
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return state.filter((item) => item.id !== id)
      }
      return state.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      )
    }
    case 'REMOVE_ITEM':
      return state.filter((item) => item.id !== action.payload.id)
    case 'CLEAR_CART':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadInitialCart)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product, quantity = 1) => dispatch({ type: 'ADD_ITEM', payload: { product, quantity } })
  const updateQuantity = (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: { id } })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const value = { items, addItem, updateQuantity, removeItem, clearCart, itemCount, subtotal }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
