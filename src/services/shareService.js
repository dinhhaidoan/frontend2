// shareService.js: fetch bases, floors, rooms from /api/share/*
const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
let API_BASE_URL = String(_rawBase || '/api')
if (!API_BASE_URL.includes('/api')) API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api'

class ShareService {
  async listBases() {
    const url = `${API_BASE_URL}/share/bases`
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || res.statusText)
    }
    return await res.json()
  }

  async getBase(idOrCode) {
    const url = `${API_BASE_URL}/share/bases/${encodeURIComponent(idOrCode)}`
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    return await res.json()
  }

  async listFloorsByBaseCode(baseCode) {
    const url = `${API_BASE_URL}/share/bases/${encodeURIComponent(baseCode)}/floors`
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || res.statusText)
    }
    return await res.json()
  }

  async listFloors(query = {}) {
    const params = new URLSearchParams(query || {})
    const url = `${API_BASE_URL}/share/floors${params.toString() ? `?${params.toString()}` : ''}`
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  }

  async getFloor(id) {
    const url = `${API_BASE_URL}/share/floors/${id}`
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  }

  async listRoomsByFloorId(floorId) {
    const url = `${API_BASE_URL}/share/floors/${floorId}/rooms`
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || res.statusText)
    }
    return await res.json()
  }

  async listRoomsByBaseAndFloor(baseCode, floorNumber) {
    const url = `${API_BASE_URL}/share/bases/${encodeURIComponent(baseCode)}/floors/${encodeURIComponent(floorNumber)}/rooms`
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || res.statusText)
    }
    return await res.json()
  }

  async listRooms(query = {}) {
    const params = new URLSearchParams(query || {})
    const url = `${API_BASE_URL}/share/rooms${params.toString() ? `?${params.toString()}` : ''}`
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  }

  async getRoom(id) {
    const url = `${API_BASE_URL}/share/rooms/${id}`
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  }
}

export default new ShareService()
