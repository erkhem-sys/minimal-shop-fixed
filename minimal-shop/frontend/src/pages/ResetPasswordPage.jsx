import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react'
import api from '../utils/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Нууц үг таарахгүй байна.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Нууц үг сэргээхэд алдаа гарлаа.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-5 py-16 text-center">
        <AlertCircle size={32} className="text-rust mx-auto mb-4" />
        <h1 className="font-display font-bold text-2xl mb-3">Холбоос буруу байна</h1>
        <p className="text-sm text-clay mb-6">Энэ холбоос дутуу эсвэл буруу байна. Дахин хүсэлт илгээнэ үү.</p>
        <Link to="/forgot-password" className="btn-secondary">Нууц үг сэргээх</Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-5 py-16 text-center">
        <CheckCircle2 size={32} className="text-navy mx-auto mb-4" />
        <h1 className="font-display font-bold text-2xl mb-3">Нууц үг солигдлоо</h1>
        <p className="text-sm text-clay">Түр хүлээгээд нэвтрэх хуудас руу шилжинэ...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <p className="eyebrow mb-4"><span className="eyebrow-dot" />Нууц үг сэргээх</p>
      <h1 className="font-display font-bold text-2xl mb-8">Шинэ нууц үг тохируулах</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          placeholder="Шинэ нууц үг"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          required
          placeholder="Шинэ нууц үг (давтах)"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-field"
        />

        {error && <p className="text-sm text-rust">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
          {loading ? 'Хадгалж байна...' : 'Нууц үг солих'}
        </button>
      </form>
    </div>
  )
}
