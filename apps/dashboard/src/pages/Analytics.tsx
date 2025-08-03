import React from 'react'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  Database,
  RefreshCw
} from 'lucide-react'

const Analytics: React.FC = () => {
  // Mock data for demonstration
  const usageData = [
    { name: 'Mon', requests: 1200, cacheHits: 800 },
    { name: 'Tue', requests: 1900, cacheHits: 1300 },
    { name: 'Wed', requests: 1400, cacheHits: 900 },
    { name: 'Thu', requests: 2200, cacheHits: 1600 },
    { name: 'Fri', requests: 1800, cacheHits: 1200 },
    { name: 'Sat', requests: 1600, cacheHits: 1100 },
    { name: 'Sun', requests: 1300, cacheHits: 850 }
  ]

  const responseTimeData = [
    { name: '00:00', time: 120 },
    { name: '04:00', time: 98 },
    { name: '08:00', time: 180 },
    { name: '12:00', time: 250 },
    { name: '16:00', time: 320 },
    { name: '20:00', time: 200 }
  ]

  const environmentData = [
    { name: 'Production', value: 65, color: '#22c55e' },
    { name: 'Staging', value: 25, color: '#f59e0b' },
    { name: 'Development', value: 10, color: '#6b7280' }
  ]

  const topConstants = [
    { key: 'SITE_TITLE', requests: 15420, change: 12 },
    { key: 'API_URL', requests: 12350, change: 8 },
    { key: 'THEME_COLOR', requests: 9870, change: -3 },
    { key: 'MAX_ITEMS', requests: 8540, change: 15 },
    { key: 'VERSION', requests: 7230, change: 5 }
  ]

  const stats = [
    {
      name: 'Total Requests',
      value: '124.2K',
      change: '+12.5%',
      icon: Activity,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      name: 'Cache Hit Rate',
      value: '87.3%',
      change: '+2.1%',
      icon: Database,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100'
    },
    {
      name: 'Avg Response Time',
      value: '185ms',
      change: '-8.2%',
      icon: Clock,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      name: 'Error Rate',
      value: '0.12%',
      change: '-0.05%',
      icon: TrendingUp,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100'
    }
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor your constants usage and performance metrics.
          </p>
        </div>
        <button className="btn-outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{stat.value}</h3>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-success-600' : 
                  stat.change.startsWith('-') && stat.name !== 'Avg Response Time' && stat.name !== 'Error Rate' 
                    ? 'text-error-600' : 'text-success-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 ml-1">vs last week</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Usage Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#3b82f6" name="Total Requests" />
              <Bar dataKey="cacheHits" fill="#14b8a6" name="Cache Hits" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="time" 
                stroke="#f97316" 
                strokeWidth={2}
                name="Response Time (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Environment Distribution */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment Usage</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={environmentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
              >
                {environmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {environmentData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Constants */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Requested Constants</h2>
          <div className="space-y-4">
            {topConstants.map((constant, index) => (
              <div key={constant.key} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{constant.key}</h3>
                    <p className="text-xs text-gray-600">{constant.requests.toLocaleString()} requests</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    constant.change > 0 ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {constant.change > 0 ? '+' : ''}{constant.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics