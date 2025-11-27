import { ref, computed } from 'vue'
import semesterService from '@/services/semesterService'
import { mapSemester, mapSemestersList } from '@/types/semester'
import { getSemesterStatus } from '@/utils/formatters'
import { useToast } from '@/composables/useToast'

export function useSemesters() {
  const toast = useToast()
  const semesters = ref([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(20)
  const lastPage = ref(1)
  const loading = ref(false)
  const error = ref(null)

  const fetchSemesters = async (opts = {}) => {
    loading.value = true
    error.value = null
    try {
      const p = opts.page || page.value || 1
      const l = opts.limit || limit.value || 20
      const q = opts.q || ''
      const res = await semesterService.listSemesters({ page: p, limit: l, q })
      let rows = []
      if (Array.isArray(res)) rows = res
      else if (Array.isArray(res.items)) rows = res.items
      else if (Array.isArray(res.semesters)) rows = res.semesters
      else if (res && res.data) {
        if (Array.isArray(res.data.items)) rows = res.data.items
        else if (Array.isArray(res.data.semesters)) rows = res.data.semesters
      }
      semesters.value = mapSemestersList(rows)
      // compute UI status from start/end dates (client-side)
      semesters.value = semesters.value.map(s => ({ ...s, status: getSemesterStatus(s.startDate, s.endDate) }))
      total.value = res.total || (res.data && res.data.total) || semesters.value.length
      page.value = res.page || p
      limit.value = res.limit || l
      lastPage.value = res.lastPage || 1
      return semesters.value
    } catch (err) {
      console.error('useSemesters fetch error', err)
      error.value = err
      toast.error(err.message || 'Không thể tải danh sách Học kỳ')
      throw err
    } finally {
      loading.value = false
    }
  }

  const getSemester = async (id) => {
    try {
      const res = await semesterService.getSemester(id)
      const raw = res.semester || res || {}
      const mapped = mapSemester(raw)
      mapped.status = getSemesterStatus(mapped.startDate, mapped.endDate)
      return mapped
    } catch (err) {
      console.error('useSemesters getSemester error', err)
      toast.error(err.message || 'Không thể lấy thông tin Học kỳ')
      throw err
    }
  }

  const createSemester = async (payload) => {
    try {
      const res = await semesterService.createSemester(payload)
      toast.success('Tạo Học kỳ thành công')
      await fetchSemesters({ page: page.value, limit: limit.value })
      const raw = res.semester || res || null
      if (raw) {
        const mapped = mapSemester(raw)
        mapped.status = getSemesterStatus(mapped.startDate, mapped.endDate)
        return mapped
      }
      return res
    } catch (err) {
      console.error('useSemesters createSemester error', err)
      toast.error(err.message || 'Tạo Học kỳ thất bại')
      throw err
    }
  }

  const updateSemester = async (id, payload) => {
    try {
      const res = await semesterService.updateSemester(id, payload)
      toast.success('Cập nhật Học kỳ thành công')
      await fetchSemesters({ page: page.value, limit: limit.value })
      return res
    } catch (err) {
      console.error('useSemesters updateSemester error', err)
      toast.error(err.message || 'Cập nhật Học kỳ thất bại')
      throw err
    }
  }

  const deleteSemester = async (id) => {
    try {
      const res = await semesterService.deleteSemester(id)
      toast.success('Xóa Học kỳ thành công')
      await fetchSemesters({ page: page.value, limit: limit.value })
      return res
    } catch (err) {
      console.error('useSemesters deleteSemester error', err)
      toast.error(err.message || 'Xóa Học kỳ thất bại')
      throw err
    }
  }

  return {
    semesters: computed(() => semesters.value),
    total,
    page,
    limit,
    lastPage,
    loading,
    error,
    fetchSemesters,
    getSemester,
    createSemester,
    updateSemester,
    deleteSemester
  }
}
