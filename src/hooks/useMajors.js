import { ref, computed } from 'vue'
import authService from '@/services/authService'
import { useToast } from '@/composables/useToast'

export function useMajors() {
  const toast = useToast()
  const majors = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchMajors = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await authService.listMajors()
      let rows = []
      if (Array.isArray(res)) rows = res
      else if (Array.isArray(res.items)) rows = res.items
      else if (res && res.data && Array.isArray(res.data.items)) rows = res.data.items
      majors.value = rows
      return majors.value
    } catch (err) {
      console.error('useMajors fetch error', err)
      error.value = err
      toast.error(err.message || 'Không thể tải danh sách ngành')
      // Gracefully return an empty list so callers can continue
      majors.value = []
      return majors.value
    } finally {
      loading.value = false
    }
  }

  return {
    majors: computed(() => majors.value),
    loading,
    error,
    fetchMajors
  }
}
