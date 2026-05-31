import { useQuery } from '@tanstack/react-query'
import reportesService from '../services/reportesService'

export function usePedidosCompletos() {
  return useQuery({ queryKey: ['reportes', 'pedidos'], queryFn: reportesService.pedidosCompletos })
}

export function useInventarioReporte() {
  return useQuery({ queryKey: ['reportes', 'inventario'], queryFn: reportesService.inventario })
}

export function useResumenVentas() {
  return useQuery({ queryKey: ['reportes', 'ventas'], queryFn: reportesService.resumenVentas })
}
