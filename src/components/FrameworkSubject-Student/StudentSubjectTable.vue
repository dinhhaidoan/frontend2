<template>
  <div class="student-subject-table">
    <!-- Table View -->
    <div class="table-container">
      <div class="table-wrapper">
        <table class="subjects-table">
          <thead>
            <tr>
              <th class="subject-code">Mã môn</th>
              <th class="subject-name">Tên môn học</th>
              <th class="credits">TC</th>
              <th class="type">Loại</th>
              <th class="semester">HK</th>
              <th class="status">Trạng thái</th>
              <th class="grade">Điểm</th>
              <th class="actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="subject in filteredSubjects"
              :key="subject.id"
              class="subject-row"
              :class="{ 
                'completed': subject.isCompleted, 
                'current': subject.isCurrent,
                'has-prerequisites': subject.prerequisites.length > 0
              }"
            >
              <td class="subject-code">
                <div class="code-wrapper">
                  <span class="code">{{ subject.code }}</span>
                  <div v-if="subject.prerequisites.length > 0" class="prerequisites-indicator">
                    <i class="fas fa-link" :title="`Môn tiên quyết: ${subject.prerequisites.join(', ')}`"></i>
                  </div>
                </div>
              </td>
              
              <td class="subject-name">
                <div class="name-wrapper">
                  <h4>{{ subject.name }}</h4>
                  <p v-if="subject.englishName" class="english-name">{{ subject.englishName }}</p>
                </div>
              </td>
              
              <td class="credits">
                <span class="credits-value">{{ subject.credits }}</span>
              </td>
              
              <td class="type">
                <span :class="['type-badge', subject.type]">
                  <i :class="getTypeIcon(subject.type)"></i>
                  {{ getTypeLabel(subject.type) }}
                </span>
              </td>
              
              <td class="semester">
                <span class="semester-info">
                  HK{{ subject.semester }} - N{{ subject.academicYear }}
                </span>
              </td>
              
              <td class="status">
                <div class="status-wrapper">
                  <span :class="['status-badge', getStatusClass(subject)]">
                    <i :class="getStatusIcon(subject)"></i>
                    {{ getStatusLabel(subject) }}
                  </span>
                  
                  <div v-if="subject.completedDate" class="completion-date">
                    {{ formatDate(subject.completedDate) }}
                  </div>
                </div>
              </td>
              
              <td class="grade">
                <div v-if="subject.grade" class="grade-wrapper">
                  <span class="grade-value">{{ subject.grade }}</span>
                  <span :class="['grade-label', getGradeStatus(subject.grade)]">
                    {{ getGradeLabel(subject.grade) }}
                  </span>
                </div>
                <span v-else class="no-grade">-</span>
              </td>
              
              <td class="actions">
                <div class="action-buttons">
                  <button 
                    @click="$emit('view-subject', subject)"
                    class="action-btn view"
                    title="Xem chi tiết"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Empty State -->
        <div v-if="filteredSubjects.length === 0" class="empty-table">
          <div class="empty-icon">
            <i class="fas fa-search"></i>
          </div>
          <h3>Không tìm thấy môn học</h3>
          <p>Thử thay đổi bộ lọc để xem thêm môn học</p>
        </div>
      </div>
    </div>
    
    <!-- Table Summary -->
    <div class="table-summary">
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">Tổng số môn:</span>
          <span class="stat-value">{{ filteredSubjects.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Tổng tín chỉ:</span>
          <span class="stat-value">{{ totalCredits }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Đã hoàn thành:</span>
          <span class="stat-value completed">{{ completedSubjects }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Đang học:</span>
          <span class="stat-value current">{{ currentSubjects }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Còn lại:</span>
          <span class="stat-value remaining">{{ remainingSubjects }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  subjects: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  studentMajor: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['view-subject'])

// Filter subjects based on applied filters
const filteredSubjects = computed(() => {
  let filtered = [...props.subjects]
  
  if (props.filters.search) {
    const search = props.filters.search.toLowerCase()
    filtered = filtered.filter(subject =>
      subject.code.toLowerCase().includes(search) ||
      subject.name.toLowerCase().includes(search) ||
      (subject.englishName && subject.englishName.toLowerCase().includes(search))
    )
  }
  
  if (props.filters.type && props.filters.type !== 'all') {
    filtered = filtered.filter(subject => subject.type === props.filters.type)
  }
  
  if (props.filters.semester) {
    filtered = filtered.filter(subject => subject.semester === parseInt(props.filters.semester))
  }
  
  if (props.filters.status && props.filters.status !== 'all') {
    if (props.filters.status === 'completed') {
      filtered = filtered.filter(subject => subject.isCompleted)
    } else if (props.filters.status === 'current') {
      filtered = filtered.filter(subject => subject.isCurrent)
    } else if (props.filters.status === 'remaining') {
      filtered = filtered.filter(subject => !subject.isCompleted && !subject.isCurrent)
    }
  }
  
  if (props.filters.academicYear) {
    filtered = filtered.filter(subject => subject.academicYear === parseInt(props.filters.academicYear))
  }
  
  return filtered.sort((a, b) => {
    // Sort by academic year, then semester, then type
    if (a.academicYear !== b.academicYear) {
      return a.academicYear - b.academicYear
    }
    if (a.semester !== b.semester) {
      return a.semester - b.semester
    }
    if (a.type !== b.type) {
      return a.type === 'required' ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
})

// Summary statistics
const totalCredits = computed(() => 
  filteredSubjects.value.reduce((sum, subject) => sum + subject.credits, 0)
)

const completedSubjects = computed(() => 
  filteredSubjects.value.filter(subject => subject.isCompleted).length
)

const currentSubjects = computed(() => 
  filteredSubjects.value.filter(subject => subject.isCurrent).length
)

const remainingSubjects = computed(() => 
  filteredSubjects.value.filter(subject => !subject.isCompleted && !subject.isCurrent).length
)

// Helper methods
const getTypeIcon = (type) => {
  const icons = {
    'required': 'fas fa-star',
    'elective': 'fas fa-list-ul',
    'specialization': 'fas fa-graduation-cap'
  }
  return icons[type] || 'fas fa-book'
}

const getTypeLabel = (type) => {
  const labels = {
    'required': 'Bắt buộc',
    'elective': 'Tự chọn',
    'specialization': 'Chuyên ngành'
  }
  return labels[type] || type
}

const getStatusClass = (subject) => {
  if (subject.isCompleted) return 'completed'
  if (subject.isCurrent) return 'current'
  return 'pending'
}

const getStatusIcon = (subject) => {
  if (subject.isCompleted) return 'fas fa-check-circle'
  if (subject.isCurrent) return 'fas fa-play-circle'
  return 'fas fa-circle'
}

const getStatusLabel = (subject) => {
  if (subject.isCompleted) return 'Đã hoàn thành'
  if (subject.isCurrent) return 'Đang học'
  return 'Chưa học'
}

const getGradeStatus = (grade) => {
  if (grade >= 8.5) return 'excellent'
  if (grade >= 7.0) return 'good'
  if (grade >= 5.5) return 'average'
  if (grade >= 4.0) return 'poor'
  return 'fail'
}

const getGradeLabel = (grade) => {
  if (grade >= 8.5) return 'Xuất sắc'
  if (grade >= 7.0) return 'Khá'
  if (grade >= 5.5) return 'Trung bình'
  if (grade >= 4.0) return 'Yếu'
  return 'Kém'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
.student-subject-table {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-container {
  position: relative;
}

.table-wrapper {
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
}

.subjects-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.subjects-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.subjects-table th {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  color: #374151;
  font-weight: 600;
  font-size: 13px;
  text-align: left;
  padding: 16px 12px;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.subjects-table th.subject-code {
  width: 100px;
}

.subjects-table th.subject-name {
  width: 300px;
  min-width: 250px;
}

.subjects-table th.credits {
  width: 60px;
  text-align: center;
}

.subjects-table th.type {
  width: 120px;
}

.subjects-table th.semester {
  width: 100px;
}

.subjects-table th.status {
  width: 140px;
}

.subjects-table th.grade {
  width: 120px;
}

.subjects-table th.actions {
  width: 80px;
  text-align: center;
}

.subject-row {
  transition: all 0.3s ease;
  border-bottom: 1px solid #f1f5f9;
}

.subject-row:hover {
  background: #f8fafc;
}

.subject-row.completed {
  background: rgba(16, 185, 129, 0.03);
}

.subject-row.current {
  background: rgba(59, 130, 246, 0.03);
}

.subjects-table td {
  padding: 16px 12px;
  vertical-align: top;
}

.code-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 700;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.prerequisites-indicator {
  color: #f59e0b;
  font-size: 12px;
}

.name-wrapper h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.english-name {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
  line-height: 1.3;
}

.credits-value {
  display: inline-block;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
  text-align: center;
  line-height: 28px;
  font-weight: 600;
  font-size: 13px;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.type-badge.required {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.type-badge.elective {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.type-badge.specialization {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
}

.semester-info {
  color: #6b7280;
  font-weight: 500;
  font-size: 13px;
}

.status-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.completed {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-badge.current {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-badge.pending {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.completion-date {
  font-size: 11px;
  color: #9ca3af;
}

.grade-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.grade-value {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.grade-label {
  font-size: 10px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 8px;
  text-align: center;
}

.grade-label.excellent {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.grade-label.good {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.grade-label.average {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.grade-label.poor {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.grade-label.fail {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.no-grade {
  color: #9ca3af;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.action-btn.view {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.action-btn.view:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.1);
}

.empty-table {
  text-align: center;
  padding: 80px 20px;
  color: #6b7280;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(107, 114, 128, 0.1);
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 16px;
}

.empty-table h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #374151;
}

.empty-table p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.table-summary {
  padding: 20px 24px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.summary-stats {
  display: flex;
  gap: 32px;
  align-items: center;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.stat-label {
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-weight: 700;
  color: #1f2937;
}

.stat-value.completed {
  color: #059669;
}

.stat-value.current {
  color: #3b82f6;
}

.stat-value.remaining {
  color: #d97706;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .subjects-table th.subject-name {
    min-width: 200px;
  }
  
  .summary-stats {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .table-wrapper {
    max-height: 500px;
  }
  
  .subjects-table {
    font-size: 13px;
  }
  
  .subjects-table th,
  .subjects-table td {
    padding: 12px 8px;
  }
  
  .subjects-table th.subject-name {
    min-width: 180px;
  }
  
  .name-wrapper h4 {
    font-size: 13px;
  }
  
  .english-name {
    font-size: 11px;
  }
  
  .summary-stats {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .stat-item {
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .stat-item:last-child {
    border-bottom: none;
  }
}

@media (max-width: 640px) {
  .table-summary {
    padding: 16px 20px;
  }
  
  .subjects-table th.subject-code,
  .subjects-table th.semester {
    display: none;
  }
  
  .subject-row .subject-code,
  .subject-row .semester {
    display: none;
  }
  
  .subjects-table th.subject-name {
    min-width: 150px;
  }
}

/* Custom scrollbar for table */
.table-wrapper::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>