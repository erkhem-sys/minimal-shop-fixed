import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const result = await register(form.name, form.phone, form.email, form.password)
    if (result.success) navigate('/profile')
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <p className="eyebrow mb-4"><span className="eyebrow-dot" />Шинэ хэрэглэгч</p>
      <h1 className="font-display font-bold text-2xl mb-8">Бүртгүүлэх</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          required
          placeholder="Овог нэр"
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
          type="email"
          required
          placeholder="Имэйл хаяг"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Нууц үг (хамгийн багадаа 6 тэмдэгт)"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          className="input-field"
        />

        {error && <p className="text-sm text-rust">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
          {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
        </button>
      </form>

      <p className="text-sm text-clay text-center mt-6">
        Бүртгэлтэй юу?{' '}
        <Link to="/login" className="text-navy font-medium hover:underline">
          Нэвтрэх
        </Link>
      </p>
    </div>
  )
}
