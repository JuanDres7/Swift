import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useProductos, useCrearProducto, useActualizarProducto, useEliminarProducto } from '../hooks/useProductos'
import { useCategorias } from '../hooks/useCategorias'
import DataTable from '../components/shared/DataTable'
import PageHeader from '../components/shared/PageHeader'
import FormModal from '../components/shared/FormModal'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import EstadoBadge from '../components/shared/EstadoBadge'
import { formatCurrency } from '../lib/utils'

const TIPOS = ['laptop', 'celular', 'accesorio', 'componente']
const empty = { nombre:'', tipo:'laptop', precio:'', stock:0, descripcion:'', categoria_id:'' }

const ActionBtn = ({ onClick, icon: Icon }) => (
  <button onClick={onClick} className="p-1.5 rounded-sm transition-all"
    style={{ color:'#AEAB9F', border:'1px solid transparent' }}
    onMouseOver={e => { e.currentTarget.style.background='#F5F4EF'; e.currentTarget.style.borderColor='#DDD9D0'; e.currentTarget.style.color='#111' }}
    onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#AEAB9F' }}>
    <Icon className="w-3.5 h-3.5" />
  </button>
)

const labelStyle = { display:'block', fontFamily:'Space Mono', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'#9C9890', marginBottom:6 }

export default function Productos() {
  const { data, isLoading } = useProductos()
  const { data: categorias } = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const eliminar = useEliminarProducto()

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [confirmar, setConfirmar] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState('')

  function abrirCrear() { setForm(empty); setModal('crear') }
  function abrirEditar(row) { setForm(row); setModal('editar') }
  function cerrar() { setModal(null); setForm(empty) }

  function handleSubmit(e) {
    e.preventDefault()
    const { id, created_at, ...datos } = form
    datos.precio = parseFloat(datos.precio)
    datos.stock = parseInt(datos.stock)
    if (modal === 'crear') crear.mutate(datos, { onSuccess: cerrar })
    else actualizar.mutate({ id, datos }, { onSuccess: cerrar })
  }

  const filtrados = filtroTipo ? data?.filter(p => p.tipo === filtroTipo) : data

  const columns = [
    { key:'nombre', label:'Producto', render:r => <span style={{ fontWeight:600, color:'#111', fontFamily:'Space Grotesk' }}>{r.nombre}</span> },
    { key:'tipo', label:'Tipo', render:r => <span style={{ fontFamily:'Space Mono', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'#6B6868', border:'1px solid #DDD9D0', padding:'2px 7px', borderRadius:1 }}>[{r.tipo}]</span> },
    { key:'precio', label:'Precio', render:r => <span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:13 }}>{formatCurrency(r.precio)}</span> },
    { key:'stock', label:'Stock', render:r => <span style={{ fontFamily:'Space Mono', fontWeight:700, fontSize:12, color:r.stock===0?'#DC2626':r.stock<=5?'#B45309':'#15803D' }}>{r.stock}</span> },
    { key:'estado', label:'Estado', render:r => { const e=r.stock===0?'agotado':r.stock<=5?'stock bajo':'disponible'; return <EstadoBadge estado={e} /> } },
    {
      key:'acciones', label:'',
      render:row => (
        <div className="flex items-center gap-1">
          <ActionBtn onClick={() => abrirEditar(row)} icon={Pencil} />
          <ActionBtn onClick={() => setConfirmar(row)} icon={Trash2} />
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Productos" description="catalog_system"
        action={
          <div className="flex items-center gap-3">
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="input-field" style={{ width:'auto', padding:'8px 12px' }}>
              <option value="">[all_types]</option>
              {TIPOS.map(t => <option key={t} value={t}>[{t}]</option>)}
            </select>
            <button onClick={abrirCrear} className="btn-primary"><Plus className="w-3.5 h-3.5" /> [ New ]</button>
          </div>
        }
      />
      <DataTable columns={columns} data={filtrados} isLoading={isLoading} emptyText="No hay productos" />

      <FormModal open={!!modal} title={modal==='crear'?'Nuevo producto':'Actualizar producto'}
        onClose={cerrar} onSubmit={handleSubmit} loading={crear.isPending||actualizar.isPending}>
        {[['Nombre *','nombre','text',true],['Precio *','precio','number',true],['Stock','stock','number',false]].map(([label,key,type,req]) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input type={type} required={req} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]:e.target.value }))} className="input-field" />
          </div>
        ))}
        <div>
          <label style={labelStyle}>Tipo *</label>
          <select required value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo:e.target.value }))} className="input-field">
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Categoría *</label>
          <select required value={form.categoria_id} onChange={e => setForm(p => ({ ...p, categoria_id:e.target.value }))} className="input-field">
            <option value="">Seleccionar...</option>
            {categorias?.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea rows={2} value={form.descripcion||''} onChange={e => setForm(p => ({ ...p, descripcion:e.target.value }))} className="input-field" style={{ resize:'none' }} />
        </div>
      </FormModal>

      <ConfirmDialog open={!!confirmar} title="Delete product"
        description={`Remove "${confirmar?.nombre}" from the catalog?`}
        onConfirm={() => eliminar.mutate(confirmar.id, { onSuccess:() => setConfirmar(null) })}
        onCancel={() => setConfirmar(null)} loading={eliminar.isPending} />
    </>
  )
}
