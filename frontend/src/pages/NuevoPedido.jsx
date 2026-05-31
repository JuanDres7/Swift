import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { useClientes } from '../hooks/useClientes'
import { useProductos } from '../hooks/useProductos'
import { useCrearPedido } from '../hooks/usePedidos'
import { formatCurrency } from '../lib/utils'

const labelStyle = { display:'block', fontFamily:'Space Mono', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'#9C9890', marginBottom:6 }

export default function NuevoPedido() {
  const navigate = useNavigate()
  const { data: clientes } = useClientes()
  const { data: productos } = useProductos()
  const crear = useCrearPedido()

  const [paso, setPaso] = useState(1)
  const [clienteId, setClienteId] = useState('')
  const [items, setItems] = useState([])
  const [selProducto, setSelProducto] = useState('')
  const [cantidad, setCantidad] = useState(1)

  function agregarItem() {
    const prod = productos?.find(p => p.id === selProducto)
    if (!prod) return
    const existe = items.find(i => i.producto_id === selProducto)
    if (existe) setItems(items.map(i => i.producto_id === selProducto ? { ...i, cantidad: i.cantidad + cantidad } : i))
    else setItems([...items, { producto_id: selProducto, cantidad, nombre: prod.nombre, precio: prod.precio }])
    setSelProducto(''); setCantidad(1)
  }

  const subtotal = items.reduce((a, i) => a + i.precio * i.cantidad, 0)
  const descuentoLabel = subtotal > 500 ? '15% // total > $500' : items.length > 3 ? '10% // qty > 3' : null

  function confirmar() {
    crear.mutate(
      { cliente_id: clienteId, items: items.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })) },
      { onSuccess: () => navigate('/pedidos') }
    )
  }

  const steps = ['client', 'products', 'confirm']

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <p className="bracket-label mb-1">[// new_order_sequence]</p>
        <h2 style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:22, letterSpacing:'-0.02em', color:'#111' }}>Nuevo Pedido</h2>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 flex items-center justify-center transition-all duration-300"
                style={{
                  background: paso > i+1 ? '#111' : paso === i+1 ? '#111' : '#E8E6DF',
                  color: paso >= i+1 ? '#fff' : '#AEAB9F',
                  fontFamily:'Space Mono', fontSize:10, fontWeight:700,
                  borderRadius:2, border: paso===i+1 ? '1px solid #111' : '1px solid #DDD9D0',
                }}
              >
                {paso > i+1 ? <Check className="w-3.5 h-3.5" /> : String(i+1).padStart(2,'0')}
              </div>
              <span style={{ fontFamily:'Space Mono', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color: paso===i+1 ? '#111' : '#AEAB9F' }}>
                {label}
              </span>
            </div>
            {i < 2 && <div className="w-8 h-px" style={{ background: paso > i+1 ? '#111' : '#DDD9D0' }} />}
          </div>
        ))}
      </div>

      <div className="tech-card p-6">
        {paso === 1 && (
          <div className="space-y-4">
            <label style={labelStyle}>Seleccionar cliente</label>
            <select value={clienteId} onChange={e => setClienteId(e.target.value)} className="input-field">
              <option value="">[ select_client ]</option>
              {clientes?.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.email}</option>)}
            </select>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-4">
            <label style={labelStyle}>Agregar productos</label>
            <div className="flex gap-2">
              <select value={selProducto} onChange={e => setSelProducto(e.target.value)} className="input-field" style={{ flex:1 }}>
                <option value="">[ select_product ]</option>
                {productos?.filter(p => p.stock > 0).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} — {formatCurrency(p.precio)} (stock: {p.stock})</option>
                ))}
              </select>
              <input type="number" min="1" value={cantidad} onChange={e => setCantidad(parseInt(e.target.value))} className="input-field" style={{ width:64, textAlign:'center' }} />
              <button onClick={agregarItem} disabled={!selProducto} className="btn-primary" style={{ padding:'0 14px' }}>
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {items.length > 0 && (
              <div style={{ border:'1px solid #DDD9D0', borderRadius:2, overflow:'hidden' }}>
                <table className="tech-table">
                  <thead><tr><th>Producto</th><th>Cant.</th><th style={{ textAlign:'right' }}>Subtotal</th><th /></tr></thead>
                  <tbody>
                    {items.map(i => (
                      <tr key={i.producto_id}>
                        <td style={{ fontWeight:500, color:'#111' }}>{i.nombre}</td>
                        <td style={{ fontFamily:'Space Mono', textAlign:'center', color:'#6B6868' }}>{i.cantidad}</td>
                        <td style={{ textAlign:'right', fontFamily:'Space Grotesk', fontWeight:700 }}>{formatCurrency(i.precio * i.cantidad)}</td>
                        <td style={{ textAlign:'right' }}>
                          <button onClick={() => setItems(items.filter(x => x.producto_id !== i.producto_id))} style={{ color:'#AEAB9F', padding:4 }}
                            onMouseOver={e => e.currentTarget.style.color='#DC2626'} onMouseOut={e => e.currentTarget.style.color='#AEAB9F'}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 flex justify-between" style={{ borderTop:'1px solid #DDD9D0', background:'#F8F7F2' }}>
                  <span className="bracket-label">subtotal_est</span>
                  <span style={{ fontFamily:'Space Grotesk', fontWeight:700 }}>{formatCurrency(subtotal)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-4">
            <label style={labelStyle}>Resumen del pedido</label>
            <div style={{ background:'#F8F7F2', border:'1px solid #DDD9D0', borderRadius:2, padding:16 }} className="space-y-3">
              <div className="flex justify-between" style={{ fontSize:13 }}>
                <span style={{ color:'#9C9890', fontFamily:'Space Mono', fontSize:11 }}>client</span>
                <span style={{ fontWeight:600, color:'#111' }}>{clientes?.find(c => c.id === clienteId)?.nombre}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize:13 }}>
                <span style={{ color:'#9C9890', fontFamily:'Space Mono', fontSize:11 }}>items</span>
                <span style={{ color:'#6B6868' }}>{items.length} tipos · {items.reduce((a,i)=>a+i.cantidad,0)} unidades</span>
              </div>
              <div className="flex justify-between" style={{ fontSize:13, borderTop:'1px solid #DDD9D0', paddingTop:12 }}>
                <span style={{ color:'#9C9890', fontFamily:'Space Mono', fontSize:11 }}>subtotal</span>
                <span style={{ fontFamily:'Space Grotesk', fontWeight:700 }}>{formatCurrency(subtotal)}</span>
              </div>
              {descuentoLabel && (
                <div className="flex items-center gap-2" style={{ fontFamily:'Space Mono', fontSize:10, padding:'6px 8px', background:'#fff', border:'1px solid #DDD9D0', borderRadius:2, color:'#15803D' }}>
                  <Check className="w-3 h-3 shrink-0" /> discount_applied: {descuentoLabel}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-5">
        <button onClick={() => paso > 1 ? setPaso(paso-1) : navigate('/pedidos')} className="btn-ghost">
          <ChevronLeft className="w-4 h-4" /> {paso === 1 ? '[ Cancel ]' : '[ Back ]'}
        </button>
        {paso < 3 ? (
          <button onClick={() => setPaso(paso+1)} disabled={(paso===1 && !clienteId) || (paso===2 && !items.length)} className="btn-primary">
            [ Next ] <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={confirmar} disabled={crear.isPending} className="btn-primary">
            {crear.isPending ? '[ Creating... ]' : '[ Create Order ]'}
          </button>
        )}
      </div>
    </div>
  )
}
