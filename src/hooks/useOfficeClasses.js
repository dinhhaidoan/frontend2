import { ref, computed } from 'vue'
import officeClassService from '@/services/officeClassService'
import { toApiOfficeClass } from '@/types/officeClass'
import { mapOfficeClass, mapOfficeClassList } from '@/types/officeClass'
import { useToast } from '@/composables/useToast'

export function useOfficeClasses() {
  const toast = useToast()
  const officeClasses = ref([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(20)
  const lastPage = ref(1)
  const loading = ref(false)
  const error = ref(null)

  const fetchOfficeClasses = async (opts = {}) => {
    loading.value = true
    error.value = null
    try {
      const p = opts.page || page.value || 1
      const l = opts.limit || limit.value || 20
      const q = opts.q || ''
      const res = await officeClassService.listOfficeClasses({ page: p, limit: l, q })
      let rows = []
      if (Array.isArray(res)) rows = res
      else if (Array.isArray(res.items)) rows = res.items
      else if (Array.isArray(res.office_classes)) rows = res.office_classes
      else if (res && res.data) {
        if (Array.isArray(res.data.items)) rows = res.data.items
        else if (Array.isArray(res.data.office_classes)) rows = res.data.office_classes
      }
      officeClasses.value = mapOfficeClassList(rows)
      total.value = res.total || (res.data && res.data.total) || officeClasses.value.length
      page.value = res.page || p
      limit.value = res.limit || l
      lastPage.value = res.lastPage || 1
      return officeClasses.value
    } catch (err) {
      console.error('useOfficeClasses fetch error', err)
      error.value = err
      const msg = (err && (err.message || (err.error && err.error.message) || JSON.stringify(err))) || ''
      // If the server indicates a missing Major link, handle gracefully by returning an empty list
      if (msg.includes('Major is not associated to OfficeClass') || msg.includes('Major is not associated') || msg.includes('major_id not found') || msg.includes('major_id')) {
        toast.error('Không thể tải danh sách lớp vì Major chưa được liên kết. Vui lòng kiểm tra dữ liệu.')
        officeClasses.value = []
        total.value = 0
        return officeClasses.value
      }
      error.value = err
      toast.error(err.message || 'Không thể tải danh sách lớp')
      throw err
    } finally {
      loading.value = false
    }
  }

  const getOfficeClass = async (id) => {
    try {
      const res = await officeClassService.getOfficeClass(id)
      const raw = res.office_class || res || {}
      return mapOfficeClass(raw)
    } catch (err) {
      console.error('useOfficeClasses getOfficeClass error', err)
      toast.error(err.message || 'Không thể lấy thông tin lớp')
      throw err
    }
  }

  const createOfficeClass = async (payload) => {
    try {
      const apiPayload = toApiOfficeClass(payload)
      const res = await officeClassService.createOfficeClass(apiPayload)
      toast.success('Tạo lớp thành công')
      await fetchOfficeClasses({ page: page.value, limit: limit.value })
      const raw = res.office_class || res || null
      return raw ? mapOfficeClass(raw) : res
    } catch (err) {
      console.error('useOfficeClasses createOfficeClass error', err)
      toast.error(err.message || 'Tạo lớp thất bại')
      throw err
    }
  }

  const updateOfficeClass = async (id, payload) => {
    try {
      const apiPayload = toApiOfficeClass(payload)
      const res = await officeClassService.updateOfficeClass(id, apiPayload)
      toast.success('Cập nhật lớp thành công')
      await fetchOfficeClasses({ page: page.value, limit: limit.value })
      return res
    } catch (err) {
      console.error('useOfficeClasses updateOfficeClass error', err)
      toast.error(err.message || 'Cập nhật lớp thất bại')
      throw err
    }
  }

  const deleteOfficeClass = async (id) => {
    try {
      const res = await officeClassService.deleteOfficeClass(id)
      toast.success('Xóa lớp thành công')
      await fetchOfficeClasses({ page: page.value, limit: limit.value })
      return res
    } catch (err) {
      console.error('useOfficeClasses deleteOfficeClass error', err)
      toast.error(err.message || 'Xóa lớp thất bại')
      throw err
    }
  }

  return {
    officeClasses: computed(() => officeClasses.value),
    total,
    page,
    limit,
    lastPage,
    loading,
    error,
    fetchOfficeClasses,
    getOfficeClass,
    createOfficeClass,
    updateOfficeClass,
    deleteOfficeClass
  }
}
