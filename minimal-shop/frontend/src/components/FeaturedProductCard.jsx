import { Link } from 'react-router-dom'
import { Check, Phone, ShoppingBag, Images, Film } from 'lucide-react'
import { formatPrice } from '../utils/format'
import { resolveImageUrl } from '../utils/image'
import { CATEGORIES } from '../data/products'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

export default function FeaturedProductCard({ product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const outOfStock = product.stock <= 0
  const categoryName = CATEGORIES.find((c) => c.id === product.category)?.name
  const extraImageCount = (product.images?.length || 0) - 1

  function handleAddToCart() {
    if (outOfStock) return
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="card group relative flex flex-col overflow-hidden">
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] bg-sand overflow-hidden">
        <img
          src={resolveImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {(extraImageCount > 0 || product.video) && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {extraImageCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 text-ink text-[10px] font-semibold px-2 py-1">
                <Images size={11} /> {extraImageCount + 1}
              </span>
            )}
            {product.video && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/90 text-ink">
                <Film size={11} />
              </span>
            )}
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1">
        {categoryName && (
          <span className="inline-flex self-start items-center rounded-full bg-navy/10 text-navy
            text-xs font-semibold px-3 py-1 mb-3">
            {categoryName}
          </span>
        )}

        <Link to={`/products/${product.id}`}>
          <h3 className="font-display font-bold text-base uppercase leading-snug hover:text-navy transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="mt-3 text-xs text-clay leading-relaxed line-clamp-3 flex-1">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
          <span className="price-tag text-lg text-navy">{formatPrice(product.price)}</span>
          <a
            href="tel:80701907"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs font-medium border border-rule
              rounded-full px-3 py-1.5 hover:border-navy hover:text-navy transition-colors"
          >
            <Phone size={12} />
            80701907
          </a>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="btn-primary w-full mt-4 justify-center disabled:opacity-50"
        >
          {added ? <Check size={15} /> : <ShoppingBag size={15} />}
          {outOfStock ? 'Дууссан' : added ? 'Нэмэгдсэн' : 'Сагсанд нэмэх'}
        </button>
      </div>
    </div>
  )
}
