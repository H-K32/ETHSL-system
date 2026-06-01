import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchMe = useCallback(async () => {
    try {
      const data = await authApi.me()
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (localStorage.getItem('access_token')) fetchMe()
    else setLoading(false)
  }, [fetchMe])

  const login = async (credentials) => {
    const data = await authApi.login(credentials)
    const access = data.access || data.token || data.access_token
    const refresh = data.refresh || data.refresh_token
    if (access) localStorage.setItem('access_token', access)
    if (refresh) localStorage.setItem('refresh_token', refresh)
    const profile = await authApi.me()
    setUser(profile)
    return profile
  }

  const register = async (payload) => {
    const data = await authApi.register(payload)
    const access = data.access || data.token || data.access_token
    if (access) {
      localStorage.setItem('access_token', access)
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh)
      await fetchMe()
    }
    return data
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch {
      // ignore — clear client state regardless
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
      navigate('/login')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
