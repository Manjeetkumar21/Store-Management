import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Store for managing AbortControllers
const pendingRequests = new Map()

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor - Add AbortController and cancel duplicate requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Create a unique key for this request (method + url + params)
    const requestKey = `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`
    
    // Cancel previous request with the same key if it exists
    if (pendingRequests.has(requestKey)) {
      const controller = pendingRequests.get(requestKey)
      controller.abort()
      pendingRequests.delete(requestKey)
    }
    
    // Create new AbortController for this request
    const controller = new AbortController()
    config.signal = controller.signal
    
    // Store the controller
    pendingRequests.set(requestKey, controller)
    
    // Attach the request key to config for cleanup
    config.requestKey = requestKey
    
    // Add token if it exists
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Clean up completed requests
axiosInstance.interceptors.response.use(
  (response) => {
    // Remove the request from pending requests
    if (response.config.requestKey) {
      pendingRequests.delete(response.config.requestKey)
    }
    return response
  },
  (error) => {
    // Remove the request from pending requests
    if (error.config?.requestKey) {
      pendingRequests.delete(error.config.requestKey)
    }
    
    // Silently ignore cancelled requests
    if (axios.isCancel(error)) {
      return Promise.reject({ cancelled: true, silent: true })
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    
    return Promise.reject(error)
  }
)

// Utility function to cancel all pending requests (call on page navigation)
export const cancelAllRequests = () => {
  pendingRequests.forEach((controller) => {
    controller.abort()
  })
  pendingRequests.clear()
}

// Utility function to cancel specific request
export const cancelRequest = (method, url, params = {}) => {
  const requestKey = `${method}-${url}-${JSON.stringify(params)}`
  if (pendingRequests.has(requestKey)) {
    const controller = pendingRequests.get(requestKey)
    controller.abort()
    pendingRequests.delete(requestKey)
  }
}

export default axiosInstance
