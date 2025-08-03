import React from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  Plus, 
  Database, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Filter,
  Search,
  History,
  Tag
} from 'lucide-react'
import { useConstantStore, Constant } from '../stores/constantStore'
import { useProjectStore } from '../stores/projectStore'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/LoadingSpinner'

interface ConstantForm {
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  environment: 'development' | 'staging' | 'production'
  tags: string
  description: string
}

const Constants: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuthStore()
  const { currentProject, setCurrentProject, projects } = useProjectStore()
  const { 
    constants, 
    isLoading, 
    filters,
    fetchConstants, 
    createConstant, 
    updateConstant, 
    deleteConstant,
    setFilters,
    exportConstants,
    importConstants
  } = useConstantStore()

  const [showModal, setShowModal] = React.useState(false)
  const [editingConstant, setEditingConstant] = React.useState<Constant | null>(null)
  const [showFilters, setShowFilters] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ConstantForm>()

  const watchType = watch('type')

  React.useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setCurrentProject(project)
      }
      fetchConstants(projectId)
    }
  }, [projectId, projects, setCurrentProject, fetchConstants])

  const onSubmit = async (data: ConstantForm) => {
    if (!projectId) return
    
    try {
      let parsedValue = data.value
      
      // Parse value based on type
      if (data.type === 'number') {
        parsedValue = Number(data.value)
      } else if (data.type === 'boolean') {
        parsedValue = data.value === 'true'
      } else if (data.type === 'object' || data.type === 'array') {
        try {
          parsedValue = JSON.parse(data.value)
        } catch (e) {
          throw new Error('Invalid JSON format')
        }
      }

      const constantData = {
        ...data,
        value: parsedValue,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : []
      }

      if (editingConstant) {
        await updateConstant(projectId, editingConstant.id, constantData)
      } else {
        await createConstant(projectId, constantData)
      }
      closeModal()
    } catch (error: any) {
      // Error handled in store or shown above
    }
  }

  const openModal = (constant?: Constant) => {
    if (constant) {
      setEditingConstant(constant)
      reset({
        key: constant.key,
        value: typeof constant.value === 'object' 
          ? JSON.stringify(constant.value, null, 2) 
          : String(constant.value),
        type: constant.type,
        environment: constant.environment,
        tags: constant.tags.join(', '),
        description: constant.description
      })
    } else {
      setEditingConstant(null)
      reset({
        key: '',
        value: '',
        type: 'string',
        environment: 'development',
        tags: '',
        description: ''
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingConstant(null)
    reset()
  }

  const handleDelete = async (constant: Constant) => {
    if (!projectId) return
    if (window.confirm(`Are you sure you want to delete "${constant.key}"?`)) {
      await deleteConstant(projectId, constant.id)
    }
  }

  const handleExport = async (format: 'json' | 'csv') => {
    if (!projectId) return
    await exportConstants(projectId, format)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !projectId) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        let data: any[]

        if (file.type === 'application/json') {
          data = JSON.parse(content)
        } else {
          // Handle CSV parsing here if needed
          data = []
        }

        await importConstants(projectId, data)
        // Reset file input
        event.target.value = ''
      } catch (error) {
        // Error handled in store
      }
    }
    reader.readAsText(file)
  }

  const handleSearch = (value: string) => {
    setFilters({ search: value })
    if (projectId) {
      fetchConstants(projectId)
    }
  }

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters({ [key]: value })
    if (projectId) {
      fetchConstants(projectId)
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentProject?.name} Constants
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage constants for the {currentProject?.environment} environment.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExport('json')}
            className="btn-outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          {canEdit && (
            <>
              <div className="relative">
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="btn-outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </button>
              </div>
              <button
                onClick={() => openModal()}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Constant
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search constants..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filters.environment}
              onChange={(e) => handleFilterChange('environment', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Environments</option>
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Constants List */}
      {constants.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Environment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {constants.map((constant) => (
                  <tr key={constant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{constant.key}</div>
                      {constant.description && (
                        <div className="text-sm text-gray-500">{constant.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {typeof constant.value === 'object' 
                          ? JSON.stringify(constant.value)
                          : String(constant.value)
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {constant.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${constant.environment === 'production' 
                          ? 'bg-success-100 text-success-800'
                          : constant.environment === 'staging'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-gray-100 text-gray-800'
                        }
                      `}>
                        {constant.environment}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {constant.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(constant.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-gray-400 hover:text-gray-600"
                          title="History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => openModal(constant)}
                              className="text-gray-400 hover:text-primary-600"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(constant)}
                              className="text-gray-400 hover:text-error-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No constants yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first constant.</p>
          {canEdit && (
            <button onClick={() => openModal()} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Constant
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingConstant ? 'Edit Constant' : 'Create New Constant'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Key
                      </label>
                      <input
                        {...register('key', { required: 'Key is required' })}
                        type="text"
                        className="input-field"
                        placeholder="SITE_TITLE"
                      />
                      {errors.key && (
                        <p className="mt-1 text-sm text-error-600">{errors.key.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select 
                        {...register('type')} 
                        className="input-field"
                        onChange={(e) => {
                          setValue('type', e.target.value as any)
                          // Update placeholder value based on type
                          const placeholders = {
                            string: 'Hello World',
                            number: '42',
                            boolean: 'true',
                            object: '{"key": "value"}',
                            array: '["item1", "item2"]'
                          }
                          setValue('value', placeholders[e.target.value as keyof typeof placeholders] || '')
                        }}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="object">Object</option>
                        <option value="array">Array</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value
                      </label>
                      {watchType === 'boolean' ? (
                        <select {...register('value')} className="input-field">
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : watchType === 'object' || watchType === 'array' ? (
                        <textarea
                          {...register('value', { required: 'Value is required' })}
                          rows={4}
                          className="input-field font-mono text-sm"
                          placeholder={watchType === 'object' ? '{"key": "value"}' : '["item1", "item2"]'}
                        />
                      ) : (
                        <input
                          {...register('value', { required: 'Value is required' })}
                          type={watchType === 'number' ? 'number' : 'text'}
                          className="input-field"
                          placeholder={watchType === 'number' ? '42' : 'Enter value'}
                        />
                      )}
                      {errors.value && (
                        <p className="mt-1 text-sm text-error-600">{errors.value.message}</p>
                      )}
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
                        Tags (comma-separated)
                      </label>
                      <input
                        {...register('tags')}
                        type="text"
                        className="input-field"
                        placeholder="ui, config, feature"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        rows={2}
                        className="input-field"
                        placeholder="Enter description (optional)"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn-primary sm:ml-3">
                    {editingConstant ? 'Update' : 'Create'} Constant
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

export default Constants