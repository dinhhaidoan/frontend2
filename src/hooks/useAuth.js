import { ref } from 'vue'
import authService from '@/services/authService'

export function useAuth() {
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token.value && !!user.value
  }

  // Get user role (always return a role name string when possible)
  const getUserRole = () => {
    // If backend returns a named role, use it
    if (user.value?.role) return user.value.role

    // If backend returns a numeric role_id, map it to a role name
    const rid = user.value?.role_id ?? user.value?.roleId ?? null
    if (rid !== null && rid !== undefined) {
      const id = Number(rid)
      switch (id) {
        case 1:
          return 'student'
        case 2:
          return 'teacher'
        case 3:
          return 'staff'
        case 4:
          return 'admin'
        default:
          return null
      }
    }

    return null
  }

  // Load user from localStorage
  const loadUserFromStorage = () => {
    isLoading.value = true
    try {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')
      
      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
        return true
      }
    } catch (error) {
      console.error('Error loading user from storage:', error)
      clearAuth()
    } finally {
      isLoading.value = false
    }
    return false
  }

  // Save user to localStorage
  const saveUserToStorage = (userData, authToken) => {
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))
  }

  // Clear authentication data
  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  // Login function
  const login = async (user_code, user_password) => {
    isLoading.value = true
    error.value = null

    try {
      // Call actual API
      const result = await authService.login(user_code, user_password)

      // Store authentication data
      user.value = result.user
      token.value = result.token
      saveUserToStorage(result.user, result.token)

      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Logout function
  const logout = async () => {
    try {
      if (token.value) {
        await authService.logout(token.value)
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearAuth()
    }
  }

  // Get dashboard route based on role
  const getDashboardRoute = () => {
    const role = getUserRole()

    // If role is a numeric id (or numeric string), map to role names.
    let roleName = role
    if (typeof role === 'number' || (typeof role === 'string' && /^\d+$/.test(role))) {
      // Backend seeds roles in this order (ids 1..4):
      // 1: 'Sinh viên' (student)
      // 2: 'Giảng viên' (teacher)
      // 3: 'Giáo vụ khoa' (staff)
      // 4: 'Quản trị viên' (admin)
      const id = Number(role)
      switch (id) {
        case 1:
          roleName = 'student'
          break
        case 2:
          roleName = 'teacher'
          break
        case 3:
          roleName = 'staff'
          break
        case 4:
          roleName = 'admin'
          break
        default:
          roleName = null
      }
    }

    switch (roleName) {
      case 'admin':
        return '/admin-dashboard'
      case 'staff':
        return '/staff-dashboard'
      case 'teacher':
        return '/teacher-dashboard'
      case 'student':
        return '/student-dashboard'
      default:
        return '/login'
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    getUserRole,
    loadUserFromStorage,
    login,
    logout,
    getDashboardRoute
  }
}