/**
 * Formatters - Helper functions để format dữ liệu hiển thị
 */

/**
 * Format ngày giờ theo định dạng Việt Nam
 * Ví dụ: "14:30 25 tháng 9, 2024"
 * @param {string|Date} dateInput - ISO string hoặc Date object
 * @returns {string}
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return ''

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    
    if (isNaN(date.getTime())) {
      return ''
    }

    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const day = date.getDate()
    const month = date.getMonth() + 1 // 0-indexed
    const year = date.getFullYear()

    return `${hours}:${minutes} ${day} tháng ${month} năm ${year}`
  } catch (error) {
    console.error('formatDateTime error:', error)
    return ''
  }
}

/**
 * Format chỉ ngày (không có giờ)
 * Ví dụ: "25 tháng 9, 2024"
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return ''

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    
    if (isNaN(date.getTime())) {
      return ''
    }

    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    return `${day} tháng ${month}, ${year}`
  } catch (error) {
    console.error('formatDate error:', error)
    return ''
  }
}

/**
 * Format chỉ giờ
 * Ví dụ: "14:30"
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatTime(dateInput) {
  if (!dateInput) return ''

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    
    if (isNaN(date.getTime())) {
      return ''
    }

    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${hours}:${minutes}`
  } catch (error) {
    console.error('formatTime error:', error)
    return ''
  }
}

/**
 * Format ngày giờ tương đối (như "2 giờ trước", "3 ngày trước")
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return ''

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    
    if (isNaN(date.getTime())) {
      return ''
    }

    const now = new Date()
    const diffMs = now - date
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffSeconds < 60) {
      return 'Vừa xong'
    } else if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`
    } else if (diffWeeks < 4) {
      return `${diffWeeks} tuần trước`
    } else if (diffMonths < 12) {
      return `${diffMonths} tháng trước`
    } else {
      return `${diffYears} năm trước`
    }
  } catch (error) {
    console.error('formatRelativeTime error:', error)
    return ''
  }
}

/**
 * Format ngày với format ngắn gọn hơn cho list view
 * Ví dụ: "Hôm nay 14:30", "Hôm qua 14:30", "25/09/2024"
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDateShort(dateInput) {
  if (!dateInput) return ''

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    
    if (isNaN(date.getTime())) {
      return ''
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    const diffDays = Math.floor((today - inputDate) / (1000 * 60 * 60 * 24))
    
    const timeStr = formatTime(date)

    if (diffDays === 0) {
      return `Hôm nay ${timeStr}`
    } else if (diffDays === 1) {
      return `Hôm qua ${timeStr}`
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`
    } else {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }
  } catch (error) {
    console.error('formatDateShort error:', error)
    return ''
  }
}

/**
 * Convert an ISO date string or Date object to dd/mm/yyyy format
 * Example: '2025-09-01' -> '01/09/2025'
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDateDDMMYYYY(dateInput) {
  if (!dateInput) return ''
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    if (isNaN(date.getTime())) return ''
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch (err) {
    console.error('formatDateDDMMYYYY error:', err)
    return ''
  }
}

/**
 * Convert a dd/mm/yyyy string to ISO (yyyy-mm-dd) for API consumption
 * Example: '01/09/2025' -> '2025-09-01'
 * @param {string} ddmmyyyy
 * @returns {string|null}
 */
export function parseDDMMYYYYToISO(ddmmyyyy) {
  if (!ddmmyyyy || typeof ddmmyyyy !== 'string') return null
  const parts = ddmmyyyy.split('/').map(p => p.trim())
  if (parts.length !== 3) return null
  const [dd, mm, yyyy] = parts
  const date = new Date(`${yyyy}-${mm}-${dd}`)
  if (isNaN(date.getTime())) return null
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Parse a DATEONLY string 'YYYY-MM-DD' to a Date at local midnight.
 * Prevent timezone skew by explicitly setting local time to midnight.
 */
export function parseISODateToLocal(dateIso) {
  if (!dateIso) return null
  try {
    // dateIso is expected like '2025-09-01', so create a Date at local midnight
    const [y, m, d] = String(dateIso).split('-').map(s => parseInt(s, 10))
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d, 0, 0, 0, 0)
  } catch (err) {
    console.error('parseISODateToLocal error:', err)
    return null
  }
}

/**
 * Normalize any date-ish string or Date to an HTML date input value (yyyy-mm-dd)
 * Accepts full ISO strings with time and timezones, Date objects, unix timestamps
 */
export function toInputDate(value) {
  if (!value) return ''
  try {
    // if already yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    // ISO with time: take date part
    if (typeof value === 'string' && value.includes('T')) {
      const iso = value.split('T')[0]
      if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
    }
    // Date object
    const d = (typeof value === 'string' && !isNaN(Date.parse(value))) ? new Date(value) : (value instanceof Date ? value : null)
    if (d instanceof Date && !isNaN(d.getTime())) {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    }
    // number timestamp
    const num = Number(value)
    if (!Number.isNaN(num)) {
      const ts = String(value).length === 10 ? num * 1000 : num
      const dd2 = new Date(ts)
      if (!isNaN(dd2.getTime())) {
        const yyyy = dd2.getFullYear()
        const mm = String(dd2.getMonth() + 1).padStart(2, '0')
        const dd = String(dd2.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
      }
    }
    // dd/mm/yyyy
    const m = String(value).trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (m) {
      const ddd = m[1].padStart(2, '0')
      const mmm = m[2].padStart(2, '0')
      const yyyy = m[3]
      return `${yyyy}-${mmm}-${ddd}`
    }
  } catch (err) {
    console.warn('toInputDate failed for', value, err)
  }
  return ''
}

/**
 * Compute semester status by dates (client-side).
 * - 'upcoming' if now < start
 * - 'active' if start <= now <= end
 * - 'completed' if now > end
 * Returns one of: 'upcoming'|'active'|'completed'
 */
export function getSemesterStatus(startIso, endIso) {
  try {
    const start = parseISODateToLocal(startIso)
    const end = parseISODateToLocal(endIso)
    const now = new Date()
    if (!start || !end) {
      // if missing critical date data, default to upcoming
      return 'upcoming'
    }
    if (now < start) return 'upcoming'
    if (now > end) return 'completed'
    return 'active'
  } catch (err) {
    console.error('getSemesterStatus error:', err)
    return 'upcoming'
  }
}

/**
 * Format priority sang tiếng Việt
 * @param {string} priority - 'low', 'medium', 'high'
 * @returns {string}
 */
export function formatPriority(priority) {
  const priorityMap = {
    'low': 'Thấp',
    'medium': 'Trung bình',
    'high': 'Cao'
  }
  return priorityMap[priority] || 'Trung bình'
}

/**
 * Format status sang tiếng Việt
 * @param {string} status - 'draft', 'active', 'completed'
 * @returns {string}
 */
export function formatStatus(status) {
  const statusMap = {
    'draft': 'Nháp',
    'active': 'Hoạt động',
    'completed': 'Hoàn thành',
    'todo': 'Cần làm',
    'open': 'Đang mở',
    'done': 'Hoàn tất'
  }
  return statusMap[status] || 'Nháp'
}

/**
 * Truncate text với số ký tự tối đa
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || ''
  return text.substring(0, maxLength) + '...'
}

/**
 * Format số lượng (thêm dấu phân cách hàng nghìn)
 * Ví dụ: 1000 -> "1.000", 1000000 -> "1.000.000"
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (typeof num !== 'number') return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Format file size
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Pluralize (đơn giản hóa cho tiếng Việt)
 * @param {number} count
 * @param {string} singular
 * @param {string} plural
 * @returns {string}
 */
export function pluralize(count, singular, plural = null) {
  if (count === 1) return `${count} ${singular}`
  return `${count} ${plural || singular}`
}

/**
 * Format category name
 * @param {string} category
 * @returns {string}
 */
export function formatCategory(category) {
  const categoryMap = {
    'study': 'Học tập',
    'project': 'Dự án',
    'meeting': 'Cuộc họp',
    'resource': 'Tài liệu',
    'personal': 'Cá nhân',
    'work': 'Công việc'
  }
  return categoryMap[category] || category || 'Khác'
}

/**
 * Get color class for priority
 * @param {string} priority
 * @returns {string}
 */
export function getPriorityColor(priority) {
  const colorMap = {
    'low': 'success',
    'medium': 'warning',
    'high': 'danger'
  }
  return colorMap[priority] || 'info'
}

/**
 * Get color class for status
 * @param {string} status
 * @returns {string}
 */
export function getStatusColor(status) {
  const colorMap = {
    'draft': 'secondary',
    'active': 'success',
    'completed': 'primary',
    'todo': 'warning',
    'open': 'info',
    'done': 'success'
  }
  return colorMap[status] || 'secondary'
}

/**
 * Get user display name from user object based on role
 * @param {Object} userInfo - User object from backend
 * @returns {string}
 */
export function getUserDisplayName(userInfo) {
  if (!userInfo) return 'Unknown User'
  
  // Try to get name from role-specific fields
  return userInfo.full_name || 
         userInfo.user_name ||
         userInfo.Teacher?.teacher_name ||
         userInfo.Staff?.staff_name ||
         userInfo.Admin?.admin_name ||
         userInfo.Student?.student_name ||
         userInfo.user_code ||
         `User ${userInfo.user_id || ''}`
}

/**
 * Get user avatar URL from user object using common backend fields
 * @param {Object} userInfo
 * @returns {string|null}
 */
export function getUserAvatar(userInfo) {
  if (!userInfo) return null
  // Helper: recursively search object for avatar-like keys
  const findAvatar = (obj, depth = 0) => {
    if (!obj || depth > 5) return null
    if (typeof obj === 'string') {
      const s = obj.trim()
      return s || null
    }

    if (typeof obj !== 'object') return null

    // check direct keys first
    for (const key of Object.keys(obj)) {
      const val = obj[key]
      const k = String(key).toLowerCase()
      if (k.includes('avatar') || k.includes('user_avatar')) {
        if (typeof val === 'string' && val.trim()) return val.trim()
      }
    }

    // then descend into nested objects
    for (const key of Object.keys(obj)) {
      const val = obj[key]
      if (typeof val === 'object' && val !== null) {
        const found = findAvatar(val, depth + 1)
        if (found) return found
      }
    }

    return null
  }

  const raw = findAvatar(userInfo)
  if (!raw) return null

  // Normalize URL formats
  try {
    const trimmed = String(raw).trim()
    if (!trimmed) return null
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (/^\/\//.test(trimmed)) return `https:${trimmed}`
    const base = (import.meta.env && import.meta.env.VITE_API_BASE_URL) ? import.meta.env.VITE_API_BASE_URL : ''
    if (base) {
      return `${base.replace(/\/+$/,'')}/${trimmed.replace(/^\/+/, '')}`
    }
    // If no API base configured, ensure the returned path is absolute
    if (!/^[\/:]/.test(trimmed)) {
      return `/${trimmed.replace(/^\/+/, '')}`
    }
    return trimmed
  } catch (err) {
    console.warn('getUserAvatar: failed to normalize avatar url', err)
    return String(raw)
  }
}
