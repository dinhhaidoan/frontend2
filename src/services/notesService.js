/**
 * Notes Service - API calls cho Notes module
 * Backend API: http://localhost:3000/api/share/notes
 */

import { normalizeNote, toBackendNote } from '@/types/note'

const API_BASE_URL = 'http://localhost:3000/api'

class NotesService {
  /**
   * Tạo ghi chú mới
   * @param {Object} noteData - Frontend note data
   * @param {string[]} tags - Mảng tên tags
   * @param {string} userCode - Mã người dùng
   * @returns {Promise<Object>} - { note: FrontendNote }
   */
  async createNote(noteData, tags = [], userCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/share/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          note: toBackendNote(noteData),
          tags: tags,
          user_code: userCode
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Tạo ghi chú thất bại')
      }

      const data = await response.json()
      return {
        note: normalizeNote(data.note)
      }
    } catch (error) {
      console.error('NotesService createNote error:', error)
      throw error
    }
  }

  /**
   * Lấy tổng số ghi chú theo từng danh mục cho user
   * @param {Object} params
   * @param {string} params.userCode
   * @returns {Promise<Array>} - [{ note_category_id, note_category_name, count }, ...]
   */
  async getCategoriesSummary(params = {}) {
    try {
      const { userCode } = params
      if (!userCode) throw new Error('user_code is required')

      const url = `${API_BASE_URL}/share/notes/categories-summary?user_code=${encodeURIComponent(userCode)}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Lấy summary danh mục thất bại')
      }

      const data = await response.json()
      // Backend returns {categories: Array}, extract the array
      return data.categories || data || []
    } catch (error) {
      console.error('NotesService getCategoriesSummary error:', error)
      throw error
    }
  }

  /**
   * Lấy danh sách ghi chú với phân trang và filter
   * @param {Object} params
   * @param {string} params.userCode - Mã người dùng (required)
   * @param {number} params.page - Trang hiện tại (default: 1)
   * @param {number} params.limit - Số lượng items/trang (default: 20)
   * @param {string} params.search - Tìm kiếm theo title/content
   * @param {string} params.tag - Lọc theo tag
   * @param {number} params.categoryId - Lọc theo category ID
   * @param {string} params.priority - Lọc theo priority
   * @param {boolean} params.isFavorite - Lọc yêu thích
   * @param {boolean} params.isArchived - Lọc đã lưu trữ
   * @returns {Promise<Object>} - { count: number, rows: FrontendNote[] }
   */
  async getNotes(params = {}) {
    try {
      const {
        userCode,
        page = 1,
        limit = 20,
        search,
        tag,
        categoryId,
        priority,
        isFavorite,
        isArchived
      } = params

      if (!userCode) {
        throw new Error('user_code is required')
      }

      // Build query string manually - đảm bảo params là number
      let queryString = `user_code=${userCode}&page=${page}&limit=${limit}`
      
      if (search) queryString += `&search=${encodeURIComponent(search)}`
      if (tag) queryString += `&tag=${encodeURIComponent(tag)}`
      if (categoryId) queryString += `&category_id=${categoryId}`
      if (priority) queryString += `&priority=${priority}`
      if (isFavorite !== undefined) queryString += `&is_favorite=${isFavorite}`
      if (isArchived !== undefined) queryString += `&is_archived=${isArchived}`

      const url = `${API_BASE_URL}/share/notes?${queryString}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Lấy danh sách ghi chú thất bại')
      }

      const data = await response.json()
      
      return {
        count: data.count,
        rows: (data.rows || []).map(note => normalizeNote(note))
      }
    } catch (error) {
      console.error('NotesService getNotes error:', error)
      throw error
    }
  }

  /**
   * Lấy chi tiết một ghi chú
   * @param {number} noteId - ID của ghi chú
   * @returns {Promise<Object>} - { note: FrontendNote }
   */
  async getNoteById(noteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/share/notes/${noteId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Không tìm thấy ghi chú')
        }
        const error = await response.json()
        throw new Error(error.error || 'Lấy chi tiết ghi chú thất bại')
      }

      const data = await response.json()
      return {
        note: normalizeNote(data.note)
      }
    } catch (error) {
      console.error('NotesService getNoteById error:', error)
      throw error
    }
  }

  /**
   * Cập nhật ghi chú
   * @param {number} noteId - ID của ghi chú
   * @param {Object} noteData - Frontend note data (có thể partial update)
   * @param {string[]} tags - Mảng tên tags (optional, nếu có sẽ replace toàn bộ tags)
   * @param {boolean} isPartialUpdate - Nếu true, chỉ gửi các field được cung cấp
   * @returns {Promise<Object>} - { message: string, note: FrontendNote }
   */
  async updateNote(noteId, noteData, tags = null, isPartialUpdate = false) {
    try {
      let notePayload
      
      if (isPartialUpdate) {
        // Partial update - chỉ gửi các field được cung cấp
        notePayload = {}
        if (noteData.isFavorite !== undefined) notePayload.note_is_favorite = noteData.isFavorite
        if (noteData.isArchived !== undefined) notePayload.note_is_archived = noteData.isArchived
        if (noteData.title !== undefined) notePayload.note_title = noteData.title
        if (noteData.content !== undefined) notePayload.note_content = noteData.content
        if (noteData.categoryId !== undefined) notePayload.note_category_id = noteData.categoryId
        if (noteData.status !== undefined) {
          const statusMap = { 'draft': 'todo', 'active': 'open', 'completed': 'done' }
          notePayload.note_status = statusMap[noteData.status] || noteData.status
        }
        if (noteData.priority !== undefined) notePayload.note_priority = noteData.priority
      } else {
        // Full update
        notePayload = toBackendNote(noteData)
      }
      
      const body = { note: notePayload }

      // Nếu có tags, thêm vào body để replace toàn bộ
      if (tags !== null) {
        body.tags = tags
      }

      const response = await fetch(`${API_BASE_URL}/share/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Không tìm thấy ghi chú')
        }
        const error = await response.json()
        throw new Error(error.error || 'Cập nhật ghi chú thất bại')
      }

      const data = await response.json()
      return {
        message: data.message,
        note: normalizeNote(data.note)
      }
    } catch (error) {
      console.error('NotesService updateNote error:', error)
      throw error
    }
  }

  /**
   * Xóa ghi chú
   * @param {number} noteId - ID của ghi chú
   * @returns {Promise<Object>} - { message: string, note_id: number }
   */
  async deleteNote(noteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/share/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Xóa ghi chú thất bại')
      }

      const data = await response.json()
      return data // { message: "Deleted", note_id: 123 }
    } catch (error) {
      console.error('NotesService deleteNote error:', error)
      throw error
    }
  }

  /**
   * Toggle favorite cho ghi chú
   * @param {number} noteId
   * @param {boolean} isFavorite
   * @returns {Promise<Object>}
   */
  async toggleFavorite(noteId, isFavorite) {
    return this.updateNote(noteId, { isFavorite }, null, true)
  }

  /**
   * Toggle archive cho ghi chú
   * @param {number} noteId
   * @param {boolean} isArchived
   * @returns {Promise<Object>}
   */
  async toggleArchive(noteId, isArchived) {
    return this.updateNote(noteId, { isArchived }, null, true)
  }

  /**
   * Bulk delete notes
   * @param {number[]} noteIds
   * @returns {Promise<Object[]>}
   */
  async bulkDeleteNotes(noteIds) {
    try {
      const promises = noteIds.map(id => this.deleteNote(id))
      return await Promise.all(promises)
    } catch (error) {
      console.error('NotesService bulkDeleteNotes error:', error)
      throw error
    }
  }
}

export default new NotesService()
