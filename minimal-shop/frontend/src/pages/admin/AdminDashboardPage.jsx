import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ClipboardList, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react'
import api from '../../utils/api'
import { formatPrice } from '../../utils/format'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function fetchStats() {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          api.get('/products'),
          api.get('/orders'),
        ])
        if (!active) return
        const products = productsRes.data.products || []
        const orders = ordersRes.data.orders || []
        const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
        const lowStock = products.filter((p) => p.stock <= 5)
        setStats({
          productCount: products.length,
          orderCount: orders.length,
          revenue,
          lowStock,
        })
      } catch {
        if (active) setStats({ productCount: 0, orderCount: 0, revenue: 0, lowStock: [] })
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchStats()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-clay">
        <Loader2 size={16} className="animate-spin" /> Уншиж байна...
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-8">Хянах самбар</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-rule rounded-xl p-5">
          <Package size={18} className="text-navy mb-3" />
          <p className="text-2xl font-bold">{stats.productCount}</p>
          <p className="text-sm text-clay">Бараа</p>
        </div>
        <div className="bg-white border border-rule rounded-xl p-5">
          <ClipboardList size={18} className="text-navy mb-3" />
          <p className="text-2xl font-bold">{stats.orderCount}</p>
          <p className="text-sm text-clay">Захиалга</p>
        </div>
        <div className="bg-white border border-rule rounded-xl p-5">
          <TrendingUp size={18} className="text-navy mb-3" />
          <p className="price-tag text-2xl font-bold">{formatPrice(stats.revenue)}</p>
          <p className="text-sm text-clay">Нийт орлого</p>
        </div>
      </div>

      {stats.lowStock.length > 0 && (
        <div className="bg-white border border-rule rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-rust" />
            <p className="font-medium text-sm">Үлдэгдэл багатай бараа</p>
          </div>
          <ul className="space-y-2">
            {stats.lowStock.map((p) => (
              <li key={p.id} className="flex justify-between text-sm">
                <Link to={`/admin/products/${p.id}/edit`} className="hover:text-navy">{p.name}</Link>
                <span className="text-rust font-medium">{p.stock} үлдсэн</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
