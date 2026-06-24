import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'
import { resolveImageUrl } from '../utils/image'
import { SHIPPING_FEE } from '../utils/constants'

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center mx-auto mb-5">
          <ShoppingBag size={24} className="text-clay" />
        </div>
        <h1 className="font-display font-bold text-xl mb-2">Таны сагс хоосон байна</h1>
        <p className="text-sm text-clay mb-7">Дэлгүүрээс өөрт хэрэгцээтэй зүйлээ сагсандаа нэмээрэй.</p>
        <Link to="/products" className="btn-primary">
          Бараа үзэх <ArrowRight size={15} />
        </Link>
      </div>
    )
  }

  const total = subtotal + SHIPPING_FEE

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
      <h1 className="font-display font-bold text-2xl md:text-3xl mb-8">Сагс</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 border border-rule rounded-xl p-4">
              <Link to={`/products/${item.id}`} className="w-20 h-20 rounded-lg overflow-hidden bg-sand shrink-0">
                <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/products/${item.id}`} className="font-medium text-sm leading-snug hover:text-navy transition-colors">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label="Устгах"
                    className="text-clay hover:text-rust shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="price-tag text-sm text-navy mt-1">{formatPrice(item.price)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-rule rounded-full">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:text-navy"
                      aria-label="Хасах"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-8 h-8 flex items-center justify-center hover:text-navy disabled:opacity-30"
                      aria-label="Нэмэх"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <p className="price-tag text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div>
          <div className="border border-rule rounded-xl p-6 sticky top-24">
            <p className="eyebrow mb-4"><span className="eyebrow-dot" />Захиалгын мэдээлэл</p>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-clay">Барааны нийт үнэ</span>
                <span className="price-tag">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-clay">Хүргэлт</span>
                <span className="price-tag">{formatPrice(SHIPPING_FEE)}</span>
              </div>
            </div>

            <div className="border-t hairline border-solid mt-4 pt-4 flex justify-between items-baseline">
              <span className="font-medium">Нийт дүн</span>
              <span className="price-tag text-xl text-navy">{formatPrice(total)}</span>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn-primary w-full justify-center mt-6">
              Захиалга баталгаажуулах <ArrowRight size={15} />
            </button>

            <Link to="/products" className="block text-center text-sm text-clay hover:text-navy mt-4">
              Дэлгүүр лүү буцах
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
