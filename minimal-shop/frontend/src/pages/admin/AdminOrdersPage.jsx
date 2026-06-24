import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import api from '../../utils/api'
import { formatPrice, formatDate } from '../../utils/format'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Хүлээгдэж байна' },
  { value: 'processing', label: 'Боловсруулж байна' },
  { value: 'shipped', label: 'Хүргэгдэж байна' },
  { value: 'delivered', label: 'Хүргэгдсэн' },
  { value: 'cancelled', label: 'Цуцлагдсан' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    try {
      const { data } = await api.get('/orders')
      setOrders(data.orders || [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(orderId, status) {
    setUpdatingId(orderId)
    try {
      await api.put(`/orders/${orderId}`, { status })
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    } catch {
      window.alert('Захиалгын төлөв шинэчлэхэд алдаа гарлаа.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-8">Захиалга</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-clay">
          <Loader2 size={16} className="animate-spin" /> Уншиж байна...
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-rule rounded-xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <div>
                  <p className="font-medium text-sm">Захиалга #{order.id}</p>
                  <p className="text-xs text-clay">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="price-tag text-sm font-semibold">{formatPrice(order.total)}</span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={updatingId === order.id}
                    className="text-sm border border-rule rounded-full px-3 py-1.5 outline-none focus:border-navy"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {order.customer && (
                <p className="text-xs text-clay">
                  {order.customer.name} · {order.customer.phone} · {order.customer.district}, {order.customer.address}
                </p>
              )}

              {order.items && (
                <ul className="mt-3 pt-3 border-t hairline border-solid space-y-1">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between text-xs text-clay">
                      <span>{item.product_name || `Бараа #${item.product_id}`} × {item.quantity}</span>
                      <span className="price-tag">{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-16 border border-rule rounded-xl bg-white">
              <p className="text-sm text-clay">Захиалга алга байна</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
