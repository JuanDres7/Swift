import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import clientesService from '../services/clientesService'

export function useClientes() {
  return useQuery({ queryKey: ['clientes'], queryFn: clientesService.listar })
}

export function useCrearCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: clientesService.crear,
    onSuccess: () => { qc.invalidateQueries(['clientes']); toast.success('Cliente creado') },
    onError: (e) => toast.error(e.message),
  })
}

export function useActualizarCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }) => clientesService.actualizar(id, datos),
    onSuccess: () => { qc.invalidateQueries(['clientes']); toast.success('Cliente actualizado') },
    onError: (e) => toast.error(e.message),
  })
}

export function useEliminarCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: clientesService.eliminar,
    onSuccess: () => { qc.invalidateQueries(['clientes']); toast.success('Cliente eliminado') },
    onError: (e) => toast.error(e.message),
  })
}
