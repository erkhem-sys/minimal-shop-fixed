import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { itemCount } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`)
      setMobileOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-20 border-b hairline border-solid">
          {/* Logo — round "M" mark mirrors the reference design */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-9 h-9 rounded-full border-2 border-ink flex items-center justify-center">
              <span className="font-display font-bold text-sm">M</span>
            </span>
            <span className="leading-tight">
              <span className="block font-display font-bold text-sm tracking-tight">МИНИМАЛ</span>
              <span className="block text-[9px] font-medium tracking-widest text-clay">ХЭРЭГЛЭЭ ШОП</span>
            </span>
          </Link>

          {/* Center nav — desktop only */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink/80">
            <Link to="/" className="hover:text-navy transition-colors">
              Нүүр
            </Link>
            <Link to="/products" className="hover:text-navy transition-colors">
              Бараа
            </Link>
            <Link to="/products?category=home" className="hover:text-navy transition-colors">
              Гэр ахуй
            </Link>
            <Link to="/products?category=electronics" className="hover:text-navy transition-colors">
              Цахилгаан хэрэгсэл
            </Link>
            <Link to="/about" className="hover:text-navy transition-colors">
              Бидний тухай
            </Link>
            <Link to="/contact" className="hover:text-navy transition-colors">
              Холбоо барих
            </Link>
          </nav>

          {/* Right side — search, cart, account, mirrors the dotted badge from source */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-clay" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Хайх..."
                  className="w-44 rounded-full border border-rule bg-sand pl-9 pr-3 py-2 text-sm
                    outline-none focus:border-navy transition-colors"
                />
              </div>
            </form>

            <Link
              to={user ? '/profile' : '/login'}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-rule
                pl-2 pr-3.5 py-1.5 text-sm font-medium hover:border-navy transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-navy" />
              <User size={15} />
              <span>{user ? user.name.split(' ')[0] : 'Нэвтрэх'}</span>
            </Link>

            <Link
              to="/cart"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full
                hover:bg-sand transition-colors"
              aria-label="Сагс"
            >
              <ShoppingBag size={19} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-navy text-white text-[10px] font-bold
                  rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-sand"
              aria-label="Цэс"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-b hairline border-solid bg-white px-5 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-clay" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Хайх..."
              className="w-full rounded-full border border-rule bg-sand pl-9 pr-3 py-2.5 text-sm outline-none"
            />
          </form>
          <Link to="/products" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>
            Бараа
          </Link>
          <Link to="/products?category=kitchen" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>
            Гэр ахуй
          </Link>
          <Link to="/products?category=stationery" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>
            Бичиг хэрэг
          </Link>
          <Link
            to={user ? '/profile' : '/login'}
            className="block py-2 text-sm font-medium"
            onClick={() => setMobileOpen(false)}
          >
            {user ? 'Профайл' : 'Нэвтрэх / Бүртгүүлэх'}
          </Link>
        </div>
      )}
    </header>
  )
}
