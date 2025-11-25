import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * useStaffs - reuse auth store users and expose only staff-role users mapped to frontend shape
 */
export function useStaffs() {
  // use the pinia auth store (useAuthStore is the correct exported store from stores/auth.js)
  const authStore = useAuthStore()

  const staffs = computed(() => {
    const users = authStore.users || []
    return users
      .filter(u => {
        const roleName = (u.Role?.role_name || '').toLowerCase()
        return roleName.includes('giáo') || roleName === 'staff' || String(u.role_id) === '3'
      })
      .map(u => ({
        id: u.user_id,
        name: u.Staff?.staff_name || u.user_fullname || u.user_code,
        code: u.user_code,
        email: u.user_email,
        role: u.Role?.role_name ? (
          (u.Role.role_name.toLowerCase().includes('sinh') && 'student') ||
          (u.Role.role_name.toLowerCase().includes('giảng') && 'teacher') ||
          (u.Role.role_name.toLowerCase().includes('giáo') && 'staff') ||
          (u.Role.role_name.toLowerCase().includes('quản') && 'admin') ||
          u.Role.role_name.toLowerCase()
        ) : (u.role_id || 'staff'),
        phone: u.user_phone || u.user_phone_number || '',
        department: u.department || 'CNTT',
        accountStatus: u.is_active ? 'active' : 'inactive',
        // Support various backend field namings (see DB: staff_birthdate / staff_gender)
        birthDate: u.Staff?.staff_birthdate || u.Staff?.birth_date || u.staff_birthdate || u.birth_date || u.user_birthdate || null,
        // Normalize gender values to 'male'|'female'|'other'
        gender: (() => {
          const raw = (u.Staff?.staff_gender || u.Staff?.gender || u.user_gender || u.gender || '').toString().toLowerCase()
          if (!raw) return null
          if (raw.includes('nam') || raw === 'male') return 'male'
          if (raw.includes('nữ') || raw.includes('nu') || raw === 'female') return 'female'
          return 'other'
        })(),
        avatar: u.user_avatar || null,
        raw: u
      }))
  })

  const fetchStaffs = (token) => authStore.fetchUsers(token)
  const updateUser = (userCode, payload, token) => authStore.updateUser(userCode, payload, token)
  const deleteUser = (userCode, token) => authStore.deleteUser(userCode, token)
  const createUser = (payload, token) => authStore.createUser(payload, token)

  return {
    staffs,
    fetchStaffs,
    updateUser,
    deleteUser,
    createUser,
    staffsLoading: authStore.usersLoading,
    staffsError: authStore.usersError,
    rawUsers: authStore.users
  }
}
