import axios, { AxiosInstance } from 'axios'

export interface SDKConfig {
  apiKey: string
  environment: 'development' | 'staging' | 'production'
  baseURL?: string
  cacheTTL?: number
  retryAttempts?: number
  retryDelay?: number
}

export interface Constant {
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  environment: string
  tags: string[]
  version: number
  updatedAt: string
}

export interface ConstantResponse {
  success: boolean
  data?: any
  error?: string
  cached?: boolean
  version?: number
}

export type ConstantChangeCallback = (key: string, newValue: any, oldValue: any) => void

class ConstantsSDK {
  private config: SDKConfig
  private client: AxiosInstance
  private cache: Map<string, { value: any; expiry: number; version: number }>
  private subscribers: Map<string, ConstantChangeCallback[]>
  private websocket: WebSocket | null = null

  constructor(config: SDKConfig) {
    this.config = {
      baseURL: 'https://api.constants.example.com',
      cacheTTL: 300000, // 5 minutes
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    }

    this.cache = new Map()
    this.subscribers = new Map()

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Environment': this.config.environment
      }
    })

    // Setup retry interceptor
    this.setupRetryInterceptor()
    
    // Initialize WebSocket connection for real-time updates
    this.initWebSocket()
  }

  /**
   * Get a single constant by key
   */
  async getConstant(key: string, useCache: boolean = true): Promise<ConstantResponse> {
    try {
      // Check cache first
      if (useCache && this.isCached(key)) {
        const cached = this.cache.get(key)!
        return {
          success: true,
          data: cached.value,
          cached: true,
          version: cached.version
        }
      }

      const response = await this.client.get(`/v1/constants/${key}`)
      const constant: Constant = response.data

      // Cache the result
      this.cacheConstant(key, constant.value, constant.version)

      return {
        success: true,
        data: constant.value,
        cached: false,
        version: constant.version
      }
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  /**
   * Get multiple constants by keys
   */
  async getConstants(keys: string[], useCache: boolean = true): Promise<Record<string, ConstantResponse>> {
    const results: Record<string, ConstantResponse> = {}
    const uncachedKeys: string[] = []

    // Check cache for each key
    if (useCache) {
      for (const key of keys) {
        if (this.isCached(key)) {
          const cached = this.cache.get(key)!
          results[key] = {
            success: true,
            data: cached.value,
            cached: true,
            version: cached.version
          }
        } else {
          uncachedKeys.push(key)
        }
      }
    } else {
      uncachedKeys.push(...keys)
    }

    // Fetch uncached keys
    if (uncachedKeys.length > 0) {
      try {
        const response = await this.client.post('/v1/constants/batch', {
          keys: uncachedKeys
        })

        const constants: Record<string, Constant> = response.data

        for (const [key, constant] of Object.entries(constants)) {
          // Cache the result
          this.cacheConstant(key, constant.value, constant.version)
          
          results[key] = {
            success: true,
            data: constant.value,
            cached: false,
            version: constant.version
          }
        }

        // Mark missing keys as not found
        for (const key of uncachedKeys) {
          if (!constants[key]) {
            results[key] = {
              success: false,
              error: 'Constant not found'
            }
          }
        }
      } catch (error: any) {
        // Handle error for all uncached keys
        const errorResponse = this.handleError(error)
        for (const key of uncachedKeys) {
          results[key] = errorResponse
        }
      }
    }

    return results
  }

  /**
   * Subscribe to constant changes
   */
  subscribe(key: string, callback: ConstantChangeCallback): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, [])
    }
    
    this.subscribers.get(key)!.push(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(key)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
        
        if (callbacks.length === 0) {
          this.subscribers.delete(key)
        }
      }
    }
  }

  /**
   * Clear cache for specific key or all keys
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    // This would require tracking hits/misses in a real implementation
    return {
      size: this.cache.size,
      hitRate: 0.85 // Mock value
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
    this.cache.clear()
    this.subscribers.clear()
  }

  private isCached(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    
    return Date.now() < cached.expiry
  }

  private cacheConstant(key: string, value: any, version: number): void {
    this.cache.set(key, {
      value,
      version,
      expiry: Date.now() + this.config.cacheTTL!
    })
  }

  private setupRetryInterceptor(): void {
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { config: requestConfig } = error
        
        if (!requestConfig || requestConfig._retryCount >= this.config.retryAttempts!) {
          return Promise.reject(error)
        }

        requestConfig._retryCount = (requestConfig._retryCount || 0) + 1

        // Exponential backoff
        const delay = this.config.retryDelay! * Math.pow(2, requestConfig._retryCount - 1)
        await new Promise(resolve => setTimeout(resolve, delay))

        return this.client(requestConfig)
      }
    )
  }

  private initWebSocket(): void {
    try {
      const wsUrl = this.config.baseURL!.replace(/^http/, 'ws') + '/ws'
      this.websocket = new WebSocket(wsUrl, [], {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Environment': this.config.environment
        }
      } as any)

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleConstantUpdate(data)
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error)
        }
      }

      this.websocket.onclose = () => {
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (!this.websocket || this.websocket.readyState === WebSocket.CLOSED) {
            this.initWebSocket()
          }
        }, 5000)
      }

      this.websocket.onerror = (error) => {
        console.warn('WebSocket error:', error)
      }
    } catch (error) {
      console.warn('Failed to initialize WebSocket connection:', error)
    }
  }

  private handleConstantUpdate(data: { key: string; value: any; version: number }): void {
    const { key, value: newValue, version } = data
    
    // Get old value from cache
    const cached = this.cache.get(key)
    const oldValue = cached ? cached.value : undefined

    // Update cache
    this.cacheConstant(key, newValue, version)

    // Notify subscribers
    const callbacks = this.subscribers.get(key)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(key, newValue, oldValue)
        } catch (error) {
          console.warn('Error in constant change callback:', error)
        }
      })
    }
  }

  private handleError(error: any): ConstantResponse {
    const message = error.response?.data?.message || error.message || 'Unknown error'
    
    return {
      success: false,
      error: message
    }
  }
}

// Global instance for easy usage
let globalSDK: ConstantsSDK | null = null

export const ConstantsManager = {
  /**
   * Initialize the global SDK instance
   */
  init(config: SDKConfig): void {
    globalSDK = new ConstantsSDK(config)
  },

  /**
   * Get the global SDK instance
   */
  getInstance(): ConstantsSDK | null {
    return globalSDK
  },

  /**
   * Shorthand methods using global instance
   */
  async getConstant(key: string, useCache: boolean = true): Promise<ConstantResponse> {
    if (!globalSDK) {
      throw new Error('SDK not initialized. Call ConstantsManager.init() first.')
    }
    return globalSDK.getConstant(key, useCache)
  },

  async getConstants(keys: string[], useCache: boolean = true): Promise<Record<string, ConstantResponse>> {
    if (!globalSDK) {
      throw new Error('SDK not initialized. Call ConstantsManager.init() first.')
    }
    return globalSDK.getConstants(keys, useCache)
  },

  subscribe(key: string, callback: ConstantChangeCallback): () => void {
    if (!globalSDK) {
      throw new Error('SDK not initialized. Call ConstantsManager.init() first.')
    }
    return globalSDK.subscribe(key, callback)
  },

  clearCache(key?: string): void {
    if (!globalSDK) {
      throw new Error('SDK not initialized. Call ConstantsManager.init() first.')
    }
    globalSDK.clearCache(key)
  },

  getCacheStats(): { size: number; hitRate: number } {
    if (!globalSDK) {
      throw new Error('SDK not initialized. Call ConstantsManager.init() first.')
    }
    return globalSDK.getCacheStats()
  },

  disconnect(): void {
    if (globalSDK) {
      globalSDK.disconnect()
      globalSDK = null
    }
  }
}

export { ConstantsSDK }
export default ConstantsManager