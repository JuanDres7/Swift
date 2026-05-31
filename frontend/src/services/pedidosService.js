import api from './api'

const pedidosService = {
  listar: () => api.get('/pedidos/').then(r => r.data),
  obtener: (id) => api.get(`/pedidos/${id}`).then(r => r.data),
  detalles: (id) => api.get(`/pedidos/${id}/detalles`).then(r => r.data),
  factura: (id) => api.get(`/pedidos/${id}/factura`).then(r => r.data),
  crear: (datos) => api.post('/pedidos/', datos).then(r => r.data),
  confirmar: (id) => api.patch(`/pedidos/${id}/confirmar`).then(r => r.data),
  marcarEnviado: (id) => api.patch(`/pedidos/${id}/enviado`).then(r => r.data),
  marcarEntregado: (id) => api.patch(`/pedidos/${id}/entregado`).then(r => r.data),
  cancelar: (id, observacion) => api.patch(`/pedidos/${id}/cancelar`, { observacion }),
}

export default pedidosService
