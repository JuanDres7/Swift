import api from './api'

const categoriasService = {
  listar: () => api.get('/categorias/').then(r => r.data),
  obtener: (id) => api.get(`/categorias/${id}`).then(r => r.data),
  crear: (datos) => api.post('/categorias/', datos).then(r => r.data),
  actualizar: (id, datos) => api.patch(`/categorias/${id}`, datos).then(r => r.data),
  eliminar: (id) => api.delete(`/categorias/${id}`),
}

export default categoriasService
