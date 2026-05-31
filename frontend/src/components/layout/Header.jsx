import { useLocation } from 'react-router-dom'

const routes = {
  '/':           { title: 'DASHBOARD',   sub: 'sys_overview' },
  '/pedidos':    { title: 'PEDIDOS',     sub: 'order_management' },
  '/clientes':   { title: 'CLIENTES',    sub: 'client_registry' },
  '/productos':  { title: 'PRODUCTOS',   sub: 'catalog_system' },
  '/categorias': { title: 'CATEGORÍAS',  sub: 'taxonomy_control' },
  '/envios':     { title: 'ENVÍOS',      sub: 'logistics_tracking' },
  '/reportes':   { title: 'REPORTES',    sub: 'analytics_engine' },
}

export default function Header() {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]
  const { title, sub } = routes[base] ?? { title: 'SWIFT', sub: 'system' }

  return (
    <header
      className="h-14 flex items-center justify-between px-6"
      style={{ background: '#EAE9E3', borderBottom: '1px solid #D5D1C8' }}
    >
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#AEAB9F' }}>[//]</span>
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', color: '#111' }}>
          {title}
        </span>
        <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#C5C2BB', letterSpacing: '0.06em' }}>
          — {sub}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-sm"
          style={{ background: '#111111', border: '1px solid #333' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 inline-block" />
          <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em' }}>
            SWIFT_API // ONLINE
          </span>
        </div>
      </div>
    </header>
  )
}
