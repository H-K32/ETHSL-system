import api from './client.js'

export const login = (data) => api.post('/auth/login/', data).then((r) => r.data)
export const register = (data) => api.post('/auth/register/', data).then((r) => r.data)
export const me = () => api.get('/profile/').then((r) => r.data)
