const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
let API_BASE_URL = String(_rawBase || '/api')
if (!API_BASE_URL.includes('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api'
}

class StaffService {
  async getStaffs(token = null) {
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const response = await fetch(`${API_BASE_URL}/share/auth/users`, {
        method: 'GET',
        headers
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Lấy danh sách giáo vụ thất bại')
      }
      const data = await response.json()
      // Chỉ lấy role staff (giáo vụ)
      const staffs = Array.isArray(data.users)
        ? data.users.filter(u => {
            const role = u.Role?.role_name?.toLowerCase() || ''
            return role.includes('giáo') || role === 'staff'
          })
        : []
      return staffs
    } catch (error) {
      console.error('StaffService getStaffs error:', error)
      throw error
    }
  }
}

export default new StaffService()
