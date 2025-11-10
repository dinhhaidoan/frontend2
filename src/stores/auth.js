import { defineStore } from 'pinia'
import { useAuth } from '@/hooks/useAuth'

export const useAuthStore = defineStore('auth', () => {
  try {
    const authHook = useAuth()
    return {
      // Expose hook methods and state
      ...authHook
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
      getDashboardRoute: () => '/login'
    }
  }
})