import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Save, Upload } from 'lucide-react'
import api from '../../utils/api'
import { CATEGORIES } from '../../data/products'
import { resolveImageUrl } from '../../utils/image'

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: CATEGORIES[0]?.id || '',
  image: '',
  images: [],
  video: '',
}

export default function AdminProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    let active = true
    async function fetchProduct() {
      try {
        const { data } = await api.get(`/products/${id}`)
        if (active) setForm({ ...EMPTY_FORM, ...data.product })
      } catch {
        if (active) setError('Бараа уншихад алдаа гарлаа.')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchProduct()
    return () => {
      active = false
    }
  }, [id, isEdit])

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      update('image', data.url)
    } catch {
      setError('Зураг хуулахад алдаа гарлаа.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      }
      if (isEdit) {
        await api.put(`/products/${id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      navigate('/admin/products')
    } catch (err) {
      setError(err.response?.data?.message || 'Хадгалахад алдаа гарлаа.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-clay">
        <Loader2 size={16} className="animate-spin" /> Уншиж байна...
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-2xl mb-8">
        {isEdit ? 'Бараа засах' : 'Бараа нэмэх'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-rule rounded-xl p-6">
        <div>
          <label className="text-sm font-medium block mb-1.5">Барааны нэр</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Тайлбар</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="input-field resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Үнэ (₮)</label>
            <input
              type="number"
              required
              min={0}
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Үлдэгдэл</label>
            <input
              type="number"
              required
              min={0}
              value={form.stock}
              onChange={(e) => update('stock', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Ангилал</label>
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="input-field"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Зураг</label>
          {form.image && (
            <img src={resolveImageUrl(form.image)} alt="" className="w-24 h-24 rounded-lg object-cover bg-sand mb-3" />
          )}
          <label className="inline-flex items-center gap-2 text-sm font-medium border border-rule rounded-full px-4 py-2.5 cursor-pointer hover:border-navy">
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {uploading ? 'Хуулж байна...' : 'Зураг хуулах'}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        {error && <p className="text-sm text-rust">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
      </form>
    </div>
  )
}
