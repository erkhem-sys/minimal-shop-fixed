import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Star } from 'lucide-react'
import api from '../../utils/api'
import { formatPrice } from '../../utils/format'
import { resolveImageUrl } from '../../utils/image'
import { CATEGORIES } from '../../data/products'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [featuringId, setFeaturingId] = useState(null)

  async function fetchProducts() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/products')
      setProducts(data.products || [])
    } catch {
      setError('Барааны жагсаалт ачааллахад алдаа гарлаа.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  async function handleDelete(id) {
    if (!window.confirm('Энэ барааг устгахдаа итгэлтэй байна уу?')) return
    setDeletingId(id)
    try {
      await api.delete(`/products/${id}`)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      window.alert('Устгахад алдаа гарлаа.')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleToggleFeatured(id, current) {
    setFeaturingId(id)
    try {
      await api.put(`/products/${id}`, { is_featured: !current })
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_featured: !current } : p)))
    } catch {
      window.alert('Онцлох төлөв шинэчлэхэд алдаа гарлаа.')
    } finally {
      setFeaturingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-bold text-2xl">Бараа</h1>
        <Link to="/admin/products/new" className="btn-primary">
          <Plus size={15} /> Бараа нэмэх
        </Link>
      </div>
      <p className="text-sm text-clay mb-6">
        <Star size={13} className="inline -mt-0.5 mr-1" />
        одон дарж нүүр хуудсанд онцлох барааг сонгоно уу (нүүр хуудсанд эхний 3-ыг харуулна).
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-clay">
          <Loader2 size={16} className="animate-spin" /> Уншиж байна...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-sm text-rust">
          <AlertCircle size={16} /> {error}
        </div>
      ) : (
        <div className="bg-white border border-rule rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b hairline border-solid text-left text-clay text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Бараа</th>
                <th className="px-5 py-3 font-medium">Ангилал</th>
                <th className="px-5 py-3 font-medium">Үнэ</th>
                <th className="px-5 py-3 font-medium">Үлдэгдэл</th>
                <th className="px-5 py-3 font-medium text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b hairline border-solid last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={resolveImageUrl(p.image)} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-sand" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-clay">{CATEGORIES.find((c) => c.id === p.category)?.name || p.category}</td>
                  <td className="px-5 py-3 price-tag">{formatPrice(p.price)}</td>
                  <td className="px-5 py-3">
                    <span className={p.stock <= 5 ? 'text-rust font-medium' : ''}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleFeatured(p.id, p.is_featured)}
                        disabled={featuringId === p.id}
                        aria-label={p.is_featured ? 'Онцлохоос хасах' : 'Онцлох болгох'}
                        aria-pressed={p.is_featured}
                        className={`w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-sand disabled:opacity-50 ${
                          p.is_featured ? 'text-navy' : 'text-clay'
                        }`}
                      >
                        {featuringId === p.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Star size={15} className={p.is_featured ? 'fill-current' : ''} />
                        )}
                      </button>
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-sand"
                        aria-label="Засах"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-sand text-rust disabled:opacity-50"
                        aria-label="Устгах"
                      >
                        {deletingId === p.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-clay">
                    Бараа алга байна
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
