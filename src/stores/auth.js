import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuth } from '@/hooks/useAuth'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  try {
    const authHook = useAuth()

    // Users state for admin/staff pages
  const users = ref([])
  const usersLoading = ref(false)
  const usersUpdating = ref(false)
  const usersError = ref(null)

    // Fetch users via service and store locally
    const fetchUsers = async (token = null) => {
      usersLoading.value = true
      usersError.value = null
      try {
        const data = await authService.getUsers(token)
        if (data && Array.isArray(data.users)) {
          users.value = data.users
        } else {
          users.value = []
        }
        return users.value
      } catch (err) {
        usersError.value = err
        throw err
      } finally {
        usersLoading.value = false
      }
    }

    // Update user via service and update local users state
    const updateUser = async (userCode, payload = {}, token = null) => {
      usersUpdating.value = true
      try {
        const result = await authService.updateUser(userCode, payload, token)
        
        // Try to update local copy - find by user_code
        const idx = users.value.findIndex(u => u.user_code === userCode)
        
        if (idx > -1 && result.user) {
          // Only update if backend returned updated user data
          users.value[idx] = { ...users.value[idx], ...result.user }
        }
        return result
      } catch (err) {
        throw err
      } finally {
        usersUpdating.value = false
      }
    }

    // Delete user via service and update local users state
    const deleteUser = async (userCode, token = null) => {
      usersUpdating.value = true
      try {
        const result = await authService.deleteUser(userCode, token)
        
        // Remove user from local users array
        const idx = users.value.findIndex(u => u.user_code === userCode)
        if (idx > -1) {
          users.value.splice(idx, 1)
        }
        
        return result
      } catch (err) {
        throw err
      } finally {
        usersUpdating.value = false
      }
    }

    return {
      // Expose hook methods and state
      ...authHook,
      // Users management
  users,
  usersLoading,
  usersUpdating,
  usersError,
  fetchUsers,
  updateUser,
  deleteUser
    }
  } catch (error) {
    console.error('Error initializing auth store:', error)
    // Return minimal working store
    return {
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: () => false,
      getUserRole: () => null,
      loadUserFromStorage: () => false,
      login: async () => { throw new Error('Auth not initialized') },
      logout: () => {},
      getDashboardRoute: () => '/login',
      users: [],
      usersLoading: false,
      usersError: null,
      fetchUsers: async () => { return [] },
      updateUser: async () => { throw new Error('Auth not initialized') }
    }
  }
})