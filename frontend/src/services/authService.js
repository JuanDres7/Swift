import api from './api'

const authService = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }).then(r => r.data),

  logout: () => localStorage.removeItem('swift_token'),

  estaAutenticado: () => !!localStorage.getItem('swift_token'),
}

export default authService
