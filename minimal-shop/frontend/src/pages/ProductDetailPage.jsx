import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, ChevronRight, Check, Loader2, AlertCircle } from 'lucide-react'
import api from '../utils/api'
import { CATEGORIES } from '../data/products'
import { formatPrice } from '../utils/format'
import { resolveImageUrl } from '../utils/image'
import { SHIPPING_FEE } from '../utils/constants'
import { useCart } from '../context/CartContext'
import FeaturedProductCard from '../components/FeaturedProductCard'

const RELATED_COUNT = 2

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)

  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  // Бараа болон төстэй бараануудыг API-аас татна.
  useEffect(() => {
    let active = true

    async function fetchProduct() {
      setLoading(true)
      setError(null)
      setNotFound(false)
      setQuantity(1)

      try {
        const { data } = await api.get(`/products/${id}`)
        if (!active) return
        setProduct(data.product)

        // Эхлээд ижил ангиллын бараагаар, дутуу бол бусад бараагаар нөхнө.
        const categoryRes = await api.get('/products', {
          params: { category: data.product.category },
        })
        if (!active) return
        let relatedList = (categoryRes.data.products || []).filter(
          (p) => p.id !== data.product.id
        )

        if (relatedList.length < RELATED_COUNT) {
          const allRes = await api.get('/products')
          if (!active) return
          const seen = new Set(relatedList.map((p) => p.id))
          for (const p of allRes.data.products || []) {
            if (p.id === data.product.id || seen.has(p.id)) continue
            relatedList.push(p)
            if (relatedList.length >= RELATED_COUNT) break
          }
        }

        setRelated(relatedList.slice(0, RELATED_COUNT))
      } catch (err) {
        if (!active) return
        if (err.response?.status === 404) {
          setNotFound(true)
        } else {
          setError('Бараа татахад алдаа гарлаа. Дахин оролдоно уу.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchProduct()
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-24 flex items-center justify-center gap-2 text-sm text-clay">
        <Loader2 size={18} className="animate-spin" /> Уншиж байна...
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 text-center">
        <p className="text-lg font-medium mb-4">Бараа олдсонгүй</p>
        <Link to="/products" className="btn-secondary">Бараа руу буцах</Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 text-center flex flex-col items-center gap-3">
        <AlertCircle size={22} className="text-rust" />
        <p className="text-sm text-clay">{error}</p>
        <Link to="/products" className="btn-secondary">Бараа руу буцах</Link>
      </div>
    )
  }

  const categoryName = CATEGORIES.find((c) => c.id === product.category)?.name
  const outOfStock = product.stock <= 0
  const imageUrl = resolveImageUrl(product.image)

  function handleAddToCart() {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  function handleBuyNow() {
    addItem(product, quantity)
    navigate('/cart')
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-clay mb-8">
        <Link to="/" className="hover:text-navy">Нүүр</Link>
        <ChevronRight size={12} />
        <Link to="/products" className="hover:text-navy">Бараа</Link>
        <ChevronRight size={12} />
        <span className="text-ink">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-sand">
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info */}
        <div>
          {categoryName && (
            <p className="eyebrow mb-4"><span className="eyebrow-dot" />{categoryName}</p>
          )}

          <h1 className="font-display font-bold text-2xl md:text-3xl uppercase leading-snug">
            {product.name}
          </h1>

          <p className="price-tag text-2xl text-navy mt-5">{formatPrice(product.price)}</p>
          <p className="text-xs text-clay mt-1">+ Хүргэлт {formatPrice(SHIPPING_FEE)}</p>

          <p className="text-sm text-clay leading-relaxed mt-6">{product.description}</p>

          <div className="mt-5 flex items-center gap-2 text-sm">
            <span className={`w-1.5 h-1.5 rounded-full ${outOfStock ? 'bg-clay' : 'bg-navy'}`} />
            {outOfStock ? (
              <span className="text-clay">Үлдэгдэлгүй</span>
            ) : (
              <span className="text-clay">Боломжит үлдэгдэл: {product.stock}</span>
            )}
          </div>

          {/* Quantity selector */}
          {!outOfStock && (
            <div className="mt-7 flex items-center gap-4">
              <span className="text-sm font-medium">Тоо ширхэг</span>
              <div className="flex items-center border border-rule rounded-full">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center hover:text-navy"
                  aria-label="Хасах"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center hover:text-navy"
                  aria-label="Нэмэх"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={handleAddToCart} disabled={outOfStock} className="btn-secondary">
              {added ? <Check size={15} /> : <ShoppingBag size={15} />}
              {added ? 'Нэмэгдсэн' : 'Сагсанд нэмэх'}
            </button>
            <button onClick={handleBuyNow} disabled={outOfStock} className="btn-primary">
              Шууд авах
            </button>
            <a href="tel:80701907" className="btn-ghost border border-rule">
              80701907 руу залгах
            </a>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-20">
          <p className="eyebrow mb-3"><span className="eyebrow-dot" />Бусад бараа</p>
          <h2 className="font-display font-bold text-xl md:text-2xl mb-8 uppercase">Танд таалагдаж магадгүй</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
            {related.map((p) => (
              <FeaturedProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
