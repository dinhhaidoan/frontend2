import { ref, computed } from 'vue'
import academicYearService from '@/services/academicYearService'
import { mapAcademicYear, mapAcademicYearsList } from '@/types/academicYear'
import { useToast } from '@/composables/useToast'

export function useAcademicYears() {
	const toast = useToast()
	const academicYears = ref([])
	const total = ref(0)
	const page = ref(1)
	const limit = ref(20)
	const lastPage = ref(1)
	const loading = ref(false)
	const error = ref(null)

	const fetchAcademicYears = async (opts = {}) => {
		loading.value = true
		error.value = null
		try {
			const p = opts.page || page.value || 1
			const l = opts.limit || limit.value || 20
			const q = opts.q || ''
			const res = await academicYearService.listAcademicYears({ page: p, limit: l, q })
			let rows = []
			if (Array.isArray(res)) rows = res
			else if (Array.isArray(res.items)) rows = res.items
			else if (Array.isArray(res.academic_years)) rows = res.academic_years
			else if (res && res.data) {
				if (Array.isArray(res.data.items)) rows = res.data.items
				else if (Array.isArray(res.data.academic_years)) rows = res.data.academic_years
			}
			academicYears.value = mapAcademicYearsList(rows)
			total.value = res.total || (res.data && res.data.total) || academicYears.value.length
			page.value = res.page || p
			limit.value = res.limit || l
			lastPage.value = res.lastPage || 1
			return academicYears.value
		} catch (err) {
			console.error('useAcademicYears fetch error', err)
			error.value = err
			toast.error(err.message || 'Không thể tải danh sách Khóa học')
			throw err
		} finally {
			loading.value = false
		}
	}

	const getAcademicYear = async (id) => {
		try {
			const res = await academicYearService.getAcademicYear(id)
			// API might return { academic_year: {...} } or the object directly
			const raw = res.academic_year || res || {}
			return mapAcademicYear(raw)
		} catch (err) {
			console.error('useAcademicYears getAcademicYear error', err)
			toast.error(err.message || 'Không thể lấy thông tin Khóa học')
			throw err
		}
	}

	const createAcademicYear = async (payload) => {
		try {
			const res = await academicYearService.createAcademicYear(payload)
			toast.success('Tạo Khóa học thành công')
			// If server returns created object under academic_year or academic_years
			const raw = res.academic_year || res || null
			// Refresh list
			await fetchAcademicYears({ page: page.value, limit: limit.value })
			return raw ? mapAcademicYear(raw) : res
		} catch (err) {
			console.error('useAcademicYears createAcademicYear error', err)
			toast.error(err.message || 'Tạo Khóa học thất bại')
			throw err
		}
	}

	const updateAcademicYear = async (id, payload) => {
		try {
			const res = await academicYearService.updateAcademicYear(id, payload)
			toast.success('Cập nhật Khóa học thành công')
			await fetchAcademicYears({ page: page.value, limit: limit.value })
			return res
		} catch (err) {
			console.error('useAcademicYears updateAcademicYear error', err)
			toast.error(err.message || 'Cập nhật Khóa học thất bại')
			throw err
		}
	}

	const deleteAcademicYear = async (id) => {
		try {
			const res = await academicYearService.deleteAcademicYear(id)
			toast.success('Xóa Khóa học thành công')
			await fetchAcademicYears({ page: page.value, limit: limit.value })
			return res
		} catch (err) {
			console.error('useAcademicYears deleteAcademicYear error', err)
			// if server returns message about dependent students/classes, show appropriate toast
			toast.error(err.message || 'Xóa Khóa học thất bại')
			throw err
		}
	}

	return {
		academicYears: computed(() => academicYears.value),
		total,
		page,
		limit,
		lastPage,
		loading,
		error,
		fetchAcademicYears,
		getAcademicYear,
		createAcademicYear,
		updateAcademicYear,
		deleteAcademicYear
	}
}
