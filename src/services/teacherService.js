import authService from './authService'

const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
let API_BASE_URL = String(_rawBase || '/api')
if (!API_BASE_URL.includes('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$|$/, '') + '/api'
}

class TeacherService {
  // List teachers with optional pagination and search (backend endpoint exists)
  async listTeachers({ page = 1, limit = 20, q = '' } = {}) {
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (q) params.set('q', q)

      const url = `${API_BASE_URL}/share/auth/teachers?${params.toString()}`
      const res = await fetch(url, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(txt || `HTTP ${res.status}`)
      }
      return await res.json()
    } catch (err) {
      console.error('TeacherService.listTeachers error', err)
      throw err
    }
  }

  // Get a single user by user_code (use existing authService)
  async getTeacher(userCode) {
    return authService.getUser(userCode)
  }

  // Create teacher (wraps authService.createUser)
  async createTeacher(payload) {
    return authService.createUser(payload)
  }

  // Update teacher (wraps authService.updateUser)
  async updateTeacher(userCode, payload) {
    return authService.updateUser(userCode, payload)
  }

  // Delete teacher (wraps authService.deleteUser)
  async deleteTeacher(userCode) {
    return authService.deleteUser(userCode)
  }

  // Upload avatar via backend endpoint (multipart form-data)
  // Upload avatar using multipart form data. If onProgress callback provided, uses XHR to report progress.
  async uploadAvatar(userCode, file, onProgress) {
    try {
      const url = `${API_BASE_URL}/share/auth/users/${encodeURIComponent(userCode)}/avatar`

      // If caller supplied a progress callback, use XMLHttpRequest to report upload progress
      if (typeof onProgress === 'function') {
        return await new Promise((resolve, reject) => {
          try {
            const xhr = new XMLHttpRequest()
            xhr.open('POST', url)
            xhr.withCredentials = true
            xhr.onload = function () {
              if (xhr.status >= 200 && xhr.status < 300) {
                try { resolve(JSON.parse(xhr.responseText || '{}')) } catch (e) { resolve({}) }
              } else {
                const txt = xhr.responseText || `HTTP ${xhr.status}`
                reject(new Error(txt))
              }
            }
            xhr.onerror = function (ev) { reject(new Error('Network error')) }
            if (xhr.upload && typeof onProgress === 'function') {
              xhr.upload.onprogress = function (ev) {
                if (ev.lengthComputable) {
                  const pct = Math.round((ev.loaded / ev.total) * 100)
                  try { onProgress(pct) } catch (e) {}
                }
              }
            }
            const fd = new FormData()
            fd.append('avatar', file)
            xhr.send(fd)
          } catch (err) { reject(err) }
        })
      }

      // Fallback: normal fetch without progress
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: fd
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(txt || `HTTP ${res.status}`)
      }
      try { return await res.json() } catch (e) { return {} }
    } catch (err) {
      console.error('TeacherService.uploadAvatar error', err)
      throw err
    }
  }

  // Lookup lists
  async listAcademicDegrees() {
    try {
      const res = await fetch(`${API_BASE_URL}/share/auth/academic-degrees`, { method: 'GET', credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      console.error('TeacherService.listAcademicDegrees error', err)
      throw err
    }
  }

  async listPositions() {
    try {
      const res = await fetch(`${API_BASE_URL}/share/auth/positions`, { method: 'GET', credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      console.error('TeacherService.listPositions error', err)
      throw err
    }
  }
}

export default new TeacherService()
