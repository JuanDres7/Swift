import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Tag, Package,
  ShoppingCart, Truck, BarChart3, LogOut
} from 'lucide-react'

const nav = [
  { to: '/',           label: 'Dashboard',  icon: LayoutDashboard, num: '01' },
  { to: '/pedidos',    label: 'Pedidos',    icon: ShoppingCart,    num: '02' },
  { to: '/clientes',   label: 'Clientes',   icon: Users,           num: '03' },
  { to: '/productos',  label: 'Productos',  icon: Package,         num: '04' },
  { to: '/categorias', label: 'Categorías', icon: Tag,             num: '05' },
  { to: '/envios',     label: 'Envíos',     icon: Truck,           num: '06' },
  { to: '/reportes',   label: 'Reportes',   icon: BarChart3,       num: '07' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('swift_token')
    navigate('/login')
  }

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-10"
      style={{ width: 240, background: '#E8E6DF', borderRight: '1px solid #D5D1C8' }}
    >
      {/* Logo */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid #D5D1C8' }}>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-7 h-7 flex items-center justify-center"
            style={{ background: '#111111', borderRadius: 2 }}
          >
            <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#fff', fontWeight: 700 }}>S/</span>
          </div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#111' }}>SWIFT</span>
        </div>
        <p className="bracket-label">sys_v1.0 // online</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="bracket-label px-3 pb-2 pt-1">[//navigation]</p>

        {nav.map(({ to, label, icon: Icon, num }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-sm text-[13px] font-medium transition-all duration-150 ${
                isActive ? 'nav-active' : 'text-[#555550] hover:bg-[#DDDAD3] hover:text-[#111111]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  style={{
                    fontFamily: 'Space Mono',
                    fontSize: 9,
                    letterSpacing: '0.06em',
                    color: isActive ? 'rgba(255,255,255,0.5)' : '#AEAB9F',
                    minWidth: 20,
                  }}
                >
                  {num}
                </span>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span style={{ fontFamily: 'Space Grotesk', fontWeight: isActive ? 600 : 500, letterSpacing: '-0.01em' }}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid #D5D1C8' }}>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-[13px] font-medium transition-all duration-150"
          style={{ color: '#555550', fontFamily: 'Space Grotesk' }}
          onMouseOver={e => { e.currentTarget.style.background = '#DDDAD3'; e.currentTarget.style.color = '#DC2626' }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555550' }}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Cerrar sesión
        </button>
        <div className="flex items-center gap-2 mt-3 px-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#111111] inline-block" />
          <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#AEAB9F' }}>api_conn: established</span>
        </div>
      </div>
    </aside>
  )
}
