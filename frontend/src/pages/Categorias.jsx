import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useCategorias, useCrearCategoria, useActualizarCategoria, useEliminarCategoria } from '../hooks/useCategorias'
import DataTable from '../components/shared/DataTable'
import PageHeader from '../components/shared/PageHeader'
import FormModal from '../components/shared/FormModal'
import ConfirmDialog from '../components/shared/ConfirmDialog'

const empty = { nombre: '', descripcion: '' }

const ActionBtn = ({ onClick, icon: Icon }) => (
  <button onClick={onClick} className="p-1.5 rounded-sm transition-all duration-150"
    style={{ color: '#AEAB9F', border: '1px solid transparent' }}
    onMouseOver={e => { e.currentTarget.style.background='#F5F4EF'; e.currentTarget.style.borderColor='#DDD9D0'; e.currentTarget.style.color='#111' }}
    onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#AEAB9F' }}>
    <Icon className="w-3.5 h-3.5" />
  </button>
)

export default function Categorias() {
  const { data, isLoading } = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()

  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [confirmar, setConfirmar] = useState(null)

  function abrirCrear() { setForm(empty); setModal('crear') }
  function abrirEditar(row) { setForm(row); setModal('editar') }
  function cerrar() { setModal(null); setForm(empty) }

  function handleSubmit(e) {
    e.preventDefault()
    const { id, created_at, ...datos } = form
    if (modal === 'crear') crear.mutate(datos, { onSuccess: cerrar })
    else actualizar.mutate({ id, datos }, { onSuccess: cerrar })
  }

  const columns = [
    { key: 'nombre', label: 'Nombre', render: r => <span style={{ fontWeight:600, color:'#111', fontFamily:'Space Grotesk' }}>{r.nombre}</span> },
    { key: 'descripcion', label: 'Descripción', render: r => <span style={{ color:'#9C9890' }}>{r.descripcion || '—'}</span> },
    {
      key: 'acciones', label: '',
      render: row => (
        <div className="flex items-center gap-1">
          <ActionBtn onClick={() => abrirEditar(row)} icon={Pencil} />
          <ActionBtn onClick={() => setConfirmar(row)} icon={Trash2} />
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Categorías" description="taxonomy_control"
        action={<button onClick={abrirCrear} className="btn-primary"><Plus className="w-3.5 h-3.5" /> [ New ]</button>} />

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyText="No hay categorías" />

      <FormModal open={!!modal} title={modal === 'crear' ? 'Nueva categoría' : 'Actualizar categoría'}
        onClose={cerrar} onSubmit={handleSubmit} loading={crear.isPending || actualizar.isPending}>
        <div>
          <label style={{ display:'block', fontFamily:'Space Mono', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'#9C9890', marginBottom:6 }}>Nombre *</label>
          <input required value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label style={{ display:'block', fontFamily:'Space Mono', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'#9C9890', marginBottom:6 }}>Descripción</label>
          <textarea rows={3} value={form.descripcion||''} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} className="input-field" style={{ resize:'none' }} />
        </div>
      </FormModal>

      <ConfirmDialog open={!!confirmar} title="Delete category"
        description={`Delete "${confirmar?.nombre}"? Products in this category will lose their classification.`}
        onConfirm={() => eliminar.mutate(confirmar.id, { onSuccess:() => setConfirmar(null) })}
        onCancel={() => setConfirmar(null)} loading={eliminar.isPending} />
    </>
  )
}
