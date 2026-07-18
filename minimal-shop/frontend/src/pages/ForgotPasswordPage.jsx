import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Send, CheckCircle2 } from 'lucide-react'
import api from '../utils/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Хүсэлт илгээхэд алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-5 py-16 text-center">
        <CheckCircle2 size={32} className="text-navy mx-auto mb-4" />
        <h1 className="font-display font-bold text-2xl mb-3">Холбоос илгээгдлээ</h1>
        <p className="text-sm text-clay">
          Хэрэв <strong>{email}</strong> хаяг бүртгэлтэй бол нууц үг сэргээх холбоос очно. Имэйлээ шалгаарай
          (спам хавтсыг ч харна уу).
        </p>
        <Link to="/login" className="btn-secondary mt-6 inline-flex">
          Нэвтрэх хуудас руу буцах
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <p className="eyebrow mb-4"><span className="eyebrow-dot" />Нууц үг сэргээх</p>
      <h1 className="font-display font-bold text-2xl mb-3">Нууц үг мартсан уу?</h1>
      <p className="text-sm text-clay mb-8">
        Бүртгэлтэй имэйл хаягаа оруулна уу — бид сэргээх холбоос илгээх болно.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Имэйл хаяг"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />

        {error && <p className="text-sm text-rust">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          {loading ? 'Илгээж байна...' : 'Холбоос илгээх'}
        </button>
      </form>

      <p className="text-sm text-clay text-center mt-6">
        <Link to="/login" className="text-navy font-medium hover:underline">
          Нэвтрэх хуудас руу буцах
        </Link>
      </p>
    </div>
  )
}
