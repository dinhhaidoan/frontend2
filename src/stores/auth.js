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

        // Result shape might vary between backends. Normalize the returned updated user
        // Common shapes: { user: { ... } } OR { user_code: '...', ... } OR { updated: { ... } }
        let updatedUser = null
        if (result && typeof result === 'object') {
          updatedUser = result.user || result.updated || result.updatedUser || result
        }

        // Try to update local copy - find by user_code
        const idx = users.value.findIndex(u => u.user_code === userCode)
        if (idx > -1 && updatedUser && (updatedUser.user_code || updatedUser.user_id || updatedUser.user)) {
          // Use normalized fields when possible
          users.value[idx] = { ...users.value[idx], ...updatedUser }
        } else if (idx > -1) {
          // If backend did not return user object, merge known fields from payload
          // support nested payloads like { user: {...}, profile: {...} }
          const base = { ...users.value[idx] }
          if (payload.user && typeof payload.user === 'object') {
            Object.assign(base, payload.user)
          }
          if (payload.profile && typeof payload.profile === 'object') {
            // merge profile (Staff) into Staff fields if present
            base.Staff = { ...(base.Staff || {}), ...payload.profile }
            // make some shortcuts for common fields
            if (payload.profile.staff_name) base.user_fullname = payload.profile.staff_name
            if (payload.profile.staff_code) base.user_code = payload.profile.staff_code
          }
          // fallback: merge top-level fields
          Object.assign(base, payload)
          users.value[idx] = base
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

    // Create user via service and update local users state
    const createUser = async (payload = {}, token = null) => {
      usersUpdating.value = true
      try {
        const result = await authService.createUser(payload, token)

        // If backend returns the created user (common pattern), insert into local users.
        if (result && result.user) {
          users.value.unshift(result.user)
        } else if (result && Array.isArray(result.users)) {
          // some APIs return users list - merge
          users.value = result.users.concat(users.value)
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
  deleteUser,
  createUser
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