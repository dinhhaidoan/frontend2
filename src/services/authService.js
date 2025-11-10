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
}

export default new AuthService()