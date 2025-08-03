import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'

export interface Project {
  id: string
  name: string
  description: string
  environment: 'development' | 'staging' | 'production'
  apiKey: string
  cacheTtl: number
  createdAt: string
  updatedAt: string
  constantsCount: number
  collaborators: Array<{
    id: string
    email: string
    role: 'admin' | 'editor' | 'viewer'
  }>
}

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  fetchProjects: () => Promise<void>
  createProject: (data: Partial<Project>) => Promise<void>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setCurrentProject: (project: Project | null) => void
  generateApiKey: (projectId: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,

      fetchProjects: async () => {
        try {
          set({ isLoading: true })
          const response = await axios.get('/api/v1/projects')
          set({ projects: response.data, isLoading: false })
        } catch (error: any) {
          set({ isLoading: false })
          toast.error('Failed to fetch projects')
        }
      },

      createProject: async (data: Partial<Project>) => {
        try {
          const response = await axios.post('/api/v1/projects', data)
          set((state) => ({
            projects: [...state.projects, response.data]
          }))
          toast.success('Project created successfully')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to create project'
          toast.error(message)
          throw error
        }
      },

      updateProject: async (id: string, data: Partial<Project>) => {
        try {
          const response = await axios.put(`/api/v1/projects/${id}`, data)
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? response.data : p
            ),
            currentProject: state.currentProject?.id === id ? response.data : state.currentProject
          }))
          toast.success('Project updated successfully')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to update project'
          toast.error(message)
          throw error
        }
      },

      deleteProject: async (id: string) => {
        try {
          await axios.delete(`/api/v1/projects/${id}`)
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject
          }))
          toast.success('Project deleted successfully')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to delete project'
          toast.error(message)
          throw error
        }
      },

      setCurrentProject: (project: Project | null) => {
        set({ currentProject: project })
      },

      generateApiKey: async (projectId: string) => {
        try {
          const response = await axios.post(`/api/v1/projects/${projectId}/api-key`)
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId ? { ...p, apiKey: response.data.apiKey } : p
            ),
            currentProject: state.currentProject?.id === projectId 
              ? { ...state.currentProject, apiKey: response.data.apiKey }
              : state.currentProject
          }))
          toast.success('API key regenerated successfully')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to generate API key'
          toast.error(message)
          throw error
        }
      },
    }),
    { name: 'project-store' }
  )
)