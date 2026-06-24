import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) navigate('/profile')
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <p className="eyebrow mb-4"><span className="eyebrow-dot" />Тавтай морил</p>
      <h1 className="font-display font-bold text-2xl mb-8">Нэвтрэх</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Имэйл хаяг"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          required
          placeholder="Нууц үг"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />

        {error && <p className="text-sm text-rust">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
          {loading ? 'Нэвтэрж байна...' : 'Нэвтрэх'}
        </button>
      </form>

      <p className="text-sm text-clay text-center mt-6">
        Бүртгэлгүй юу?{' '}
        <Link to="/register" className="text-navy font-medium hover:underline">
          Бүртгүүлэх
        </Link>
      </p>
    </div>
  )
}
