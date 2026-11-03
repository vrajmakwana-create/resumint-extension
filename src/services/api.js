// Resumint Extension API Service

export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'
export const WEB_APP_URL = 'http://localhost:5173'

// Cross-environment Storage (Chrome Extension storage or Browser LocalStorage)
export const storage = {
  async get(key) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key] || null)
        })
      })
    }
    return localStorage.getItem(key)
  },

  async set(key, value) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => resolve())
      })
    }
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  },

  async remove(key) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.remove([key], () => resolve())
      })
    }
    localStorage.removeItem(key)
  },
}

export async function getToken() {
  return await storage.get('resumint_token')
}

export async function setToken(token) {
  if (token) {
    await storage.set('resumint_token', token)
  } else {
    await storage.remove('resumint_token')
  }
}

export async function clearSession() {
  await storage.remove('resumint_token')
  await storage.remove('resumint_user')
}

// Universal API Client with Bearer Token
export async function apiClient(endpoint, options = {}) {
  const { method = 'GET', headers = {}, body, ...customConfig } = options
  const token = await getToken()

  const config = {
    method,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
    ...customConfig,
  }

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  if (body) {
    config.headers['Content-Type'] = 'application/json'
    config.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  let response
  try {
    response = await fetch(url, config)
  } catch (err) {
    throw new Error('Unable to connect to Resumint backend server. Ensure backend is running.')
  }

  let data
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const errorMsg =
      (data && (data.msg || data.detail || data.message)) ||
      `Request failed with status ${response.status}`
    const error = new Error(errorMsg)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const authApi = {
  // Login with email and password
  login: async ({ email, password }) => {
    const response = await apiClient('/users/login', {
      method: 'POST',
      body: { email, password },
    })

    const resData = response?.data || response
    const token = resData?.access_token || response?.access_token
    const user = resData?.user || response?.user

    if (token) {
      await setToken(token)
    }
    if (user) {
      await storage.set('resumint_user', user)
    }

    return { token, user, response }
  },

  // Fetch current user and check onboarding completion
  getMe: async () => {
    const response = await apiClient('/users/me', {
      method: 'GET',
    })
    const user = response?.data || response
    if (user) {
      await storage.set('resumint_user', user)
    }
    return user
  },
}

export const jobApi = {
  // Analyze JD and generate tailored resume
  analyzeJobDescription: async ({ job_title, company_name, job_description }) => {
    const response = await apiClient('/job-description/analyze', {
      method: 'POST',
      body: { job_title, company_name, job_description },
    })
    return response?.data || response
  },

  // Get past analysis history
  getHistory: async () => {
    const response = await apiClient('/job-description/', {
      method: 'GET',
    })
    return response?.data || response
  },
}

