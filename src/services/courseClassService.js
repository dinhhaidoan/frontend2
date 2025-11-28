// courseClassService.js
// CRUD operations for /api/share/course-classes

const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
let API_BASE_URL = String(_rawBase || '/api')
if (!API_BASE_URL.includes('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api'
}

class CourseClassService {
  async listCourseClasses({ page = 1, limit = 20, q = '', status = '' } = {}) {
    try {
      const url = new URL(`${API_BASE_URL}/share/course-classes`, window.location.origin)
      url.searchParams.set('page', page)
      url.searchParams.set('limit', limit)
      if (q) url.searchParams.set('q', q)
      if (status) url.searchParams.set('status', status)
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
      console.error('CourseClassService listCourseClasses error:', err)
      throw err
    }
  }

  async getCourseClass(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/course-classes/${encodeURIComponent(id)}`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
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
      console.error('CourseClassService getCourseClass error:', err)
      throw err
    }
  }

  async createCourseClass(payload = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/course-classes`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let json = null
        try { json = JSON.parse(text || '{}') } catch (e) { json = null }
        const msg = (json && (json.message || json.error)) || text || `HTTP ${res.status}`
        const err = new Error(msg)
        err.status = res.status
        err.details = (json && (json.errors || json)) || text
        throw err
      }
      return await res.json()
    } catch (err) {
      console.error('CourseClassService createCourseClass error:', err)
      throw err
    }
  }

  async updateCourseClass(id, payload = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/course-classes/${encodeURIComponent(id)}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let json = null
        try { json = JSON.parse(text || '{}') } catch (e) { json = null }
        const msg = (json && (json.message || json.error)) || text || `HTTP ${res.status}`
        const err = new Error(msg)
        err.status = res.status
        err.details = (json && (json.errors || json)) || text
        throw err
      }
      return await res.json()
    } catch (err) {
      console.error('CourseClassService updateCourseClass error:', err)
      throw err
    }
  }

  async deleteCourseClass(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/course-classes/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let json = null
        try { json = JSON.parse(text || '{}') } catch (e) { json = null }
        const msg = (json && (json.message || json.error)) || text || `HTTP ${res.status}`
        const err = new Error(msg)
        err.status = res.status
        err.details = (json && (json.errors || json)) || text
        throw err
      }
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) return await res.json()
      return { success: true }
    } catch (err) {
      console.error('CourseClassService deleteCourseClass error:', err)
      throw err
    }
  }
}

export default new CourseClassService()
