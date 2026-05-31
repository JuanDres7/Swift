import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import productosService from '../services/productosService'

export function useProductos() {
  return useQuery({ queryKey: ['productos'], queryFn: productosService.listar })
}

export function useInventario() {
  return useQuery({ queryKey: ['inventario'], queryFn: productosService.inventario })
}

export function useCrearProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productosService.crear,
    onSuccess: () => { qc.invalidateQueries(['productos']); toast.success('Producto creado') },
    onError: (e) => toast.error(e.message),
  })
}

export function useActualizarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }) => productosService.actualizar(id, datos),
    onSuccess: () => { qc.invalidateQueries(['productos']); toast.success('Producto actualizado') },
    onError: (e) => toast.error(e.message),
  })
}

export function useEliminarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productosService.eliminar,
    onSuccess: () => { qc.invalidateQueries(['productos']); toast.success('Producto eliminado') },
    onError: (e) => toast.error(e.message),
  })
}
