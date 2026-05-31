import { ShoppingCart, Users, Package, TrendingUp, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { usePedidos } from '../hooks/usePedidos'
import { useClientes } from '../hooks/useClientes'
import { useProductos } from '../hooks/useProductos'
import { useResumenVentas } from '../hooks/useReportes'
import EstadoBadge from '../components/shared/EstadoBadge'
import { formatCurrency, formatDate } from '../lib/utils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid #333', borderRadius: 2, padding: '10px 14px' }}>
      <p style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#9C9890', marginBottom: 4, letterSpacing: '0.1em' }}>{label?.toUpperCase()}</p>
      <p style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: '#fff' }}>{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, index }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#AEAB9F', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            [{String(index + 1).padStart(2, '0')}] {label}
          </p>
        </div>
        <Icon className="w-4 h-4" style={{ color: '#C5C2BB' }} />
      </div>
      <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', color: '#111' }}>
        {value}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: pedidos, isLoading: loadPedidos } = usePedidos()
  const { data: clientes } = useClientes()
  const { data: productos } = useProductos()
  const { data: ventas } = useResumenVentas()

  const totalIngresos = pedidos
    ?.filter(p => p.estado !== 'cancelado')
    .reduce((acc, p) => acc + (p.total || 0), 0) ?? 0

  const stats = [
    { label: 'Total pedidos',    value: pedidos?.length ?? 0,          icon: ShoppingCart },
    { label: 'Clientes',         value: clientes?.length ?? 0,         icon: Users },
    { label: 'Productos',        value: productos?.length ?? 0,        icon: Package },
    { label: 'Ingresos totales', value: formatCurrency(totalIngresos),  icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="bracket-label mb-1">[// system_overview]</p>
        <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', color: '#111' }}>
          Dashboard
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pedidos recientes */}
        <div className="lg:col-span-2 tech-card overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid #EBE9E3' }}
          >
            <div>
              <p className="bracket-label mb-0.5">[// recent_orders]</p>
              <p style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 13, color: '#111' }}>
                Pedidos recientes
              </p>
            </div>
            <button
              onClick={() => navigate('/pedidos')}
              className="flex items-center gap-1"
              style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#9C9890', letterSpacing: '0.08em' }}
            >
              VIEW_ALL <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {loadPedidos ? (
            <div className="p-5 space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-10" style={{ animationDelay: `${i*70}ms` }} />)}
            </div>
          ) : (
            <table className="tech-table">
              <thead>
                <tr><th>Cliente</th><th>Fecha</th><th>Estado</th><th style={{ textAlign:'right' }}>Total</th></tr>
              </thead>
              <tbody>
                {pedidos?.slice(0,8).map(p => (
                  <tr
                    key={p.pedido_id ?? p.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/pedidos/${p.pedido_id ?? p.id}`)}
                  >
                    <td style={{ fontWeight: 500, color: '#111' }}>{p.cliente_nombre || p.cliente_id?.slice(0,12)}</td>
                    <td style={{ color: '#9C9890', fontFamily: 'Space Mono', fontSize: 11 }}>{formatDate(p.fecha_pedido)}</td>
                    <td><EstadoBadge estado={p.estado} /></td>
                    <td style={{ textAlign:'right', fontFamily:'Space Grotesk', fontWeight:700, fontSize:13 }}>{formatCurrency(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Chart */}
        <div className="tech-card p-5">
          <p className="bracket-label mb-1">[// revenue_by_category]</p>
          <p style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 13, color: '#111', marginBottom: 20 }}>
            Ventas por categoría
          </p>
          {ventas?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ventas} margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#EBE9E3" vertical={false} />
                <XAxis
                  dataKey="categoria"
                  tick={{ fontSize: 9, fontFamily: 'Space Mono', fill: '#AEAB9F', letterSpacing: 1 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fontFamily: 'Space Mono', fill: '#AEAB9F' }}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
                  axisLine={false} tickLine={false} width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="ingresos_totales" fill="#111111" radius={[2,2,0,0]} name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="bracket-label">[no_data_available]</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
