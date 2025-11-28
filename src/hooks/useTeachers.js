import { ref, computed } from 'vue'
import teacherService from '@/services/teacherService'
import { mapTeacherUser } from '@/types/teacher'
import { useToast } from '@/composables/useToast'

export function useTeachers() {
  const toast = useToast()
  const teachers = ref([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(20)
  const lastPage = ref(1)
  const loading = ref(false)
  const error = ref(null)

  // Lookup data
  const academicDegrees = ref([])
  const positions = ref([])

  const fetchAcademicDegrees = async () => {
    if (academicDegrees.value.length) return academicDegrees.value
    try {
      const res = await teacherService.listAcademicDegrees()
      academicDegrees.value = Array.isArray(res) ? res : (res.academic_degrees || res.degrees || [])
      return academicDegrees.value
    } catch (err) {
      console.error('Failed to fetch academic degrees', err)
      return []
    }
  }

  const fetchPositions = async () => {
    if (positions.value.length) return positions.value
    try {
      const res = await teacherService.listPositions()
      positions.value = Array.isArray(res) ? res : (res.positions || [])
      return positions.value
    } catch (err) {
      console.error('Failed to fetch positions', err)
      return []
    }
  }

  const fetchTeachers = async (opts = {}) => {
    loading.value = true
    error.value = null
    try {
      const p = opts.page || page.value || 1
      const l = opts.limit || limit.value || 20
      const q = opts.q || ''

      // Fetch lookup data first
      await Promise.all([fetchAcademicDegrees(), fetchPositions()])

      const res = await teacherService.listTeachers({ page: p, limit: l, q })
      // Debug logging to help diagnose empty list issues during development.
      // Use console.log to make output more visible in browser consoles.
      // eslint-disable-next-line no-console
      console.log('[useTeachers] listTeachers raw response:', res)
      // expected shape: { items, total, page, limit, lastPage } OR users OR raw array
      // Try a few common response shapes from our API or other backends
      // Supported shapes:
      // - Array[] (raw array)
      // - { items: [] }
      // - { users: [] }
      // - { data: { items: [] } }
      // - { data: { users: [] } }
      let rows = []
      if (Array.isArray(res)) rows = res
      else if (Array.isArray(res.items)) rows = res.items
      else if (Array.isArray(res.users)) rows = res.users
      else if (res && res.data) {
        if (Array.isArray(res.data.items)) rows = res.data.items
        else if (Array.isArray(res.data.users)) rows = res.data.users
      } else rows = []

      // Map backend user objects to UI-friendly teacher shape
      teachers.value = rows.map(r => {
        const t = mapTeacherUser(r)
        // Add UI-friendly / legacy fields used by TeacherTable
        return {
          id: t.id || t.userId || t.raw?.user_id || t.raw?.id || Date.now(),
          // preserve DB teacher_id if present
          teacher_id: t.teacher?.teacher_id || t.raw?.teacher_id || (t.raw && (t.raw.teacher_id || t.raw.id)) || null,
          teacherId: t.teacher?.teacher_id || t.raw?.teacher_id || (t.raw && (t.raw.teacher_id || t.raw.id)) || null,
          code: t.userId || t.raw?.user_code || '',
          name: t.name || '',
          email: t.email || '',
          phone: t.phone || '',
          avatar: t.avatar || null,
          avatar_public_id: t.avatar_public_id || null,
          // Flatten nested Teacher profile where possible
          // Prefer the human-friendly academic degree name when available
          academicRank: (() => {
            const degreeId = t.teacher?.academic_degree_id || t.teacher?.AcademicDegree?.id
            if (degreeId && academicDegrees.value.length) {
              const degree = academicDegrees.value.find(d => d.id == degreeId || d.academic_degree_id == degreeId)
              if (degree) return degree.academic_degree_name || degree.name
            }
            return (t.teacher && (t.teacher.AcademicDegree?.academic_degree_name || t.teacher.academic_degree_name || t.teacher.academic_rank)) || null
          })(),
          position: (() => {
            const positionId = t.teacher?.position_id
            if (positionId && positions.value.length) {
              const pos = positions.value.find(p => p.id == positionId || p.position_id == positionId)
              if (pos) return pos.position_name || pos.name
            }
            return (t.teacher && t.teacher.position_name) || null
          })(),
            // personal fields
            dateOfBirth: t.teacher?.teacher_birthdate || t.raw?.user_birthdate || t.raw?.dateOfBirth || null,
            gender: t.teacher?.teacher_gender || t.raw?.gender || null,
            // created/join date: prefer profile-level teacher_days_of_joining
            createdAt: t.teacher?.teacher_days_of_joining || t.raw?.created_at || t.raw?.createdAt || null,
            // preserve explicit active flag if provided (profile-level) and normalize to boolean
            active: (t.teacher && (t.teacher.teacher_active !== undefined ? !!t.teacher.teacher_active : undefined)) || (t.raw && (t.raw.is_active !== undefined ? !!t.raw.is_active : (t.raw.user_active !== undefined ? !!t.raw.user_active : undefined))) || undefined,
            // department: don't force default (previous code forced CNTT elsewhere)
            department: t.raw?.department || t.teacher?.department || null,
            specialization: (() => {
              const degreeId = t.teacher?.academic_degree_id || t.teacher?.AcademicDegree?.id
              if (degreeId && academicDegrees.value.length) {
                const degree = academicDegrees.value.find(d => d.id == degreeId || d.academic_degree_id == degreeId)
                if (degree) return degree.academic_degree_name || degree.name
              }
              const positionId = t.teacher?.position_id
              if (positionId && positions.value.length) {
                const pos = positions.value.find(p => p.id == positionId || p.position_id == positionId)
                if (pos) return pos.position_name || pos.name
              }
              return (t.teacher && (t.teacher.academic_degree_name || t.teacher.position_name || t.teacher.academic_rank || t.teacher.position_id)) || null
            })(),
          // status mapping: prefer explicit active/disabled flags if provided
          status: (typeof (t.teacher?.teacher_active) !== 'undefined' ? (t.teacher.teacher_active ? 'active' : 'inactive') : (typeof t.raw?.is_active !== 'undefined' ? (t.raw.is_active ? 'active' : 'inactive') : (t.raw?.status || 'active'))),
          // counts default to 0
          subjectCount: t.raw?.subjectCount || 0,
          classCount: t.raw?.classCount || 0,
          studentCount: t.raw?.studentCount || 0,
          teachingHours: t.raw?.teachingHours || 0,
          // preserve original raw for advanced UI actions
          raw: t.raw
        }
      })
      // Debug: how many rows mapped
      // eslint-disable-next-line no-console
      console.log(`[useTeachers] extracted rows: ${rows.length}, mapped teachers: ${teachers.value.length}`)
      // Support total located at top-level or under data
      total.value = res.total || (res.data && res.data.total) || 0
      page.value = res.page || p
      limit.value = res.limit || l
      lastPage.value = res.lastPage || 1
      return teachers.value
    } catch (err) {
      console.error('useTeachers fetch error', err)
      error.value = err
      toast.error(err.message || 'Không thể tải danh sách giảng viên')
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTeacher = async (userCode) => {
    try {
      return await teacherService.getTeacher(userCode)
    } catch (err) {
      console.error('useTeachers getTeacher error', err)
      toast.error(err.message || 'Không thể lấy thông tin giảng viên')
      throw err
    }
  }

  const createTeacher = async (payload) => {
    try {
      const res = await teacherService.createTeacher(payload)
      toast.success('Tạo giảng viên thành công')
      return res
    } catch (err) {
      console.error('useTeachers createTeacher error', err)
      toast.error(err.message || 'Tạo giảng viên thất bại')
      throw err
    }
  }

  const updateTeacher = async (userCode, payload) => {
    try {
      const res = await teacherService.updateTeacher(userCode, payload)
      toast.success('Cập nhật giảng viên thành công')
      return res
    } catch (err) {
      console.error('useTeachers updateTeacher error', err)
      toast.error(err.message || 'Cập nhật giảng viên thất bại')
      throw err
    }
  }

  const deleteTeacher = async (userCode) => {
    try {
      const res = await teacherService.deleteTeacher(userCode)
      toast.success('Xóa giảng viên thành công')
      return res
    } catch (err) {
      console.error('useTeachers deleteTeacher error', err)
      toast.error(err.message || 'Xóa giảng viên thất bại')
      throw err
    }
  }

  const uploadAvatar = async (userCode, file) => {
    try {
      return await teacherService.uploadAvatar(userCode, file)
    } catch (err) {
      console.error('useTeachers uploadAvatar error', err)
      toast.error(err.message || 'Upload avatar thất bại')
      throw err
    }
  }

  return {
    teachers: computed(() => teachers.value),
    total,
    page,
    limit,
    lastPage,
    loading,
    error,
    fetchTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    uploadAvatar
  }
}
