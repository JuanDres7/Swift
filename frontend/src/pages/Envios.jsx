import { useNavigate } from 'react-router-dom'
import { usePedidos } from '../hooks/usePedidos'
import DataTable from '../components/shared/DataTable'
import PageHeader from '../components/shared/PageHeader'
import EstadoBadge from '../components/shared/EstadoBadge'
import { Eye } from 'lucide-react'

export default function Envios() {
  const navigate = useNavigate()
  const { data, isLoading } = usePedidos()

  const conEnvio = data?.filter(p => ['confirmado', 'enviado', 'entregado'].includes(p.estado))

  const columns = [
    { key:'cliente_nombre', label:'Cliente', render:r => <span style={{ fontWeight:600, color:'#111', fontFamily:'Space Grotesk' }}>{r.cliente_nombre || r.cliente_id?.slice(0,12)}</span> },
    { key:'estado', label:'Pedido', render:r => <EstadoBadge estado={r.estado} /> },
    { key:'estado_envio', label:'Envío', render:r => <EstadoBadge estado={r.estado_envio ?? 'preparando'} /> },
    { key:'numero_factura', label:'Factura', render:r => r.numero_factura ? <span style={{ fontFamily:'Space Mono', fontSize:9, color:'#AEAB9F', letterSpacing:'0.06em' }}>{r.numero_factura.slice(0,22)}</span> : '—' },
    {
      key:'acciones', label:'',
      render:row => (
        <button onClick={() => navigate(`/pedidos/${row.pedido_id ?? row.id}`)}
          className="p-1.5 rounded-sm transition-all duration-150"
          style={{ color:'#AEAB9F', border:'1px solid transparent' }}
          onMouseOver={e => { e.currentTarget.style.background='#F5F4EF'; e.currentTarget.style.borderColor='#DDD9D0'; e.currentTarget.style.color='#111' }}
          onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#AEAB9F' }}>
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Envíos" description="logistics_tracking" />
      <DataTable columns={columns} data={conEnvio} isLoading={isLoading} emptyText="No hay envíos activos" />
    </>
  )
}
