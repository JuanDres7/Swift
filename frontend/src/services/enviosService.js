import api from './api'

const enviosService = {
  obtenerPorPedido: (pedidoId) => api.get(`/envios/pedido/${pedidoId}`).then(r => r.data),
  actualizar: (id, datos) => api.patch(`/envios/${id}`, datos).then(r => r.data),
}

export default enviosService
