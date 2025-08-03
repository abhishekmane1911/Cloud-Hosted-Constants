import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  Plus, 
  FolderOpen, 
  Database, 
  Users, 
  Settings,
  Eye,
  Trash2,
  Copy,
  RefreshCw
} from 'lucide-react'
import { useProjectStore, Project } from '../stores/projectStore'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

interface ProjectForm {
  name: string
  description: string
  environment: 'development' | 'staging' | 'production'
  cacheTtl: number
}

const Projects: React.FC = () => {
  const { user } = useAuthStore()
  const { projects, isLoading, fetchProjects, createProject, updateProject, deleteProject, generateApiKey } = useProjectStore()
  const [showModal, setShowModal] = React.useState(false)
  const [editingProject, setEditingProject] = React.useState<Project | null>(null)
  const [showApiKey, setShowApiKey] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProjectForm>()

  React.useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const onSubmit = async (data: ProjectForm) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data)
      } else {
        await createProject(data)
      }
      closeModal()
    } catch (error) {
      // Error handled in store
    }
  }

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      reset({
        name: project.name,
        description: project.description,
        environment: project.environment,
        cacheTtl: project.cacheTtl
      })
    } else {
      setEditingProject(null)
      reset({
        name: '',
        description: '',
        environment: 'development',
        cacheTtl: 300
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProject(null)
    reset()
  }

  const handleDelete = async (project: Project) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      await deleteProject(project.id)
    }
  }

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API key copied to clipboard')
  }

  const handleGenerateApiKey = async (projectId: string) => {
    if (window.confirm('Are you sure you want to generate a new API key? The old key will stop working immediately.')) {
      await generateApiKey(projectId)
    }
  }

  const canEdit = user?.role === 'admin' || user?.role === 'editor'

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your constants projects and environments.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => openModal()}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${project.environment === 'production' 
                        ? 'bg-success-100 text-success-800'
                        : project.environment === 'staging'
                        ? 'bg-warning-100 text-warning-800'
                        : 'bg-gray-100 text-gray-800'
                      }
                    `}>
                      {project.environment}
                    </span>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openModal(project)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                      title="Edit"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      className="p-2 text-gray-400 hover:text-error-600 rounded-lg hover:bg-error-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4">{project.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Database className="w-4 h-4 mr-1" />
                  {project.constantsCount} constants
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {project.collaborators.length} collaborators
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">API Key</label>
                <div className="flex items-center">
                  <input
                    type={showApiKey === project.id ? 'text' : 'password'}
                    value={project.apiKey}
                    readOnly
                    className="flex-1 text-xs px-2 py-1 border rounded-l-md bg-gray-50"
                  />
                  <button
                    onClick={() => setShowApiKey(showApiKey === project.id ? null : project.id)}
                    className="px-2 py-1 border-t border-b border-gray-300 hover:bg-gray-50"
                    title="Toggle visibility"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => copyApiKey(project.apiKey)}
                    className="px-2 py-1 border-t border-b border-gray-300 hover:bg-gray-50"
                    title="Copy"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => handleGenerateApiKey(project.id)}
                      className="px-2 py-1 border rounded-r-md hover:bg-gray-50"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Link
                  to={`/projects/${project.id}/constants`}
                  className="flex-1 btn-primary text-center"
                >
                  View Constants
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first project.</p>
          {canEdit && (
            <button onClick={() => openModal()} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingProject ? 'Edit Project' : 'Create New Project'}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name
                      </label>
                      <input
                        {...register('name', { required: 'Project name is required' })}
                        type="text"
                        className="input-field"
                        placeholder="Enter project name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        rows={3}
                        className="input-field"
                        placeholder="Enter project description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Environment
                      </label>
                      <select {...register('environment')} className="input-field">
                        <option value="development">Development</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cache TTL (seconds)
                      </label>
                      <input
                        {...register('cacheTtl', { 
                          required: 'Cache TTL is required',
                          min: { value: 60, message: 'Minimum TTL is 60 seconds' }
                        })}
                        type="number"
                        className="input-field"
                        placeholder="300"
                      />
                      {errors.cacheTtl && (
                        <p className="mt-1 text-sm text-error-600">{errors.cacheTtl.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn-primary sm:ml-3">
                    {editingProject ? 'Update' : 'Create'} Project
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects