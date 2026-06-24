import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { LogOut, Package, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { formatPrice, formatDate } from '../utils/format'
import api from '../utils/api'

const STATUS_LABELS = {
  pending: 'Хүлээгдэж байна',
  processing: 'Боловсруулж байна',
  shipped: 'Хүргэгдэж байна',
  delivered: 'Хүргэгдсэн',
  cancelled: 'Цуцлагдсан',
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function fetchOrders() {
      try {
        const { data } = await api.get('/orders')
        if (active) setOrders(data.orders || [])
      } catch {
        if (active) setOrders([])
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchOrders()
    return () => {
      active = false
    }
  }, [])

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="eyebrow mb-2"><span className="eyebrow-dot" />Профайл</p>
          <h1 className="font-display font-bold text-2xl">{user.name}</h1>
          <p className="text-sm text-clay mt-1">{user.email} · {user.phone}</p>
        </div>
        <button onClick={logout} className="btn-ghost border border-rule">
          <LogOut size={15} /> Гарах
        </button>
      </div>

      <p className="eyebrow mb-4"><span className="eyebrow-dot" />Захиалгын түүх</p>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-clay">
          <Loader2 size={16} className="animate-spin" /> Уншиж байна...
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-16 border border-rule rounded-xl">
          <Package size={28} className="text-clay mx-auto mb-3" />
          <p className="text-sm text-clay mb-4">Та одоогоор захиалга хийгээгүй байна.</p>
          <Link to="/products" className="btn-secondary">Бараа үзэх</Link>
        </div>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="border border-rule rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-sm">Захиалга #{order.id}</p>
              <p className="text-xs text-clay mt-0.5">{formatDate(order.created_at)}</p>
            </div>
            <span className="inline-flex items-center text-xs font-medium rounded-full bg-navy/10 text-navy px-3 py-1">
              {STATUS_LABELS[order.status] || order.status}
            </span>
            <span className="price-tag text-sm font-semibold">{formatPrice(order.total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
