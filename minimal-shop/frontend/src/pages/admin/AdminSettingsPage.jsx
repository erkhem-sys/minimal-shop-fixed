import { useEffect, useState } from 'react'
import { Loader2, Save, Upload, Check } from 'lucide-react'
import api from '../../utils/api'
import { resolveImageUrl } from '../../utils/image'
import heroFallback from '../../assets/products/mic-poster.png'

const EMPTY_FORM = {
  heroImage: '',
  heroEyebrow: '',
  heroTitle: '',
  heroSubtitle: '',
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    async function fetchSettings() {
      try {
        const { data } = await api.get('/settings')
        if (active) setForm({ ...EMPTY_FORM, ...data.settings })
      } catch {
        if (active) setError('Тохиргоо уншихад алдаа гарлаа.')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchSettings()
    return () => {
      active = false
    }
  }, [])

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      update('heroImage', data.url)
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
    setSaved(false)
    try {
      const { data } = await api.put('/settings', form)
      setForm({ ...EMPTY_FORM, ...data.settings })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
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
      <h1 className="font-display font-bold text-2xl mb-2">Нүүр хуудасны тохиргоо</h1>
      <p className="text-sm text-clay mb-8">
        Нүүр хуудасны эхний том зураг болон гарчиг, тайлбар текстийг эндээс шууд өөрчилнө.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-rule rounded-xl p-6">
        <div>
          <label className="text-sm font-medium block mb-1.5">Нүүр хуудасны зураг</label>
          <div className="aspect-[16/10] w-full max-w-sm rounded-xl overflow-hidden bg-sand mb-3">
            <img
              src={form.heroImage ? resolveImageUrl(form.heroImage) : heroFallback}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-medium border border-rule rounded-full px-4 py-2.5 cursor-pointer hover:border-navy">
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {uploading ? 'Хуулж байна...' : 'Зураг сонгох'}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Тэмдэглэгээ (eyebrow)</label>
          <input
            type="text"
            value={form.heroEyebrow}
            onChange={(e) => update('heroEyebrow', e.target.value)}
            placeholder="ЦАХИМ ДЭЛГҮҮР · УЛААНБААТАР"
            className="input-field"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Гарчиг</label>
          <input
            type="text"
            value={form.heroTitle}
            onChange={(e) => update('heroTitle', e.target.value)}
            placeholder="Зөв хэрэгсэл. Хялбар амьдрал."
            className="input-field"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Тайлбар текст</label>
          <textarea
            rows={3}
            value={form.heroSubtitle}
            onChange={(e) => update('heroSubtitle', e.target.value)}
            className="input-field resize-none"
          />
        </div>

        {error && <p className="text-sm text-rust">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? 'Хадгалж байна...' : saved ? 'Хадгалагдлаа' : 'Хадгалах'}
        </button>
      </form>
    </div>
  )
}
