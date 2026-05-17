import api from './client.js'

export const login = (data) => api.post('/users/login/', data).then((r) => r.data)
export const register = (data) => api.post('/users/register/', data).then((r) => r.data)
export const me = () => api.get('users/profile/').then((r) => r.data)
