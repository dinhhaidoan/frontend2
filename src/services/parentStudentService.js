// Minimal ParentStudent service for creating a parent record for a student
const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
let API_BASE_URL = String(_rawBase || '/api')
if (!API_BASE_URL.includes('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api'
}

class ParentStudentService {
  async createParent(studentId, payload = {}) {
    try {
      const url = `${API_BASE_URL}/share/parents`
      // Ensure we include student_id in payload
      const body = { student_id: Number(studentId), ...payload }
      const res = await fetch(url, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        try { const json = JSON.parse(text || '{}'); const msg = json.message || json.error || `HTTP ${res.status}`; const e = new Error(msg); e.details = json.errors || json; throw e } catch (e) { throw new Error(text || `HTTP ${res.status}`) }
      }
      return await res.json()
    } catch (err) {
      console.error('ParentStudentService.createParent error:', err)
      throw err
    }
  }
}

export default new ParentStudentService()
