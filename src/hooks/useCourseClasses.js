import { ref, computed } from 'vue'
import courseClassService from '@/services/courseClassService'
import { mapCourseClassList, mapCourseClass } from '@/types/courseClass'
import { useToast } from '@/composables/useToast'

export function useCourseClasses() {
  const toast = useToast()
  const items = ref([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(20)
  const lastPage = ref(1)
  const loading = ref(false)
  const error = ref(null)

  const fetchCourseClasses = async (opts = {}) => {
    loading.value = true
    error.value = null
    try {
      const p = opts.page || page.value || 1
      const l = opts.limit || limit.value || 20
      const q = opts.q || ''
      const status = opts.status || ''
      const res = await courseClassService.listCourseClasses({ page: p, limit: l, q, status })
      let rows = []
      if (Array.isArray(res)) rows = res
      else if (Array.isArray(res.items)) rows = res.items
      else if (Array.isArray(res.course_classes)) rows = res.course_classes
      else if (Array.isArray(res.courseClasses)) rows = res.courseClasses
      else if (res && res.data) {
        if (Array.isArray(res.data.items)) rows = res.data.items
        else if (Array.isArray(res.data.course_classes)) rows = res.data.course_classes
        else if (Array.isArray(res.data.courseClasses)) rows = res.data.courseClasses
      }
      items.value = mapCourseClassList(rows)
      total.value = res.total || (res.data && res.data.total) || items.value.length
      page.value = res.page || p
      limit.value = res.limit || l
      lastPage.value = res.lastPage || 1
      return items.value
    } catch (err) {
      console.error('useCourseClasses fetch error', err)
      error.value = err
      toast.error(err.message || 'Không thể tải danh sách lớp học')
      throw err
    } finally {
      loading.value = false
    }
  }

  const createCourseClass = async (payload) => {
    try {
      const res = await courseClassService.createCourseClass(payload)
      toast.success('Tạo lớp học thành công')
      await fetchCourseClasses({ page: page.value, limit: limit.value })
      const raw = res.course_class || res || null
      return raw ? mapCourseClass(raw) : res
    } catch (err) {
      console.error('useCourseClasses.createCourseClass error', err)
      toast.error(err.message || 'Tạo lớp học thất bại')
      throw err
    }
  }

  const updateCourseClass = async (id, payload) => {
    try {
      const res = await courseClassService.updateCourseClass(id, payload)
      toast.success('Cập nhật lớp học thành công')
      await fetchCourseClasses({ page: page.value, limit: limit.value })
      return res
    } catch (err) {
      console.error('useCourseClasses.updateCourseClass error', err)
      toast.error(err.message || 'Cập nhật lớp học thất bại')
      throw err
    }
  }

  const deleteCourseClass = async (id) => {
    try {
      const res = await courseClassService.deleteCourseClass(id)
      toast.success('Xóa lớp học thành công')
      await fetchCourseClasses({ page: page.value, limit: limit.value })
      return res
    } catch (err) {
      console.error('useCourseClasses.deleteCourseClass error', err)
      toast.error(err.message || 'Xóa lớp học thất bại')
      throw err
    }
  }

  const getCourseClass = async (id) => {
    try {
      const res = await courseClassService.getCourseClass(id)
      const raw = res.course_class || res || {}
      return mapCourseClass(raw)
    } catch (err) {
      console.error('useCourseClasses getCourseClass error', err)
      toast.error(err.message || 'Không thể lấy thông tin lớp học')
      throw err
    }
  }

  return {
    courseClasses: computed(() => items.value),
    total,
    page,
    limit,
    lastPage,
    loading,
    error,
    fetchCourseClasses,
    getCourseClass,
    createCourseClass,
    updateCourseClass,
    deleteCourseClass
  }
}
