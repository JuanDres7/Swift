import api from './api'

const productosService = {
  listar: () => api.get('/productos/').then(r => r.data),
  obtener: (id) => api.get(`/productos/${id}`).then(r => r.data),
  inventario: () => api.get('/productos/inventario').then(r => r.data),
  crear: (datos) => api.post('/productos/', datos).then(r => r.data),
  actualizar: (id, datos) => api.patch(`/productos/${id}`, datos).then(r => r.data),
  eliminar: (id) => api.delete(`/productos/${id}`),
}

export default productosService
