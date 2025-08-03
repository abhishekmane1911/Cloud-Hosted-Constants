import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isLoading: true,

        login: async (email: string, password: string) => {
          try {
            set({ isLoading: true })
            const response = await axios.post('/api/v1/auth/login', {
              email,
              password,
            })
            
            const { user, token } = response.data
            
            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            
            set({ user, token, isLoading: false })
            toast.success('Welcome back!')
          } catch (error: any) {
            set({ isLoading: false })
            const message = error.response?.data?.message || 'Login failed'
            toast.error(message)
            throw error
          }
        },

        logout: () => {
          delete axios.defaults.headers.common['Authorization']
          set({ user: null, token: null })
          toast.success('Logged out successfully')
        },

        checkAuth: async () => {
          const { token } = get()
          if (!token) {
            set({ isLoading: false })
            return
          }

          try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            const response = await axios.get('/api/v1/auth/me')
            set({ user: response.data, isLoading: false })
          } catch (error) {
            delete axios.defaults.headers.common['Authorization']
            set({ user: null, token: null, isLoading: false })
          }
        },

        updateProfile: async (data: Partial<User>) => {
          try {
            const response = await axios.put('/api/v1/auth/profile', data)
            set((state) => ({
              user: state.user ? { ...state.user, ...response.data } : null
            }))
            toast.success('Profile updated successfully')
          } catch (error: any) {
            const message = error.response?.data?.message || 'Update failed'
            toast.error(message)
            throw error
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ token: state.token }),
      }
    ),
    { name: 'auth-store' }
  )
)