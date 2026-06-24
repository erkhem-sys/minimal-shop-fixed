import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Phone, Loader2 } from 'lucide-react'
import api from '../utils/api'
import { formatPrice, formatDate } from '../utils/format'

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    async function fetchOrder() {
      try {
        const { data } = await api.get(`/orders/${orderId}`)
        if (active) setOrder(data.order)
      } catch {
        if (active) setError('Захиалгын мэдээлэл олдсонгүй.')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchOrder()
    return () => {
      active = false
    }
  }, [orderId])

  return (
    <div className="max-w-2xl mx-auto px-5 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={28} className="text-navy" />
      </div>
      <h1 className="font-display font-bold text-2xl mb-2">Захиалга баталгаажлаа</h1>
      <p className="text-sm text-clay mb-8">
        Таны захиалгыг хүлээн авлаа. Бид удахгүй тантай холбогдох болно.
      </p>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-clay">
          <Loader2 size={16} className="animate-spin" /> Уншиж байна...
        </div>
      )}

      {error && <p className="text-sm text-rust">{error}</p>}

      {order && (
        <div className="border border-rule rounded-xl p-6 text-left">
          <div className="flex justify-between items-baseline mb-4">
            <span className="text-sm text-clay">Захиалгын дугаар</span>
            <span className="price-tag text-sm">#{order.id}</span>
          </div>
          <div className="flex justify-between items-baseline mb-4">
            <span className="text-sm text-clay">Огноо</span>
            <span className="text-sm">{formatDate(order.created_at)}</span>
          </div>
          <div className="flex justify-between items-baseline border-t hairline border-solid pt-4">
            <span className="font-medium">Нийт дүн</span>
            <span className="price-tag text-lg text-navy">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Link to="/products" className="btn-secondary">Дэлгүүр лүү буцах</Link>
        <a href="tel:80701907" className="btn-primary">
          <Phone size={15} /> 80701907 руу залгах
        </a>
      </div>
    </div>
  )
}
