import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Truck } from 'lucide-react'
import { usePedido, useDetallesPedido, useFacturaPedido } from '../hooks/usePedidos'
import enviosService from '../services/enviosService'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import EstadoBadge from '../components/shared/EstadoBadge'
import { formatDate, formatCurrency } from '../lib/utils'

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #EBE9E3' }}>
    <span style={{ fontFamily:'Space Mono', fontSize:10, letterSpacing:'0.06em', color:'#9C9890' }}>{label}</span>
    <span style={{ fontSize:13, color:'#111' }}>{value}</span>
  </div>
)

const SectionLabel = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 mb-3">
    {Icon && <Icon className="w-3.5 h-3.5" style={{ color:'#111' }} />}
    <p className="bracket-label">[// {text}]</p>
  </div>
)

export default function DetallePedido() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: pedido, isLoading } = usePedido(id)
  const { data: detalles } = useDetallesPedido(id)
  const { data: factura } = useFacturaPedido(id)
  const { data: envio } = useQuery({
    queryKey: ['envios', id],
    queryFn: () => enviosService.obtenerPorPedido(id),
    enabled: !!id, retry: false,
  })

  const actualizarEnvio = useMutation({
    mutationFn: ({ envioId, datos }) => enviosService.actualizar(envioId, datos),
    onSuccess: () => { qc.invalidateQueries(['envios', id]); toast.success('Envío actualizado') },
    onError: e => toast.error(e.message),
  })

  const [envioForm, setEnvioForm] = useState({ transportadora: '', numero_guia: '' })

  if (isLoading) return (
    <div className="space-y-3 max-w-3xl">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32" />)}</div>
  )
  if (!pedido) return <p className="bracket-label">[ order_not_found ]</p>

  return (
    <div className="max-w-3xl space-y-5">
      {/* Back + title */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/pedidos')}
          className="w-8 h-8 flex items-center justify-center rounded-sm transition-all duration-150"
          style={{ background:'#fff', border:'1px solid #DDD9D0', color:'#9C9890' }}
          onMouseOver={e => e.currentTarget.style.color='#111'} onMouseOut={e => e.currentTarget.style.color='#9C9890'}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="bracket-label mb-0.5">[// order_detail]</p>
          <h2 style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:18, letterSpacing:'-0.02em', color:'#111' }}>Detalle del pedido</h2>
          <p style={{ fontFamily:'Space Mono', fontSize:10, color:'#C5C2BB', marginTop:2 }}>{pedido.id}</p>
        </div>
        <EstadoBadge estado={pedido.estado} />
      </div>

      {/* Info */}
      <div className="tech-card p-5">
        <SectionLabel text="order_info" />
        <InfoRow label="cliente" value={<span style={{ fontFamily:'Space Mono', fontSize:11 }}>{pedido.cliente_id?.slice(0,18)}</span>} />
        <InfoRow label="fecha" value={formatDate(pedido.fecha_pedido)} />
        <InfoRow label="descuento" value={formatCurrency(pedido.descuento)} />
        <InfoRow label="total" value={<span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:15 }}>{formatCurrency(pedido.total)}</span>} />
      </div>

      {/* Detalles */}
      {detalles?.length > 0 && (
        <div className="tech-card overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom:'1px solid #EBE9E3' }}>
            <p className="bracket-label">[// line_items]</p>
          </div>
          <table className="tech-table">
            <thead><tr><th>ID Producto</th><th>Cant.</th><th style={{ textAlign:'right' }}>P. Unit.</th><th style={{ textAlign:'right' }}>Subtotal</th></tr></thead>
            <tbody>
              {detalles.map(d => (
                <tr key={d.id}>
                  <td style={{ fontFamily:'Space Mono', fontSize:10, color:'#9C9890' }}>{d.producto_id?.slice(0,14)}...</td>
                  <td style={{ fontFamily:'Space Mono', textAlign:'center', color:'#6B6868' }}>{d.cantidad}</td>
                  <td style={{ textAlign:'right', color:'#6B6868' }}>{formatCurrency(d.precio_unitario)}</td>
                  <td style={{ textAlign:'right', fontFamily:'Space Grotesk', fontWeight:700 }}>{formatCurrency(d.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Factura */}
      {factura && (
        <div className="tech-card p-5">
          <SectionLabel icon={FileText} text="invoice" />
          <InfoRow label="numero" value={<span style={{ fontFamily:'Space Mono', fontSize:11 }}>{factura.numero_factura}</span>} />
          <InfoRow label="emision" value={formatDate(factura.fecha_emision)} />
          <InfoRow label="subtotal" value={formatCurrency(factura.subtotal)} />
          <InfoRow label="iva_19%" value={formatCurrency(factura.impuestos)} />
          <div className="flex items-center justify-between pt-3">
            <span className="bracket-label">total_invoice</span>
            <span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:18 }}>{formatCurrency(factura.total)}</span>
          </div>
        </div>
      )}

      {/* Envío */}
      {envio && (
        <div className="tech-card p-5">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel icon={Truck} text="shipment" />
            <EstadoBadge estado={envio.estado} />
          </div>
          <InfoRow label="destino" value={envio.direccion_destino} />
          <InfoRow label="transportadora" value={envio.transportadora || '—'} />
          <InfoRow label="guia" value={envio.numero_guia ? <span style={{ fontFamily:'Space Mono', fontSize:11 }}>{envio.numero_guia}</span> : '—'} />

          <div className="flex gap-3 mt-5">
            <input placeholder="Transportadora" value={envioForm.transportadora}
              onChange={e => setEnvioForm(p => ({ ...p, transportadora: e.target.value }))} className="input-field" style={{ flex:1 }} />
            <input placeholder="N° guía" value={envioForm.numero_guia}
              onChange={e => setEnvioForm(p => ({ ...p, numero_guia: e.target.value }))} className="input-field" style={{ flex:1 }} />
            <button onClick={() => actualizarEnvio.mutate({ envioId: envio.id, datos: envioForm })}
              disabled={actualizarEnvio.isPending} className="btn-primary whitespace-nowrap">
              [ Update ]
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
