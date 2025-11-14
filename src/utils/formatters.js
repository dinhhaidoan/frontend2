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
