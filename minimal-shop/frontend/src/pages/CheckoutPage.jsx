import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Landmark, QrCode, Wallet, Loader2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/format'
import { resolveImageUrl } from '../utils/image'
import api from '../utils/api'

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Энгийн хүргэлт', detail: '1–2 хоног, хотын А бүсэд', fee: 6000 },
  { id: 'express', label: 'Шуурхай хүргэлт', detail: 'Тухайн өдөр, хотын А бүсэд', fee: 12000 },
  { id: 'pickup', label: 'Өөрөө очиж авах', detail: 'Дэлгүүрээс очиж авна', fee: 0 },
]

const PAYMENT_OPTIONS = [
  { id: 'bank_transfer', label: 'Банкны шилжүүлэг', icon: Landmark, detail: 'Дансны мэдээллийг захиалгын дараа илгээнэ' },
  { id: 'qr', label: 'QR төлбөр', icon: QrCode, detail: 'QPay болон бусад банкны апп ашиглан төлнө' },
  { id: 'cash_on_delivery', label: 'Хүргэлтээр төлөх', icon: Wallet, detail: 'Бараа хүлээж авахдаа бэлнээр төлнө' },
]

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    district: '',
    delivery: 'standard',
    payment: 'bank_transfer',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const deliveryFee = DELIVERY_OPTIONS.find((d) => d.id === form.delivery)?.fee || 0
  const total = subtotal + deliveryFee

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (items.length === 0) return
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        customer: { name: form.name, phone: form.phone, address: form.address, district: form.district },
        delivery: form.delivery,
        payment: form.payment,
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity, price: i.price })),
        total,
      }
      const { data } = await api.post('/orders', payload)
      clearCart()
      navigate(`/order-confirmation/${data.order.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Захиалга илгээхэд алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <p className="text-lg font-medium mb-2">Сагс хоосон байна</p>
        <p className="text-sm text-clay">Захиалга өгөхийн өмнө сагсандаа бараа нэмээрэй.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
      <h1 className="font-display font-bold text-2xl md:text-3xl mb-8">Захиалга баталгаажуулах</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Contact & delivery address */}
          <section>
            <p className="eyebrow mb-4"><span className="eyebrow-dot" />Хүргэлтийн мэдээлэл</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Нэр"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="input-field"
              />
              <input
                type="tel"
                required
                placeholder="Утасны дугаар"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                required
                placeholder="Хот/дүүрэг"
                value={form.district}
                onChange={(e) => update('district', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                required
                placeholder="Дэлгэрэнгүй хаяг (хороо, байр, тоот)"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                className="input-field sm:col-span-2"
              />
            </div>
          </section>

          {/* Delivery options */}
          <section>
            <p className="eyebrow mb-4"><span className="eyebrow-dot" />Хүргэлтийн сонголт</p>
            <div className="space-y-2">
              {DELIVERY_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-colors ${
                    form.delivery === opt.id ? 'border-navy bg-navy/5' : 'border-rule'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={form.delivery === opt.id}
                    onChange={() => update('delivery', opt.id)}
                    className="accent-navy"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-clay">{opt.detail}</p>
                  </div>
                  <span className="price-tag text-sm">{opt.fee === 0 ? 'Үнэгүй' : formatPrice(opt.fee)}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Payment options */}
          <section>
            <p className="eyebrow mb-4"><span className="eyebrow-dot" />Төлбөрийн сонголт</p>
            <div className="space-y-2">
              {PAYMENT_OPTIONS.map((opt) => {
                const Icon = opt.icon
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-colors ${
                      form.payment === opt.id ? 'border-navy bg-navy/5' : 'border-rule'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={form.payment === opt.id}
                      onChange={() => update('payment', opt.id)}
                      className="accent-navy"
                    />
                    <Icon size={18} className="text-navy shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-clay">{opt.detail}</p>

                      {opt.id === 'qr' && form.payment === 'qr' && (
                       <div style={{ marginTop: '15px' }}>
                        <img
                         src="http://localhost:4000/uploads/525fe674-a99f-4cf8-95ba-31701686f50a.jpg"
                         alt="QR төлбөр"
                         style={{ maxWidth: '250px', borderRadius: '10px' }}
                       />
                       <p>80701907 - Эрхэмээ</p>
                     </div>
                   )}
                   {opt.id === 'bank_transfer' && form.payment === 'bank_transfer' && (
                     <div style={{ marginTop: '15px' }}>
                      <p><strong>Хас Банк</strong></p>
                      <p>Данс: MN960032005005824809</p>
                      <p>Нэр: Эрхэмээ Оюунчимэг</p>
                    </div>
                  )}
                    </div>
                  </label>
                )
              })}
            </div>
          </section>
        </div>

        {/* Order summary */}
        <div>
          <div className="border border-rule rounded-xl p-6 sticky top-24">
            <p className="eyebrow mb-4"><span className="eyebrow-dot" />Захиалгын дэлгэрэнгүй</p>

            <ul className="space-y-3 mb-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 text-sm">
                  <img src={resolveImageUrl(item.image)} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-sand shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium leading-snug line-clamp-2">{item.name}</p>
                    <p className="text-clay text-xs mt-0.5">{item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t hairline border-solid pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-clay">Барааны нийт үнэ</span>
                <span className="price-tag">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-clay">Хүргэлт</span>
                <span className="price-tag">{deliveryFee === 0 ? 'Үнэгүй' : formatPrice(deliveryFee)}</span>
              </div>
            </div>

            <div className="border-t hairline border-solid mt-4 pt-4 flex justify-between items-baseline">
              <span className="font-medium">Нийт дүн</span>
              <span className="price-tag text-xl text-navy">{formatPrice(total)}</span>
            </div>

            {error && <p className="text-sm text-rust mt-4">{error}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center mt-6">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {submitting ? 'Илгээж байна...' : 'Захиалга өгөх'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
