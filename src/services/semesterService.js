// Semester service
// Provides CRUD operations for semesters using the backend API

const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
let API_BASE_URL = String(_rawBase || '/api')
if (!API_BASE_URL.includes('/api')) {
	API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api'
}

class SemesterService {
	async listSemesters({ page = 1, limit = 20, q = '' } = {}) {
		try {
			const url = new URL(`${API_BASE_URL}/share/semesters`, window.location.origin)
			url.searchParams.set('page', page)
			url.searchParams.set('limit', limit)
			if (q) url.searchParams.set('q', q)
			const response = await fetch(url.toString(), {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			})
			if (!response.ok) {
				const text = await response.text().catch(() => '')
				try {
					const json = JSON.parse(text || '{}')
					const msg = json.message || json.error || `HTTP ${response.status}`
					const e = new Error(msg)
					e.details = json.errors || json
					throw e
				} catch (e) {
					throw new Error(text || `HTTP ${response.status}`)
				}
			}
			return await response.json()
		} catch (err) {
			console.error('SemesterService listSemesters error:', err)
			throw err
		}
	}

	async getSemester(id) {
		try {
			const response = await fetch(`${API_BASE_URL}/share/semesters/${id}`, {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			})
			if (!response.ok) {
				const text = await response.text().catch(() => '')
				try {
					const json = JSON.parse(text || '{}')
					const msg = json.message || json.error || `HTTP ${response.status}`
					const e = new Error(msg)
					e.details = json.errors || json
					throw e
				} catch (e) {
					throw new Error(text || `HTTP ${response.status}`)
				}
			}
			return await response.json()
		} catch (err) {
			console.error('SemesterService getSemester error:', err)
			throw err
		}
	}

	async createSemester(payload = {}) {
		try {
			const response = await fetch(`${API_BASE_URL}/share/semesters`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
			if (!response.ok) {
				const text = await response.text().catch(() => '')
				try {
					const json = JSON.parse(text || '{}')
					const msg = json.message || json.error || `HTTP ${response.status}`
					const e = new Error(msg)
					e.details = json.errors || json
					throw e
				} catch (e) {
					throw new Error(text || `HTTP ${response.status}`)
				}
			}
			return await response.json()
		} catch (err) {
			console.error('SemesterService createSemester error:', err)
			throw err
		}
	}

	async updateSemester(id, payload = {}) {
		try {
			const response = await fetch(`${API_BASE_URL}/share/semesters/${id}`, {
				method: 'PATCH',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
			if (!response.ok) {
				const text = await response.text().catch(() => '')
				try {
					const json = JSON.parse(text || '{}')
					const msg = json.message || json.error || `HTTP ${response.status}`
					const e = new Error(msg)
					e.details = json.errors || json
					throw e
				} catch (e) {
					throw new Error(text || `HTTP ${response.status}`)
				}
			}
			return await response.json()
		} catch (err) {
			console.error('SemesterService updateSemester error:', err)
			throw err
		}
	}

	async deleteSemester(id) {
		try {
			const response = await fetch(`${API_BASE_URL}/share/semesters/${id}`, {
				method: 'DELETE',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			})
			if (!response.ok) {
				const text = await response.text().catch(() => '')
				try { const json = JSON.parse(text || '{}'); throw new Error(json.message || json.error || `HTTP ${response.status}`) } catch (e) { throw new Error(text || `HTTP ${response.status}`) }
			}
			const contentType = response.headers.get('content-type')
			if (contentType && contentType.includes('application/json')) return await response.json()
			return { success: true }
		} catch (err) {
			console.error('SemesterService deleteSemester error:', err)
			throw err
		}
	}
}

export default new SemesterService()
