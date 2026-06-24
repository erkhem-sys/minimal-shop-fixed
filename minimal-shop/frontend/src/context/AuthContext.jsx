import { createContext, useContext, useEffect, useState } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)
const TOKEN_KEY = 'minimal-shop-token'
const USER_KEY = 'minimal-shop-user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = window.localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(USER_KEY)
    }
  }, [user])

  async function login(email, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      window.localStorage.setItem(TOKEN_KEY, data.token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  async function register(name, phone, email, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/register', { name, phone, email, password })
      window.localStorage.setItem(TOKEN_KEY, data.token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Бүртгүүлэхэд алдаа гарлаа. Дахин оролдоно уу.'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  const value = { user, login, register, logout, loading, error, isAdmin: user?.role === 'admin' }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}
