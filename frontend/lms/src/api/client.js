import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'https://ethsl-system.onrender.com/api' || "http://127.0.0.1:8000/api/"

const api = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      if (!location.pathname.startsWith('/login')) {
        location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
