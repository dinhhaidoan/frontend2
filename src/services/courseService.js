// Course service
// CRUD operations for /api/share/courses

const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
let API_BASE_URL = String(_rawBase || '/api')
if (!API_BASE_URL.includes('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api'
}

class CourseService {
  async listCourses({ page = 1, limit = 20, q = '' } = {}) {
    try {
      const url = new URL(`${API_BASE_URL}/share/courses`, window.location.origin)
      url.searchParams.set('page', page)
      url.searchParams.set('limit', limit)
      if (q) url.searchParams.set('q', q)
      const res = await fetch(url.toString(), { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let json = null
        try { json = JSON.parse(text || '{}') } catch (e) { json = null }
        const msg = (json && (json.message || json.error)) || text || `HTTP ${res.status}`
        const err = new Error(msg)
        err.details = (json && (json.errors || json)) || text
        throw err
      }
      return await res.json()
    } catch (err) {
      console.error('CourseService listCourses error:', err)
      throw err
    }
  }

  async getCourse(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/courses/${encodeURIComponent(id)}`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let json = null
        try { json = JSON.parse(text || '{}') } catch (e) { json = null }
        const msg = (json && (json.message || json.error)) || text || `HTTP ${res.status}`
        const err = new Error(msg)
        err.details = (json && (json.errors || json)) || text
        throw err
      }
      return await res.json()
    } catch (err) {
      console.error('CourseService getCourse error:', err)
      throw err
    }
  }

  async createCourse(payload = {}) {
    try {
      console.debug('CourseService.createCourse payload:', payload)
      const res = await fetch(`${API_BASE_URL}/share/courses`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.debug('CourseService.createCourse response text:', text)
        let json = null
        try { json = JSON.parse(text || '{}') } catch (e) { json = null }
        const msg = (json && (json.message || json.error)) || text || `HTTP ${res.status}`
        const err = new Error(msg)
        err.details = (json && (json.errors || json)) || text
        throw err
      }
      return await res.json()
    } catch (err) {
      console.error('CourseService createCourse error:', err)
      throw err
    }
  }

  async updateCourse(id, payload = {}) {
    try {
      console.debug('CourseService.updateCourse payload:', id, payload)
      const res = await fetch(`${API_BASE_URL}/share/courses/${encodeURIComponent(id)}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.debug('CourseService.updateCourse response text:', text)
        let json = null
        try { json = JSON.parse(text || '{}') } catch (e) { json = null }
        const msg = (json && (json.message || json.error)) || text || `HTTP ${res.status}`
        const err = new Error(msg)
        err.details = (json && (json.errors || json)) || text
        throw err
      }
      return await res.json()
    } catch (err) {
      console.error('CourseService updateCourse error:', err)
      throw err
    }
  }

  async deleteCourse(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/courses/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        try { const json = JSON.parse(text || '{}'); throw new Error(json.message || json.error || `HTTP ${res.status}`) } catch (e) { throw new Error(text || `HTTP ${res.status}`) }
      }
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) return await res.json()
      return { success: true }
    } catch (err) {
      console.error('CourseService deleteCourse error:', err)
      throw err
    }
  }
}

export default new CourseService()