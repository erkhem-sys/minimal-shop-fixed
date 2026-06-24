import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { formatPrice } from '../utils/format'
import { resolveImageUrl } from '../utils/image'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const outOfStock = product.stock <= 0

  function handleQuickAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!outOfStock) addItem(product, 1)
  }

  return (
    <Link to={`/products/${product.id}`} className="card group flex flex-col overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-sand">
        <img
          src={resolveImageUrl(product.image)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {outOfStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-xs font-semibold text-clay uppercase tracking-wide">Дууссан</span>
          </div>
        )}
        <button
          onClick={handleQuickAdd}
          disabled={outOfStock}
          aria-label="Сагсанд нэмэх"
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white shadow-md flex items-center
            justify-center text-ink hover:bg-ink hover:text-white transition-colors
            disabled:opacity-0"
        >
          <ShoppingBag size={15} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-1">
        <p className="text-sm font-medium leading-snug line-clamp-2">{product.name}</p>
        <p className="price-tag text-sm text-navy mt-1">{formatPrice(product.price)}</p>
      </div>
    </Link>
  )
}
