import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * Hook to work with users (wraps auth store users actions)
 * Returns:
 * - accounts: computed array mapped to the frontend account shape
 * - fetchUsers(token): call to fetch users from backend
 * - updateUser(userId, payload, token): wrapper to update user
 * - usersLoading, usersError: reactive flags from store
 */
export function useUsers() {
  const authStore = useAuthStore()

  const accounts = computed(() => {
    const users = authStore.users || []
    return users.map(u => ({
      id: u.user_id,
      name: u.Teacher?.teacher_name || u.Staff?.staff_name || u.Admin?.admin_name || u.Student?.student_name || u.user_code,
      userId: u.user_code,
      email: u.user_email,
      role: u.Role?.role_name ? (
        (u.Role.role_name.toLowerCase().includes('sinh') && 'student') ||
        (u.Role.role_name.toLowerCase().includes('giảng') && 'teacher') ||
        (u.Role.role_name.toLowerCase().includes('giáo') && 'staff') ||
        (u.Role.role_name.toLowerCase().includes('quản') && 'admin') ||
        u.Role.role_name.toLowerCase()
      ) : (u.role_id || 'student'),
      phone: u.user_phone || u.user_phone_number || '',
      department: u.department || 'CNTT',
      status: u.is_active ? 'active' : 'inactive',
      lastLogin: u.last_login || null,
      avatar: u.user_avatar || null,
      raw: u
    }))
  })

  const fetchUsers = (token) => authStore.fetchUsers(token)
  const updateUser = (userCode, payload, token) => authStore.updateUser(userCode, payload, token)
  const deleteUser = (userCode, token) => authStore.deleteUser(userCode, token)

  return {
    accounts,
    fetchUsers,
    updateUser,
    deleteUser,
    usersLoading: authStore.usersLoading,
    usersUpdating: authStore.usersUpdating,
    usersError: authStore.usersError,
    users: authStore.users
  }
}
