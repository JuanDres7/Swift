import api from './api'

const clientesService = {
  listar: () => api.get('/clientes/').then(r => r.data),
  obtener: (id) => api.get(`/clientes/${id}`).then(r => r.data),
  crear: (datos) => api.post('/clientes/', datos).then(r => r.data),
  actualizar: (id, datos) => api.patch(`/clientes/${id}`, datos).then(r => r.data),
  eliminar: (id) => api.delete(`/clientes/${id}`),
}

export default clientesService
