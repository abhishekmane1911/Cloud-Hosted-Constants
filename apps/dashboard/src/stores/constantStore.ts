import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'

export interface Constant {
  id: string
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  environment: 'development' | 'staging' | 'production'
  tags: string[]
  description: string
  version: number
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}

export interface ConstantHistory {
  id: string
  constantId: string
  value: any
  version: number
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}

interface ConstantState {
  constants: Constant[]
  history: ConstantHistory[]
  isLoading: boolean
  filters: {
    environment: string
    tags: string[]
    search: string
  }
  fetchConstants: (projectId: string) => Promise<void>
  createConstant: (projectId: string, data: Partial<Constant>) => Promise<void>
  updateConstant: (projectId: string, id: string, data: Partial<Constant>) => Promise<void>
  deleteConstant: (projectId: string, id: string) => Promise<void>
  fetchHistory: (projectId: string, constantId: string) => Promise<void>
  rollbackConstant: (projectId: string, constantId: string, version: number) => Promise<void>
  setFilters: (filters: Partial<ConstantState['filters']>) => void
  importConstants: (projectId: string, data: any[]) => Promise<void>
  exportConstants: (projectId: string, format: 'json' | 'csv') => Promise<void>
}

export const useConstantStore = create<ConstantState>()(
  devtools(
    (set, get) => ({
      constants: [],
      history: [],
      isLoading: false,
      filters: {
        environment: 'all',
        tags: [],
        search: ''
      },

      fetchConstants: async (projectId: string) => {
        try {
          set({ isLoading: true })
          const { filters } = get()
          const params = new URLSearchParams()
          
          if (filters.environment !== 'all') {
            params.append('environment', filters.environment)
          }
          if (filters.tags.length > 0) {
            params.append('tags', filters.tags.join(','))
          }
          if (filters.search) {
            params.append('search', filters.search)
          }

          const response = await axios.get(`/api/v1/projects/${projectId}/constants?${params}`)
          set({ constants: response.data, isLoading: false })
        } catch (error: any) {
          set({ isLoading: false })
          toast.error('Failed to fetch constants')
        }
      },

      createConstant: async (projectId: string, data: Partial<Constant>) => {
        try {
          const response = await axios.post(`/api/v1/projects/${projectId}/constants`, data)
          set((state) => ({
            constants: [...state.constants, response.data]
          }))
          toast.success('Constant created successfully')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to create constant'
          toast.error(message)
          throw error
        }
      },

      updateConstant: async (projectId: string, id: string, data: Partial<Constant>) => {
        try {
          const response = await axios.put(`/api/v1/projects/${projectId}/constants/${id}`, data)
          set((state) => ({
            constants: state.constants.map((c) =>
              c.id === id ? response.data : c
            )
          }))
          toast.success('Constant updated successfully')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to update constant'
          toast.error(message)
          throw error
        }
      },

      deleteConstant: async (projectId: string, id: string) => {
        try {
          await axios.delete(`/api/v1/projects/${projectId}/constants/${id}`)
          set((state) => ({
            constants: state.constants.filter((c) => c.id !== id)
          }))
          toast.success('Constant deleted successfully')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to delete constant'
          toast.error(message)
          throw error
        }
      },

      fetchHistory: async (projectId: string, constantId: string) => {
        try {
          const response = await axios.get(`/api/v1/projects/${projectId}/constants/${constantId}/history`)
          set({ history: response.data })
        } catch (error: any) {
          toast.error('Failed to fetch constant history')
        }
      },

      rollbackConstant: async (projectId: string, constantId: string, version: number) => {
        try {
          const response = await axios.post(`/api/v1/projects/${projectId}/constants/${constantId}/rollback`, {
            version
          })
          set((state) => ({
            constants: state.constants.map((c) =>
              c.id === constantId ? response.data : c
            )
          }))
          toast.success('Constant rolled back successfully')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to rollback constant'
          toast.error(message)
          throw error
        }
      },

      setFilters: (newFilters: Partial<ConstantState['filters']>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }))
      },

      importConstants: async (projectId: string, data: any[]) => {
        try {
          const response = await axios.post(`/api/v1/projects/${projectId}/constants/import`, {
            constants: data
          })
          set((state) => ({
            constants: [...state.constants, ...response.data]
          }))
          toast.success(`Imported ${response.data.length} constants successfully`)
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to import constants'
          toast.error(message)
          throw error
        }
      },

      exportConstants: async (projectId: string, format: 'json' | 'csv') => {
        try {
          const response = await axios.get(`/api/v1/projects/${projectId}/constants/export`, {
            params: { format },
            responseType: 'blob'
          })
          
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', `constants.${format}`)
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(url)
          
          toast.success('Constants exported successfully')
        } catch (error: any) {
          toast.error('Failed to export constants')
        }
      }
    }),
    { name: 'constant-store' }
  )
)