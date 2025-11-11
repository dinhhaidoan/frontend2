import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Role types
export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher', 
  STAFF: 'staff',
  ADMIN: 'admin'
}

// Role display names
export const ROLE_NAMES = {
  [ROLES.STUDENT]: '🧑‍🎓 Sinh viên',
  [ROLES.TEACHER]: '👨‍🏫 Giảng viên',
  [ROLES.STAFF]: '🧑‍💼 Giáo vụ khoa',
  [ROLES.ADMIN]: '👨‍💻 Admin'
}

// Global role verification state
const isRoleVerified = ref(false)
const verifiedRole = ref(null)

// Verify role with backend
const verifyRoleWithBackend = async () => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated()) {
    return null
  }
  
  try {
    // Call backend to verify current user's role
    const token = authStore.token
    if (token) {
      // You can call a dedicated endpoint to verify user role
      // For now, trust the stored user data but log it
      const currentRole = authStore.getUserRole()
      console.log('🔐 Role verification - Current role:', currentRole)
      console.log('🔐 Role verification - User data:', authStore.user)
      
      verifiedRole.value = currentRole
      isRoleVerified.value = true
      
      // If role doesn't match expected admin, log warning
      if (currentRole !== ROLES.ADMIN && authStore.user?.role_id === 4) {
        console.warn('⚠️ Role mismatch detected! Expected admin but got:', currentRole)
      }
      
      return currentRole
    }
  } catch (error) {
    console.error('❌ Role verification failed:', error)
  }
  
  return null
}

// Composable for user role management
export function useUserRole() {
  const authStore = useAuthStore()
  
  // Force load user from storage on init
  if (!authStore.isAuthenticated()) {
    authStore.loadUserFromStorage()
  }
  
  // Verify role on mount
  onMounted(async () => {
    await verifyRoleWithBackend()
  })
  
  // Get current role from auth store with fallback protection
  const getCurrentRole = () => {
    // If role is verified, use verified role
    if (isRoleVerified.value && verifiedRole.value) {
      return verifiedRole.value
    }
    
    const role = authStore.getUserRole()
    console.log('📋 Current role from auth store:', role)
    
    // If no role and not authenticated, default to student
    if (!role && !authStore.isAuthenticated()) {
      return ROLES.STUDENT
    }
    
    return role || ROLES.STUDENT
  }
  
  // Set current role (for demo switching purposes only)
  const setCurrentRole = (role) => {
    if (Object.values(ROLES).includes(role)) {
      // This would typically not be allowed in a real app
      // Role should be determined by the backend/authentication
      console.warn('⚠️ Role switching is for demo purposes only')
    }
  }
  
  // Check if user has specific role
  const hasRole = (role) => getCurrentRole() === role
  
  // Get role display name
  const getCurrentRoleName = computed(() => ROLE_NAMES[getCurrentRole()])
  
  // Current role reactive reference - watch for user changes
  const currentRole = computed(() => {
    const role = getCurrentRole()
    console.log('🎭 Computing current role:', role, 'Verified:', isRoleVerified.value)
    return role
  })
  
  // Check permissions
  const isStudent = computed(() => getCurrentRole() === ROLES.STUDENT)
  const isTeacher = computed(() => getCurrentRole() === ROLES.TEACHER)
  const isStaff = computed(() => getCurrentRole() === ROLES.STAFF)
  const isAdmin = computed(() => getCurrentRole() === ROLES.ADMIN)
  
  // Available roles for switching (for demo)
  const availableRoles = computed(() => 
    Object.entries(ROLE_NAMES).map(([key, name]) => ({
      key,
      name,
      active: key === getCurrentRole()
    }))
  )
  
  // Watch for user changes and re-verify role
  watch(
    () => authStore.user,
    async (newUser) => {
      console.log('👤 User changed in useUserRole:', newUser)
      if (newUser) {
        // Re-verify role when user changes
        await verifyRoleWithBackend()
      } else {
        // Clear verification when user is null
        isRoleVerified.value = false
        verifiedRole.value = null
      }
    },
    { deep: true, immediate: true }
  )
  
  return {
    currentRole,
    getCurrentRole,
    setCurrentRole,
    hasRole,
    getCurrentRoleName,
    isStudent,
    isTeacher,
    isStaff,
    isAdmin,
    availableRoles,
    isRoleVerified,
    verifyRoleWithBackend,
    ROLES,
    ROLE_NAMES
  }
}