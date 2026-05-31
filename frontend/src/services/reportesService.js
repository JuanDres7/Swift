import api from './api'

const reportesService = {
  pedidosCompletos: () => api.get('/reportes/pedidos').then(r => r.data),
  inventario: () => api.get('/reportes/inventario').then(r => r.data),
  resumenVentas: () => api.get('/reportes/ventas').then(r => r.data),
}

export default reportesService
