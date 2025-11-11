const API_BASE_URL = 'http://localhost:3000/api'

class AuthService {
  async login(user_code, user_password) {
    try {
      const response = await fetch(`${API_BASE_URL}/share/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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

      const response = await fetch(`${API_BASE_URL}/share/auth/users`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Lấy danh sách người dùng thất bại')
      }

      const data = await response.json()

      // Ensure frontend always has department info (khoa/phòng ban = CNTT)
      if (Array.isArray(data.users)) {
        data.users = data.users.map(u => ({ ...u, department: 'CNTT' }))
      }

      return data
    } catch (error) {
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
}

export default new AuthService()