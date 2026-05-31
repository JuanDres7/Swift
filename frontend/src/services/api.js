import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Adjunta el JWT guardado a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('swift_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Manejo global de errores + sesión expirada
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('swift_token')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    const mensaje =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'Error inesperado'
    return Promise.reject(new Error(mensaje))
  }
)

export default api
