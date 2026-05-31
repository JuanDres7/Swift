import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import pedidosService from '../services/pedidosService'

export function usePedidos() {
  return useQuery({ queryKey: ['pedidos'], queryFn: pedidosService.listar })
}

export function usePedido(id) {
  return useQuery({
    queryKey: ['pedidos', id],
    queryFn: () => pedidosService.obtener(id),
    enabled: !!id,
  })
}

export function useDetallesPedido(id) {
  return useQuery({
    queryKey: ['pedidos', id, 'detalles'],
    queryFn: () => pedidosService.detalles(id),
    enabled: !!id,
  })
}

export function useFacturaPedido(id) {
  return useQuery({
    queryKey: ['pedidos', id, 'factura'],
    queryFn: () => pedidosService.factura(id),
    enabled: !!id,
    retry: false,
  })
}

export function useCrearPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: pedidosService.crear,
    onSuccess: () => { qc.invalidateQueries(['pedidos']); toast.success('Pedido creado') },
    onError: (e) => toast.error(e.message),
  })
}

export function useAccionPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ accion, id, observacion }) => {
      if (accion === 'confirmar') return pedidosService.confirmar(id)
      if (accion === 'enviado') return pedidosService.marcarEnviado(id)
      if (accion === 'entregado') return pedidosService.marcarEntregado(id)
      if (accion === 'cancelar') return pedidosService.cancelar(id, observacion)
    },
    onSuccess: () => { qc.invalidateQueries(['pedidos']); toast.success('Pedido actualizado') },
    onError: (e) => toast.error(e.message),
  })
}
