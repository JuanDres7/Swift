import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, CheckCircle, Truck, PackageCheck, XCircle } from 'lucide-react'
import { usePedidos, useAccionPedido } from '../hooks/usePedidos'
import DataTable from '../components/shared/DataTable'
import PageHeader from '../components/shared/PageHeader'
import EstadoBadge from '../components/shared/EstadoBadge'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import { formatDate, formatCurrency } from '../lib/utils'

const ESTADOS = ['', 'pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado']

const ActionBtn = ({ onClick, icon: Icon, label }) => (
  <button title={label} onClick={onClick}
    className="p-1.5 rounded-sm transition-all duration-150"
    style={{ color: '#AEAB9F', border: '1px solid transparent' }}
    onMouseOver={e => { e.currentTarget.style.background='#F5F4EF'; e.currentTarget.style.borderColor='#DDD9D0'; e.currentTarget.style.color='#111' }}
    onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#AEAB9F' }}>
    <Icon className="w-3.5 h-3.5" />
  </button>
)

export default function Pedidos() {
  const navigate = useNavigate()
  const { data, isLoading } = usePedidos()
  const accion = useAccionPedido()
  const [filtro, setFiltro] = useState('')
  const [confirmar, setConfirmar] = useState(null)

  function ejecutar(pedidoId, tipo) {
    if (tipo === 'cancelar') { setConfirmar({ pedidoId }); return }
    accion.mutate({ accion: tipo, id: pedidoId })
  }

  const filtrados = filtro ? data?.filter(p => p.estado === filtro) : data

  const columns = [
    { key: 'cliente_nombre', label: 'Cliente', render: r => <span style={{ fontWeight:600, color:'#111', fontFamily:'Space Grotesk' }}>{r.cliente_nombre || r.cliente_id?.slice(0,12)}</span> },
    { key: 'fecha_pedido', label: 'Fecha', render: r => <span style={{ fontFamily:'Space Mono', fontSize:10, color:'#AEAB9F' }}>{formatDate(r.fecha_pedido)}</span> },
    { key: 'estado', label: 'Estado', render: r => <EstadoBadge estado={r.estado} /> },
    { key: 'total', label: 'Total', render: r => <span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:13 }}>{formatCurrency(r.total)}</span> },
    { key: 'numero_factura', label: 'Factura', render: r => r.numero_factura ? <span style={{ fontFamily:'Space Mono', fontSize:9, color:'#AEAB9F', letterSpacing:'0.06em' }}>{r.numero_factura.slice(0,20)}</span> : '—' },
    {
      key: 'acciones', label: '',
      render: row => (
        <div className="flex items-center gap-0.5">
          <ActionBtn onClick={() => navigate(`/pedidos/${row.pedido_id??row.id}`)} icon={Eye} label="Ver detalle" />
          {row.estado==='pendiente'  && <ActionBtn onClick={() => ejecutar(row.pedido_id??row.id, 'confirmar')} icon={CheckCircle} label="Confirmar" />}
          {row.estado==='confirmado' && <ActionBtn onClick={() => ejecutar(row.pedido_id??row.id, 'enviado')} icon={Truck} label="Marcar enviado" />}
          {row.estado==='enviado'    && <ActionBtn onClick={() => ejecutar(row.pedido_id??row.id, 'entregado')} icon={PackageCheck} label="Marcar entregado" />}
          {['pendiente','confirmado'].includes(row.estado) && <ActionBtn onClick={() => ejecutar(row.pedido_id??row.id, 'cancelar')} icon={XCircle} label="Cancelar" />}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Pedidos" description="order_management"
        action={
          <div className="flex items-center gap-3">
            <select value={filtro} onChange={e => setFiltro(e.target.value)} className="input-field" style={{ width: 'auto', padding:'8px 12px' }}>
              {ESTADOS.map(e => <option key={e} value={e}>{e || '[all_states]'}</option>)}
            </select>
            <button onClick={() => navigate('/pedidos/nuevo')} className="btn-primary">
              <Plus className="w-3.5 h-3.5" /> [ New Order ]
            </button>
          </div>
        }
      />
      <DataTable columns={columns} data={filtrados} isLoading={isLoading} emptyText="No hay pedidos" />

      <ConfirmDialog open={!!confirmar} title="Cancel order"
        description="Are you sure you want to cancel this order? If it was confirmed, stock will be automatically restored."
        onConfirm={() => accion.mutate({ accion:'cancelar', id:confirmar.pedidoId, observacion:'Cancelado por el usuario' }, { onSuccess:() => setConfirmar(null) })}
        onCancel={() => setConfirmar(null)} loading={accion.isPending} />
    </>
  )
}
