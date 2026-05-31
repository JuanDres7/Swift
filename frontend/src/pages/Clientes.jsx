import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useClientes, useCrearCliente, useActualizarCliente, useEliminarCliente } from '../hooks/useClientes'
import DataTable from '../components/shared/DataTable'
import PageHeader from '../components/shared/PageHeader'
import FormModal from '../components/shared/FormModal'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import { formatDate } from '../lib/utils'

const empty = { nombre: '', email: '', telefono: '', direccion: '' }

function Field({ label, type = 'text', value, onChange, required }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'Space Mono', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9C9890', marginBottom: 6 }}>{label}</label>
      <input type={type} required={required} value={value} onChange={e => onChange(e.target.value)} className="input-field" />
    </div>
  )
}

const ActionBtn = ({ onClick, icon: Icon, label }) => (
  <button
    onClick={onClick} title={label}
    className="p-1.5 rounded-sm transition-all duration-150"
    style={{ color: '#AEAB9F', border: '1px solid transparent' }}
    onMouseOver={e => { e.currentTarget.style.background='#F5F4EF'; e.currentTarget.style.borderColor='#DDD9D0'; e.currentTarget.style.color='#111' }}
    onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#AEAB9F' }}
  >
    <Icon className="w-3.5 h-3.5" />
  </button>
)

export default function Clientes() {
  const { data, isLoading } = useClientes()
  const crear = useCrearCliente()
  const actualizar = useActualizarCliente()
  const eliminar = useEliminarCliente()

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
    { key: 'nombre', label: 'Nombre', render: r => <span style={{ fontWeight: 600, color: '#111', fontFamily: 'Space Grotesk' }}>{r.nombre}</span> },
    { key: 'email', label: 'Email', render: r => <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#6B6868' }}>{r.email}</span> },
    { key: 'telefono', label: 'Teléfono', render: r => <span style={{ color: '#9C9890' }}>{r.telefono || '—'}</span> },
    { key: 'created_at', label: 'Registrado', render: r => <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#AEAB9F' }}>{formatDate(r.created_at)}</span> },
    {
      key: 'acciones', label: '',
      render: row => (
        <div className="flex items-center gap-1">
          <ActionBtn onClick={() => abrirEditar(row)} icon={Pencil} label="Editar" />
          <ActionBtn onClick={() => setConfirmar(row)} icon={Trash2} label="Eliminar" />
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Clientes" description="client_registry"
        action={<button onClick={abrirCrear} className="btn-primary"><Plus className="w-3.5 h-3.5" /> [ New ]</button>} />

      <DataTable columns={columns} data={data} isLoading={isLoading} emptyText="No hay clientes registrados" />

      <FormModal open={!!modal} title={modal === 'crear' ? 'Registrar cliente' : 'Actualizar cliente'}
        onClose={cerrar} onSubmit={handleSubmit} loading={crear.isPending || actualizar.isPending}>
        <Field label="Nombre *" required value={form.nombre} onChange={v => setForm(p => ({ ...p, nombre: v }))} />
        <Field label="Email *" type="email" required value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} />
        <Field label="Teléfono" value={form.telefono || ''} onChange={v => setForm(p => ({ ...p, telefono: v }))} />
        <Field label="Dirección" value={form.direccion || ''} onChange={v => setForm(p => ({ ...p, direccion: v }))} />
      </FormModal>

      <ConfirmDialog open={!!confirmar} title="Delete client record"
        description={`Permanently delete "${confirmar?.nombre}" from the system. This action cannot be undone.`}
        onConfirm={() => eliminar.mutate(confirmar.id, { onSuccess: () => setConfirmar(null) })}
        onCancel={() => setConfirmar(null)} loading={eliminar.isPending} />
    </>
  )
}
