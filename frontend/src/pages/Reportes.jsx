import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { usePedidosCompletos, useInventarioReporte, useResumenVentas } from '../hooks/useReportes'
import DataTable from '../components/shared/DataTable'
import EstadoBadge from '../components/shared/EstadoBadge'
import { formatCurrency, formatDate } from '../lib/utils'

const TABS = [
  { label: 'Pedidos',    key: 'pedidos' },
  { label: 'Inventario', key: 'inventario' },
  { label: 'Ventas',     key: 'ventas' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#111', border:'1px solid #333', borderRadius:2, padding:'10px 14px' }}>
      <p style={{ fontFamily:'Space Mono', fontSize:9, color:'#9C9890', marginBottom:4, letterSpacing:'0.1em' }}>{label?.toUpperCase()}</p>
      <p style={{ fontFamily:'Space Grotesk', fontSize:14, fontWeight:700, color:'#fff' }}>{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function Reportes() {
  const [tab, setTab] = useState(0)
  const pedidos = usePedidosCompletos()
  const inventario = useInventarioReporte()
  const ventas = useResumenVentas()

  const colPedidos = [
    { key:'cliente_nombre', label:'Cliente', render:r => <span style={{ fontWeight:600, color:'#111', fontFamily:'Space Grotesk' }}>{r.cliente_nombre}</span> },
    { key:'fecha_pedido', label:'Fecha', render:r => <span style={{ fontFamily:'Space Mono', fontSize:10, color:'#AEAB9F' }}>{formatDate(r.fecha_pedido)}</span> },
    { key:'estado', label:'Estado', render:r => <EstadoBadge estado={r.estado} /> },
    { key:'total', label:'Total', render:r => <span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:13 }}>{formatCurrency(r.total)}</span> },
    { key:'numero_factura', label:'Factura', render:r => r.numero_factura ? <span style={{ fontFamily:'Space Mono', fontSize:9, color:'#AEAB9F', letterSpacing:'0.06em' }}>{r.numero_factura.slice(0,22)}</span> : '—' },
    { key:'estado_envio', label:'Envío', render:r => r.estado_envio ? <EstadoBadge estado={r.estado_envio} /> : '—' },
  ]

  const colInventario = [
    { key:'producto', label:'Producto', render:r => <span style={{ fontWeight:600, color:'#111', fontFamily:'Space Grotesk' }}>{r.producto}</span> },
    { key:'tipo', label:'Tipo', render:r => <span style={{ fontFamily:'Space Mono', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'#6B6868', border:'1px solid #DDD9D0', padding:'2px 7px', borderRadius:1 }}>[{r.tipo}]</span> },
    { key:'categoria', label:'Categoría', render:r => <span style={{ color:'#9C9890' }}>{r.categoria}</span> },
    { key:'precio', label:'Precio', render:r => <span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:13 }}>{formatCurrency(r.precio)}</span> },
    { key:'stock', label:'Stock', render:r => <span style={{ fontFamily:'Space Mono', fontWeight:700, fontSize:12, color:r.stock===0?'#DC2626':r.stock<=5?'#B45309':'#15803D' }}>{r.stock}</span> },
    { key:'estado_stock', label:'Estado', render:r => <EstadoBadge estado={r.estado_stock} /> },
  ]

  const colVentas = [
    { key:'categoria', label:'Categoría', render:r => <span style={{ fontWeight:600, color:'#111', fontFamily:'Space Grotesk' }}>{r.categoria}</span> },
    { key:'total_pedidos', label:'Pedidos', render:r => <span style={{ fontFamily:'Space Mono', fontSize:12 }}>{r.total_pedidos}</span> },
    { key:'unidades_vendidas', label:'Unidades', render:r => <span style={{ fontFamily:'Space Mono', fontSize:12 }}>{r.unidades_vendidas}</span> },
    { key:'ingresos_totales', label:'Ingresos', render:r => <span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:13 }}>{formatCurrency(r.ingresos_totales)}</span> },
    { key:'precio_promedio', label:'Precio prom.', render:r => <span style={{ color:'#6B6868' }}>{formatCurrency(r.precio_promedio)}</span> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="bracket-label mb-1">[// analytics_engine]</p>
        <h2 style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:22, letterSpacing:'-0.02em', color:'#111' }}>Reportes</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-0" style={{ borderBottom:'1px solid #DDD9D0' }}>
        {TABS.map((t, i) => (
          <button key={t.key} onClick={() => setTab(i)}
            style={{
              fontFamily:'Space Mono', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase',
              padding:'10px 20px',
              color: tab===i ? '#111' : '#9C9890', background:'transparent',
              border:'none',
              borderBottom: tab===i ? '2px solid #111111' : '2px solid transparent',
              cursor:'pointer', marginBottom:-1,
              transition:'color 150ms',
            }}>
            [{t.label}]
          </button>
        ))}
      </div>

      {tab === 0 && <DataTable columns={colPedidos} data={pedidos.data} isLoading={pedidos.isLoading} emptyText="No hay pedidos" />}
      {tab === 1 && <DataTable columns={colInventario} data={inventario.data} isLoading={inventario.isLoading} emptyText="No hay productos" />}
      {tab === 2 && (
        <div className="space-y-5">
          {ventas.data?.length > 0 && (
            <div className="tech-card p-5">
              <p className="bracket-label mb-1">[// revenue_chart]</p>
              <p style={{ fontFamily:'Space Grotesk', fontWeight:600, fontSize:13, color:'#111', marginBottom:20 }}>Ingresos por categoría</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ventas.data} margin={{ left:0, right:0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#EBE9E3" vertical={false} />
                  <XAxis dataKey="categoria" tick={{ fontSize:9, fontFamily:'Space Mono', fill:'#AEAB9F', letterSpacing:1 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:9, fontFamily:'Space Mono', fill:'#AEAB9F' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="ingresos_totales" fill="#111111" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <DataTable columns={colVentas} data={ventas.data} isLoading={ventas.isLoading} emptyText="No hay ventas" />
        </div>
      )}
    </div>
  )
}
