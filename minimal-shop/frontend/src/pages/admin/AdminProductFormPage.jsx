import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Save, Upload, X, ChevronLeft, ChevronRight, Star, Film } from 'lucide-react'
import api from '../../utils/api'
import { CATEGORIES } from '../../data/products'
import { resolveImageUrl } from '../../utils/image'
import { getEmbeddableVideoUrl } from '../../utils/video'

const MAX_IMAGES = 6

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: CATEGORIES[0]?.id || '',
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
        if (!active) return
        const product = data.product
        // Хуучин бараанд зөвхөн ганц "image" талбар байж болзошгүй тул
        // images массивт нэгтгэж харуулна.
        const images = product.images?.length ? product.images : [product.image].filter(Boolean)
        setForm({ ...EMPTY_FORM, ...product, images })
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
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm((f) => ({ ...f, images: [...f.images, data.url].slice(0, MAX_IMAGES) }))
    } catch {
      setError('Зураг хуулахад алдаа гарлаа.')
    } finally {
      setUploading(false)
    }
  }

  function removeImage(index) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
  }

  function moveImage(index, direction) {
    setForm((f) => {
      const next = [...f.images]
      const target = index + direction
      if (target < 0 || target >= next.length) return f
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...f, images: next }
    })
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
        image: form.images[0] || '',
        video: form.video.trim(),
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

  const videoEmbed = getEmbeddableVideoUrl(form.video)

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

        {/* Multi-image manager — эхний зураг картанд харагдах "үндсэн" зураг болно */}
        <div>
          <label className="text-sm font-medium block mb-1.5">Зураг</label>
          <p className="text-xs text-clay mb-3">
            Эхний зураг бараа карт болон жагсаалтад харагдах үндсэн зураг болно. Дараалал өөрчлөх бол сум ашиглана уу.
          </p>

          {form.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
              {form.images.map((img, index) => (
                <div
                  key={img + index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-sand border border-rule group"
                >
                  <img src={resolveImageUrl(img)} alt="" className="w-full h-full object-cover" />

                  {index === 0 && (
                    <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-navy text-white text-[10px] font-semibold px-2 py-0.5">
                      <Star size={9} className="fill-current" /> Үндсэн
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label="Зураг хасах"
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-ink hover:bg-rust hover:text-white transition-colors"
                  >
                    <X size={13} />
                  </button>

                  <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0}
                      aria-label="Өмнө нь зөөх"
                      className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-ink hover:bg-navy hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === form.images.length - 1}
                      aria-label="Дараа нь зөөх"
                      className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-ink hover:bg-navy hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {form.images.length < MAX_IMAGES && (
            <label className="inline-flex items-center gap-2 text-sm font-medium border border-rule rounded-full px-4 py-2.5 cursor-pointer hover:border-navy">
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading ? 'Хуулж байна...' : 'Зураг нэмэх'}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
          <p className="text-xs text-clay mt-2">{form.images.length} / {MAX_IMAGES} зураг</p>
        </div>

        {/* Video link — файл биш, зөвхөн холбоос (Render-ийн үнэгүй сервер дээр
            хуулсан файл deploy бүрд устдаг тул холбоосоор явуулна). */}
        <div>
          <label className="text-sm font-medium block mb-1.5 flex items-center gap-1.5">
            <Film size={14} /> Бичлэгийн холбоос
          </label>
          <input
            type="url"
            value={form.video}
            onChange={(e) => update('video', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="input-field"
          />
          <p className="text-xs text-clay mt-1.5">YouTube, Facebook эсвэл Instagram бичлэгийн холбоосыг оруулна уу.</p>

          {form.video && (
            <div className="mt-3 aspect-video max-w-xs rounded-lg overflow-hidden bg-sand border border-rule">
              {videoEmbed ? (
                <iframe
                  src={videoEmbed}
                  title="Бичлэгийн урьдчилсан харагдац"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-center px-3">
                  <p className="text-xs text-clay">Холбоосыг таньсангүй, гэхдээ хадгалагдана.</p>
                </div>
              )}
            </div>
          )}
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
