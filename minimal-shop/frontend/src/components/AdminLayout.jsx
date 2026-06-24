import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Package, ClipboardList, LogOut, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin', label: 'Хянах самбар', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Бараа', icon: Package },
  { to: '/admin/orders', label: 'Захиалга', icon: ClipboardList },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex bg-sand">
      <aside className="w-60 bg-white border-r hairline border-solid shrink-0 hidden md:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b hairline border-solid">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full border-2 border-ink flex items-center justify-center">
              <span className="font-display font-bold text-sm">M</span>
            </span>
            <span className="font-display font-bold text-sm">Админ</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-navy text-white' : 'text-ink hover:bg-sand'
                  }`
                }
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-3 border-t hairline border-solid space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-clay hover:bg-sand">
            <ArrowLeft size={17} /> Дэлгүүр лүү буцах
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-clay hover:bg-sand"
          >
            <LogOut size={17} /> Гарах
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden h-16 bg-white border-b hairline border-solid flex items-center justify-between px-5">
          <span className="font-display font-bold text-sm">Админ самбар</span>
          <button onClick={logout} className="text-sm text-clay">Гарах</button>
        </header>
        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
