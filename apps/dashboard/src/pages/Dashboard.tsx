import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FolderOpen, 
  Database, 
  TrendingUp, 
  Users, 
  Plus,
  Activity,
  Clock,
  GitBranch
} from 'lucide-react'
import { useProjectStore } from '../stores/projectStore'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  const { projects, isLoading, fetchProjects } = useProjectStore()

  React.useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const stats = React.useMemo(() => {
    const totalConstants = projects.reduce((sum, p) => sum + p.constantsCount, 0)
    const totalCollaborators = projects.reduce((sum, p) => sum + p.collaborators.length, 0)
    
    return {
      projects: projects.length,
      constants: totalConstants,
      collaborators: totalCollaborators,
      environments: new Set(projects.map(p => p.environment)).size
    }
  }, [projects])

  const recentProjects = projects.slice(0, 5)

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your constants today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.projects}</h3>
              <p className="text-sm text-gray-600">Projects</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.constants}</h3>
              <p className="text-sm text-gray-600">Constants</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.collaborators}</h3>
              <p className="text-sm text-gray-600">Collaborators</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.environments}</h3>
              <p className="text-sm text-gray-600">Environments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
              <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                        <p className="text-xs text-gray-600">{project.constantsCount} constants</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
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
                      <Link 
                        to={`/projects/${project.id}/constants`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-sm text-gray-600 mb-4">Get started by creating your first project.</p>
                <Link to="/projects" className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 text-primary-600" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">
                    Project <span className="font-medium">Website Config</span> was created
                  </p>
                  <p className="text-xs text-gray-600 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    2 hours ago
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-secondary-600" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">
                    Constant <span className="font-medium">SITE_TITLE</span> was updated
                  </p>
                  <p className="text-xs text-gray-600 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    4 hours ago
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-success-600" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">
                    API usage increased by <span className="font-medium">25%</span> this week
                  </p>
                  <p className="text-xs text-gray-600 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    1 day ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard