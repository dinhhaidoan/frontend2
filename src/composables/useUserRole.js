import { ref, computed } from 'vue'
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

// Composable for user role management
export function useUserRole() {
  const authStore = useAuthStore()
  
  // Get current role from auth store
  const getCurrentRole = () => authStore.getUserRole() || ROLES.STUDENT
  
  // Set current role (for demo switching purposes only)
  const setCurrentRole = (role) => {
    if (Object.values(ROLES).includes(role)) {
      // This would typically not be allowed in a real app
      // Role should be determined by the backend/authentication
      console.warn('Role switching is for demo purposes only')
    }
  }
  
  // Check if user has specific role
  const hasRole = (role) => getCurrentRole() === role
  
  // Get role display name
  const getCurrentRoleName = computed(() => ROLE_NAMES[getCurrentRole()])
  
  // Current role reactive reference
  const currentRole = computed(() => getCurrentRole())
  
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
    ROLES,
    ROLE_NAMES
  }
}