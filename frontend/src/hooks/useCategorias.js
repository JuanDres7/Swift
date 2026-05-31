import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import categoriasService from '../services/categoriasService'

export function useCategorias() {
  return useQuery({ queryKey: ['categorias'], queryFn: categoriasService.listar })
}

export function useCrearCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriasService.crear,
    onSuccess: () => { qc.invalidateQueries(['categorias']); toast.success('Categoría creada') },
    onError: (e) => toast.error(e.message),
  })
}

export function useActualizarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }) => categoriasService.actualizar(id, datos),
    onSuccess: () => { qc.invalidateQueries(['categorias']); toast.success('Categoría actualizada') },
    onError: (e) => toast.error(e.message),
  })
}

export function useEliminarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriasService.eliminar,
    onSuccess: () => { qc.invalidateQueries(['categorias']); toast.success('Categoría eliminada') },
    onError: (e) => toast.error(e.message),
  })
}
