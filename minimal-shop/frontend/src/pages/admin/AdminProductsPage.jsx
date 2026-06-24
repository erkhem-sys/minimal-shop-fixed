import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react'
import api from '../../utils/api'
import { formatPrice } from '../../utils/format'
import { resolveImageUrl } from '../../utils/image'
import { CATEGORIES } from '../../data/products'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl">Бараа</h1>
        <Link to="/admin/products/new" className="btn-primary">
          <Plus size={15} /> Бараа нэмэх
        </Link>
      </div>

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
