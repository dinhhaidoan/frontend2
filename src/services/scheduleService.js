// scheduleService.js
// CRUD operations for /api/share/course-schedules

const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
let API_BASE_URL = String(_rawBase || '/api')
if (!API_BASE_URL.includes('/api')) API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api'

class ScheduleService {
  async listCourseSchedules({ page = 1, limit = 20, course_class_id = '', schedule_type = '', q = '', start_date = '', end_date = '' } = {}) {
    try {
      const url = new URL(`${API_BASE_URL}/share/course-schedules`, window.location.origin)
      url.searchParams.set('page', page)
      url.searchParams.set('limit', limit)
      if (course_class_id) url.searchParams.set('course_class_id', course_class_id)
      if (schedule_type) url.searchParams.set('schedule_type', schedule_type)
      if (start_date) url.searchParams.set('start_date', start_date)
      if (end_date) url.searchParams.set('end_date', end_date)
      if (q) url.searchParams.set('q', q)

      const res = await fetch(url.toString(), { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
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
      console.error('ScheduleService listCourseSchedules error:', err)
      throw err
    }
  }

  async getCourseSchedule(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/course-schedules/${encodeURIComponent(id)}`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
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
      console.error('ScheduleService getCourseSchedule error:', err)
      throw err
    }
  }

  async createCourseSchedule(payload = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/course-schedules`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
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
      console.error('ScheduleService createCourseSchedule error:', err)
      throw err
    }
  }

  async updateCourseSchedule(id, payload = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/course-schedules/${encodeURIComponent(id)}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
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
      console.error('ScheduleService updateCourseSchedule error:', err)
      throw err
    }
  }

  async deleteCourseSchedule(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/course-schedules/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
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
      console.error('ScheduleService deleteCourseSchedule error:', err)
      throw err
    }
  }
}

export default new ScheduleService()
