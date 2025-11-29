// OfficeClass service
// CRUD operations for /api/share/office-classes

const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
let API_BASE_URL = String(_rawBase || '/api')
if (!API_BASE_URL.includes('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api'
}

class OfficeClassService {
  async listOfficeClasses({ page = 1, limit = 20, q = '', teacher_code = '' } = {}) {
    try {
      const url = new URL(`${API_BASE_URL}/share/office-classes`, window.location.origin)
      url.searchParams.set('page', page)
      url.searchParams.set('limit', limit)
      if (q) url.searchParams.set('q', q)
      if (teacher_code) url.searchParams.set('teacher_code', teacher_code)
      const res = await fetch(url.toString(), { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        try { const json = JSON.parse(text || '{}'); const msg = json.message || json.error || `HTTP ${res.status}`; const e = new Error(msg); e.details = json.errors || json; throw e } catch (e) { throw new Error(text || `HTTP ${res.status}`) }
      }
      return await res.json()
    } catch (err) {
      console.error('OfficeClassService listOfficeClasses error:', err)
      throw err
    }
  }

  async getOfficeClass(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/office-classes/${encodeURIComponent(id)}`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        try { const json = JSON.parse(text || '{}'); const msg = json.message || json.error || `HTTP ${res.status}`; const e = new Error(msg); e.details = json.errors || json; throw e } catch (e) { throw new Error(text || `HTTP ${res.status}`) }
      }
      return await res.json()
    } catch (err) {
      console.error('OfficeClassService getOfficeClass error:', err)
      throw err
    }
  }

  async createOfficeClass(payload = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/office-classes`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        try { const json = JSON.parse(text || '{}'); const msg = json.message || json.error || `HTTP ${res.status}`; const e = new Error(msg); e.details = json.errors || json; throw e } catch (e) { throw new Error(text || `HTTP ${res.status}`) }
      }
      return await res.json()
    } catch (err) {
      console.error('OfficeClassService createOfficeClass error:', err)
      throw err
    }
  }

  async updateOfficeClass(id, payload = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/office-classes/${encodeURIComponent(id)}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        try { const json = JSON.parse(text || '{}'); const msg = json.message || json.error || `HTTP ${res.status}`; const e = new Error(msg); e.details = json.errors || json; throw e } catch (e) { throw new Error(text || `HTTP ${res.status}`) }
      }
      return await res.json()
    } catch (err) {
      console.error('OfficeClassService updateOfficeClass error:', err)
      throw err
    }
  }

  async deleteOfficeClass(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/share/office-classes/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        try { const json = JSON.parse(text || '{}'); throw new Error(json.message || json.error || `HTTP ${res.status}`) } catch (e) { throw new Error(text || `HTTP ${res.status}`) }
      }
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) return await res.json()
      return { success: true }
    } catch (err) {
      console.error('OfficeClassService deleteOfficeClass error:', err)
      throw err
    }
  }
}

export default new OfficeClassService()
