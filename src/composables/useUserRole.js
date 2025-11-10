import { ref, computed } from 'vue'

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

// Current user role (for demo purposes, starts with admin to test admin features)
const currentRole = ref(ROLES.STAFF)

// Composable for user role management
export function useUserRole() {
  
  // Get current role
  const getCurrentRole = () => currentRole.value
  
  // Set current role
  const setCurrentRole = (role) => {
    if (Object.values(ROLES).includes(role)) {
      currentRole.value = role
    }
  }
  
  // Check if user has specific role
  const hasRole = (role) => currentRole.value === role
  
  // Get role display name
  const getCurrentRoleName = computed(() => ROLE_NAMES[currentRole.value])
  
  // Check permissions
  const isStudent = computed(() => currentRole.value === ROLES.STUDENT)
  const isTeacher = computed(() => currentRole.value === ROLES.TEACHER)
  const isStaff = computed(() => currentRole.value === ROLES.STAFF)
  const isAdmin = computed(() => currentRole.value === ROLES.ADMIN)
  
  // Available roles for switching (for demo)
  const availableRoles = computed(() => 
    Object.entries(ROLE_NAMES).map(([key, name]) => ({
      key,
      name,
      active: key === currentRole.value
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