// Normalize API base: allow env to be 'http://localhost:3000' or 'http://localhost:3000/api'
const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
let API_BASE_URL = String(_rawBase || '/api')
// ensure it contains '/api' as a path segment (so that callers like `${API_BASE_URL}/share/...` resolve to /api/share/...)
if (!API_BASE_URL.includes('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api'
}

class AuthService {
  async login(user_code, user_password) {
    try {
      const response = await fetch(`${API_BASE_URL}/share/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Important: include credentials so browser accepts HttpOnly Set-Cookie from server
        credentials: 'include',
        body: JSON.stringify({
          user_code,
          user_password
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Đăng nhập thất bại')
      }
      
      return await response.json()
    } catch (error) {
      console.error('AuthService login error:', error)
      throw error
    }
  }

  async logout(token) {
    try {
      // Call server logout endpoint which clears the cookie. Use credentials so
      // the cookie is sent and cleared on the server side. Do not rely on
      // Authorization header when server uses HttpOnly cookies.
      await fetch(`${API_BASE_URL}/share/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
    } catch (error) {
      console.error('AuthService logout error:', error)
    }
  }

  // Fetch all users from backend and attach department info
  async getUsers(token = null) {
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      // Fetch users list from the users endpoint (GET /share/auth/users)
      const url = `${API_BASE_URL}/share/auth/users`
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers
      })

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        // Try parse JSON if server returned JSON, otherwise return text
        try {
          const json = JSON.parse(text || '{}')
          throw new Error(json.message || json.error || 'Lấy danh sách người dùng thất bại')
        } catch (e) {
          throw new Error(text || 'Lấy danh sách người dùng thất bại')
        }
      }

      const data = await response.json()

      // Ensure frontend always has department info (khoa/phòng ban = CNTT)
      if (Array.isArray(data.users)) {
        data.users = data.users.map(u => ({ ...u, department: 'CNTT' }))
      }

      return data
    } catch (error) {
      // Handle network errors gracefully
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('Backend server not available for user data')
        throw new Error('NETWORK_ERROR')
      }
      console.error('AuthService getUsers error:', error)
      throw error
    }
  }

  // Update a user (partial update) - uses user_code as path parameter
  async updateUser(userCode, payload = {}, token = null) {
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_BASE_URL}/share/auth/users/${userCode}`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error('AuthService updateUser response error:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('AuthService updateUser error:', error)
      throw error
    }
  }

  // Delete a user by user_code
  async deleteUser(userCode, token = null) {
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_BASE_URL}/share/auth/users/${userCode}`, {
        method: 'DELETE',
        credentials: 'include',
        headers
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('AuthService deleteUser response error:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      // DELETE may return empty response or success message
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      return { success: true }
    } catch (error) {
      console.error('AuthService deleteUser error:', error)
      throw error
    }
  }

  // Create a new user
  async createUser(payload = {}, token = null) {
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      // First try modern register endpoint that accepts nested payload { user, role_name, profile }
      const registerUrl = `${API_BASE_URL}/share/auth/register`
      let response = await fetch(registerUrl, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(payload)
      })

      // If register endpoint not found or returns 404, fallback to legacy /users endpoint
      if (!response.ok && response.status === 404) {
        console.warn('AuthService.createUser: register endpoint missing, falling back to /users')
        // build a fallback flat payload expected by older endpoints
        const fallback = {
          user_code: payload.user?.user_code || payload.user_code || payload.staff_code || null,
          user_fullname: payload.user?.user_fullname || payload.user_fullname || payload.user?.user_fullname || null,
          user_email: payload.user?.user_email || payload.user_email || null,
          user_phone: payload.user?.user_phone || payload.user_phone || null,
          user_password: payload.user?.user_password || payload.password || payload.user_password || null,
          role_id: payload.role_id || 3,
          Staff: payload.profile || payload.Staff || null
        }
        const usersUrl = `${API_BASE_URL}/share/auth/users`
        response = await fetch(usersUrl, {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify(fallback)
        })
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.error('AuthService createUser response error:', errorText)
        // Provide clearer error messages for 404 or 400
        if (response.status === 404) {
          throw new Error(`API_NOT_FOUND: POST ${registerUrl} - ${errorText}`)
        }
        // If server returned HTML (e.g., default 404 page), include the text
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('AuthService createUser error:', error)
      throw error
    }
  }

  // Get current authenticated user (server reads cookie)
  async me() {
    try {
      const response = await fetch(`${API_BASE_URL}/share/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || 'Không thể lấy thông tin người dùng')
      }

      return await response.json()
    } catch (error) {
      console.error('AuthService me error:', error)
      throw error
    }
  }

  // Get a single user by user_code
  async getUser(userCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/share/auth/users/${userCode}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || 'Không thể lấy thông tin người dùng')
      }

      return await response.json()
    } catch (error) {
      console.error('AuthService getUser error:', error)
      throw error
    }
  }
}

export default new AuthService()