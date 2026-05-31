import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const SIDEBAR_WIDTH = 240

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div style={{ minHeight: '100vh' }}>
      <Sidebar />
      {/* marginLeft reserva el ancho del sidebar fijo; width auto ocupa el resto */}
      <div
        style={{
          marginLeft: SIDEBAR_WIDTH,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
        }}
      >
        <Header />
        <main style={{ flex: 1, padding: 24 }} className="animate-fade-in" key={pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
