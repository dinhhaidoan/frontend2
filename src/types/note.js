/**
 * Types và helper functions cho Notes module
 * Backend API: /api/share/notes
 */

/**
 * @typedef {Object} NoteCategory
 * @property {number} note_category_id
 * @property {string} note_category_name
 * @property {string|null} note_category_description
 */

/**
 * @typedef {Object} NoteTag
 * @property {number} note_tag_id
 * @property {string} note_tag_name
 * @property {number} note_tag_user_id
 */

/**
 * @typedef {Object} Note
 * @property {number} note_id
 * @property {string} note_title
 * @property {string|null} note_content
 * @property {number} note_user_id
 * @property {number|null} note_category_id
 * @property {string|null} note_status - 'todo', 'open', 'done'
 * @property {string|null} note_priority - 'low', 'medium', 'high'
 * @property {boolean} note_is_favorite
 * @property {boolean} note_is_archived
 * @property {string} note_created_at - ISO 8601 timestamp
 * @property {string} note_updated_at - ISO 8601 timestamp
 * @property {NoteCategory|null} NoteCategory
 * @property {NoteTag[]} NoteTags
 */

/**
 * Frontend Note object (normalized)
 * @typedef {Object} FrontendNote
 * @property {number} id
 * @property {string} title
 * @property {string} content
 * @property {number} userId
 * @property {number|null} categoryId
 * @property {string} category - tên danh mục
 * @property {string} status - 'draft', 'active', 'completed'
 * @property {string} priority - 'low', 'medium', 'high'
 * @property {boolean} isFavorite
 * @property {boolean} isArchived
 * @property {string} createdAt - ISO 8601
 * @property {string} updatedAt - ISO 8601
 * @property {string[]} tags - mảng tên tags
 * @property {string} author - tên tác giả (nếu có)
 */

/**
 * Tạo một note object rỗng với giá trị mặc định
 * @returns {FrontendNote}
 */
export function createEmptyNote() {
  return {
    id: null,
    title: '',
    content: '',
    userId: null,
    categoryId: null,
    category: '',
    status: 'draft',
    priority: 'medium',
    isFavorite: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    author: ''
  }
}

/**
 * Normalize backend Note object sang frontend format
 * @param {Note} note - Backend note object
 * @returns {FrontendNote}
 */
export function normalizeNote(note) {
  if (!note) return createEmptyNote()

  return {
    id: note.note_id,
    title: note.note_title || '',
    content: note.note_content || '',
    userId: note.note_user_id,
    categoryId: note.note_category_id,
    category: note.NoteCategory?.note_category_name || '',
    status: mapBackendStatusToFrontend(note.note_status),
    priority: note.note_priority || 'medium',
    isFavorite: note.note_is_favorite || false,
    isArchived: note.note_is_archived || false,
    createdAt: note.note_created_at,
    updatedAt: note.note_updated_at,
    tags: (note.NoteTags || []).map(tag => tag.note_tag_name),
  author: note.author || '' // Backend không trả về author, frontend sẽ dùng user info làm fallback
  }
}

/**
 * Convert frontend note data sang backend format để tạo/cập nhật
 * @param {FrontendNote|Object} frontendNote
 * @returns {Object} Backend note format
 */
export function toBackendNote(frontendNote) {
  return {
    note_title: frontendNote.title,
    note_content: frontendNote.content || null,
    note_category_id: frontendNote.categoryId || null,
    note_status: mapFrontendStatusToBackend(frontendNote.status),
    note_priority: frontendNote.priority || null,
    note_is_favorite: frontendNote.isFavorite || false,
    note_is_archived: frontendNote.isArchived || false
  }
}

/**
 * Map backend status sang frontend status
 * Backend: 'todo', 'open', 'done' hoặc null
 * Frontend: 'draft', 'active', 'completed'
 */
function mapBackendStatusToFrontend(backendStatus) {
  const statusMap = {
    'todo': 'draft',
    'open': 'active',
    'done': 'completed',
    null: 'draft',
    undefined: 'draft'
  }
  return statusMap[backendStatus] || 'draft'
}

/**
 * Map frontend status sang backend status
 * Frontend: 'draft', 'active', 'completed'
 * Backend: 'todo', 'open', 'done'
 */
function mapFrontendStatusToBackend(frontendStatus) {
  const statusMap = {
    'draft': 'todo',
    'active': 'open',
    'completed': 'done'
  }
  return statusMap[frontendStatus] || 'todo'
}

/**
 * Lấy label tiếng Việt cho priority
 * @param {string} priority - 'low', 'medium', 'high'
 * @returns {string}
 */
export function getPriorityLabel(priority) {
  const labels = {
    'low': 'Thấp',
    'medium': 'Trung bình',
    'high': 'Cao'
  }
  return labels[priority] || 'Trung bình'
}

/**
 * Lấy label tiếng Việt cho status
 * @param {string} status - 'draft', 'active', 'completed'
 * @returns {string}
 */
export function getStatusLabel(status) {
  const labels = {
    'draft': 'Nháp',
    'active': 'Hoạt động',
    'completed': 'Hoàn thành'
  }
  return labels[status] || 'Nháp'
}

/**
 * Lấy icon cho priority
 * @param {string} priority
 * @returns {string}
 */
export function getPriorityIcon(priority) {
  const icons = {
    'low': '🟢',
    'medium': '🟡',
    'high': '🔴'
  }
  return icons[priority] || '🟡'
}

/**
 * Lấy icon cho status
 * @param {string} status
 * @returns {string}
 */
export function getStatusIcon(status) {
  const icons = {
    'draft': '📝',
    'active': '🟢',
    'completed': '✅'
  }
  return icons[status] || '📝'
}

/**
 * Mapping category ID sang tên danh mục (khớp với database)
 * Từ DB: 1=Học tập, 2=Dự án, 3=Tài liệu, 4=Họp, 5=Cá nhân
 */
export const CATEGORY_MAP = {
  1: { value: 'study', label: 'Học tập', icon: 'fas fa-graduation-cap' },
  2: { value: 'project', label: 'Dự án', icon: 'fas fa-project-diagram' },
  3: { value: 'resource', label: 'Tài liệu', icon: 'fas fa-book' },
  4: { value: 'meeting', label: 'Họp', icon: 'fas fa-users' },
  5: { value: 'personal', label: 'Cá nhân', icon: 'fas fa-user' }
}

/**
 * Lấy category info từ ID
 * @param {number|null} categoryId
 * @returns {Object}
 */
export function getCategoryInfo(categoryId) {
  return CATEGORY_MAP[categoryId] || { 
    value: '', 
    label: 'Khác', 
    icon: 'fas fa-sticky-note' 
  }
}
