import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Loader2, AlertCircle } from 'lucide-react'
import { CATEGORIES } from '../data/products'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Шинээр нэмэгдсэн' },
  { value: 'price-asc', label: 'Үнэ: багаас их' },
  { value: 'price-desc', label: 'Үнэ: ихээс бага' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const activeCategory = searchParams.get('category') || ''
  const searchQuery = searchParams.get('search') || ''
  const sortBy = searchParams.get('sort') || 'newest'

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  // Хайлт, ангилал, эрэмбэ өөрчлөгдөх бүрт API-аас шинэчилж татна.
  useEffect(() => {
    let active = true

    async function fetchProducts() {
      setLoading(true)
      setError(null)
      try {
        const params = {}
        if (activeCategory) params.category = activeCategory
        if (searchQuery.trim()) params.search = searchQuery.trim()
        if (sortBy && sortBy !== 'newest') params.sort = sortBy

        const { data } = await api.get('/products', { params })
        if (active) setProducts(data.products || [])
      } catch {
        if (active) setError('Бараа татахад алдаа гарлаа. Дахин оролдоно уу.')
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchProducts()
    return () => {
      active = false
    }
  }, [activeCategory, searchQuery, sortBy])

  const activeCategoryName = CATEGORIES.find((c) => c.id === activeCategory)?.name

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-12">
      <p className="eyebrow mb-3"><span className="eyebrow-dot" />Дэлгүүр</p>
      <h1 className="font-display font-semibold text-2xl md:text-3xl mb-1">
        {activeCategoryName || 'Бүх бараа'}
      </h1>
      <p className="text-sm text-clay mb-8">
        {loading ? 'Уншиж байна...' : `${products.length} бараа олдлоо`}
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar — desktop */}
        <aside className="hidden md:block w-56 shrink-0">
          <FilterPanel
            activeCategory={activeCategory}
            onSelectCategory={(id) => updateParam('category', id)}
          />
        </aside>

        <div className="flex-1">
          {/* Mobile filter toggle + sort */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setFiltersOpen(true)}
              className="md:hidden inline-flex items-center gap-2 text-sm font-medium border border-rule
                rounded-full px-4 py-2"
            >
              <SlidersHorizontal size={14} />
              Шүүлтүүр
            </button>

            <div className="ml-auto">
              <select
                value={sortBy}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="text-sm border border-rule rounded-full px-4 py-2 outline-none
                  focus:border-navy bg-white"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {searchQuery && (
            <div className="mb-6 flex items-center gap-2 text-sm">
              <span className="text-clay">"{searchQuery}" гэж хайсан үр дүн</span>
              <button
                onClick={() => updateParam('search', '')}
                className="text-navy hover:underline"
              >
                Цуцлах
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-clay py-20">
              <Loader2 size={18} className="animate-spin" /> Бараа ачааллаж байна...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 text-center py-20">
              <AlertCircle size={22} className="text-rust" />
              <p className="text-sm text-clay">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-medium mb-2">Тохирох бараа олдсонгүй</p>
              <p className="text-sm text-clay">Өөр түлхүүр үг эсвэл ангиллаар хайж үзээрэй.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="font-display font-semibold text-lg">Шүүлтүүр</p>
              <button onClick={() => setFiltersOpen(false)} aria-label="Хаах">
                <X size={20} />
              </button>
            </div>
            <FilterPanel
              activeCategory={activeCategory}
              onSelectCategory={(id) => {
                updateParam('category', id)
                setFiltersOpen(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function FilterPanel({ activeCategory, onSelectCategory }) {
  return (
    <div>
      <p className="eyebrow mb-4"><span className="eyebrow-dot" />Ангилал</p>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !activeCategory ? 'bg-sand font-semibold text-navy' : 'hover:bg-sand text-ink'
            }`}
          >
            Бүгд
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeCategory === cat.id ? 'bg-sand font-semibold text-navy' : 'hover:bg-sand text-ink'
              }`}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
