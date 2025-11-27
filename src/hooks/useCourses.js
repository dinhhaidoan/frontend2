import { ref, computed } from 'vue'
import courseService from '@/services/courseService'
import { toApiCourse } from '@/types/course'
import { mapCourse, mapCourseList } from '@/types/course'
import { useToast } from '@/composables/useToast'

export function useCourses() {
  const toast = useToast()
  const courses = ref([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(20)
  const lastPage = ref(1)
  const loading = ref(false)
  const error = ref(null)

  const fetchCourses = async (opts = {}) => {
    loading.value = true
    error.value = null
    try {
      const p = opts.page || page.value || 1
      const l = opts.limit || limit.value || 20
      const q = opts.q || ''
      const res = await courseService.listCourses({ page: p, limit: l, q })
      let rows = []
      if (Array.isArray(res)) rows = res
      else if (Array.isArray(res.items)) rows = res.items
      else if (Array.isArray(res.courses)) rows = res.courses
      else if (res && res.data) {
        if (Array.isArray(res.data.items)) rows = res.data.items
        else if (Array.isArray(res.data.courses)) rows = res.data.courses
      }
      courses.value = mapCourseList(rows)
      total.value = res.total || (res.data && res.data.total) || courses.value.length
      page.value = res.page || p
      limit.value = res.limit || l
      lastPage.value = res.lastPage || 1
      return courses.value
    } catch (err) {
      console.error('useCourses fetch error', err)
      error.value = err
      const msg = (err && (err.message || (err.error && err.error.message) || JSON.stringify(err))) || ''
      // Handle specific errors if needed
      toast.error(err.message || 'Không thể tải danh sách môn học')
      throw err
    } finally {
      loading.value = false
    }
  }

  const getCourse = async (id) => {
    try {
      const res = await courseService.getCourse(id)
      const raw = res.course || res || {}
      return mapCourse(raw)
    } catch (err) {
      console.error('useCourses getCourse error', err)
      toast.error(err.message || 'Không thể lấy thông tin môn học')
      throw err
    }
  }

  const createCourse = async (payload) => {
    try {
      const apiPayload = toApiCourse(payload)
      console.debug('useCourses.createCourse apiPayload', apiPayload)
      const res = await courseService.createCourse(apiPayload)
      toast.success('Tạo môn học thành công')
      await fetchCourses({ page: page.value, limit: limit.value })
      const raw = res.course || res || null
      return raw ? mapCourse(raw) : res
    } catch (err) {
      console.error('useCourses createCourse error', err)
      toast.error(err.message || 'Tạo môn học thất bại')
      throw err
    }
  }

  const updateCourse = async (id, payload) => {
    try {
      const apiPayload = toApiCourse(payload)
      const res = await courseService.updateCourse(id, apiPayload)
      toast.success('Cập nhật môn học thành công')
      await fetchCourses({ page: page.value, limit: limit.value })
      return res
    } catch (err) {
      console.error('useCourses updateCourse error', err)
      toast.error(err.message || 'Cập nhật môn học thất bại')
      throw err
    }
  }

  const deleteCourse = async (id) => {
    try {
      const res = await courseService.deleteCourse(id)
      toast.success('Xóa môn học thành công')
      await fetchCourses({ page: page.value, limit: limit.value })
      return res
    } catch (err) {
      console.error('useCourses deleteCourse error', err)
      toast.error(err.message || 'Xóa môn học thất bại')
      throw err
    }
  }

  return {
    courses: computed(() => courses.value),
    total,
    page,
    limit,
    lastPage,
    loading,
    error,
    fetchCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
  }
}