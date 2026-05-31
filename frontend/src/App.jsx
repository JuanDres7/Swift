import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Categorias from './pages/Categorias'
import Productos from './pages/Productos'
import Pedidos from './pages/Pedidos'
import NuevoPedido from './pages/NuevoPedido'
import DetallePedido from './pages/DetallePedido'
import Envios from './pages/Envios'
import Reportes from './pages/Reportes'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

// Guard: redirige a /login si no hay token
function RequireAuth({ children }) {
  const token = localStorage.getItem('swift_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/pedidos/nuevo" element={<NuevoPedido />} />
            <Route path="/pedidos/:id" element={<DetallePedido />} />
            <Route path="/envios" element={<Envios />} />
            <Route path="/reportes" element={<Reportes />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111111',
            color: '#F0EFE9',
            border: '1px solid #333',
            borderRadius: '2px',
            fontFamily: 'Space Mono, monospace',
            fontSize: '12px',
          },
        }}
      />
    </QueryClientProvider>
  )
}
