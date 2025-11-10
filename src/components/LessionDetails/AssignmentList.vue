<template>
  <div class="assignment-list">
    <div v-if="filteredAssignments.length === 0" class="empty-state">
      <i class="fas fa-inbox"></i>
      <p>Không tìm thấy bài tập nào</p>
    </div>

    <div v-else class="assignments">
      <div 
        v-for="assignment in filteredAssignments" 
        :key="assignment.id"
        class="assignment-card"
        @click="selectAssignment(assignment)"
      >
        <div class="assignment-header">
          <div class="assignment-info">
            <div class="title-row">
              <h3 class="assignment-title">{{ assignment.title }}</h3>
              <span :class="['type-badge', assignment.type]">
                <i :class="getTypeIcon(assignment.type)"></i>
                {{ getTypeLabel(assignment.type) }}
              </span>
            </div>
            <span class="assignment-class">{{ assignment.className }}</span>
          </div>
        </div>

        <div class="assignment-body">
          <div class="assignment-meta">
            <div class="meta-item">
              <i class="fas fa-calendar"></i>
              <span>Hạn nộp: {{ formatDate(assignment.deadline) }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-users"></i>
              <span>{{ assignment.submitted }}/{{ assignment.totalStudents }} đã nộp</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-star"></i>
              <span>Điểm tối đa: {{ assignment.maxScore }}</span>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">Tiến độ chấm bài</span>
              <span class="progress-value">{{ assignment.graded }}/{{ assignment.submitted }}</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: getGradingProgress(assignment) + '%' }"
              ></div>
            </div>
          </div>

          <div class="assignment-stats">
            <div class="stat-item">
              <span class="stat-label">Điểm TB</span>
              <span class="stat-value">{{ assignment.avgScore || '--' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Cao nhất</span>
              <span class="stat-value">{{ assignment.maxScoreAchieved || '--' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Thấp nhất</span>
              <span class="stat-value">{{ assignment.minScore || '--' }}</span>
            </div>
          </div>
        </div>

        <div class="assignment-footer">
          <span :class="['status-badge', assignment.status]">
            {{ getStatusLabel(assignment.status) }}
          </span>
          <div class="actions">
            <button @click.stop="gradeAssignment(assignment)" class="btn-action primary">
              <i class="fas fa-edit"></i>
              Chấm điểm
            </button>
            <button @click.stop="viewDetails(assignment)" class="btn-action">
              <i class="fas fa-eye"></i>
              Chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  assignments: {
    type: Array,
    required: true
  },
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['assignment-click', 'grade-click'])

const filteredAssignments = computed(() => {
  let result = [...props.assignments]

  if (props.filters.type !== 'all') {
    result = result.filter(a => a.type === props.filters.type)
  }

  if (props.filters.status !== 'all') {
    result = result.filter(a => a.status === props.filters.status)
  }

  if (props.filters.deadline !== 'all') {
    const now = new Date()
    if (props.filters.deadline === 'upcoming') {
      result = result.filter(a => new Date(a.deadline) > now && new Date(a.deadline) - now < 7 * 24 * 60 * 60 * 1000)
    } else if (props.filters.deadline === 'overdue') {
      result = result.filter(a => new Date(a.deadline) < now)
    } else if (props.filters.deadline === 'completed') {
      result = result.filter(a => a.status === 'returned')
    }
  }

  if (props.filters.score !== 'all') {
    if (props.filters.score === 'high') {
      result = result.filter(a => a.avgScore >= 8)
    } else if (props.filters.score === 'medium') {
      result = result.filter(a => a.avgScore >= 5 && a.avgScore < 8)
    } else if (props.filters.score === 'low') {
      result = result.filter(a => a.avgScore < 5)
    }
  }

  return result
})

const getTypeLabel = (type) => {
  const labels = {
    'essay': 'Tự luận',
    'multiple-choice': 'Trắc nghiệm',
    'mixed': 'Hỗn hợp'
  }
  return labels[type] || type
}

const getTypeIcon = (type) => {
  const icons = {
    'essay': 'fas fa-pen',
    'multiple-choice': 'fas fa-check-square',
    'mixed': 'fas fa-tasks'
  }
  return icons[type] || 'fas fa-file-alt'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ chấm',
    graded: 'Đã chấm',
    returned: 'Đã trả bài'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getGradingProgress = (assignment) => {
  if (assignment.submitted === 0) return 0
  return Math.round((assignment.graded / assignment.submitted) * 100)
}

const selectAssignment = (assignment) => {
  emit('assignment-click', assignment)
}

const gradeAssignment = (assignment) => {
  emit('grade-click', assignment)
}

const viewDetails = (assignment) => {
  emit('assignment-click', assignment)
}
</script>

<style scoped>
.assignment-list {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

.assignments {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.assignment-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.assignment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: #3b82f6;
}

.assignment-header {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e5e7eb;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.assignment-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  flex: 1;
}

.type-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.type-badge.essay {
  background: #dbeafe;
  color: #1e40af;
}

.type-badge.multiple-choice {
  background: #d1fae5;
  color: #065f46;
}

.type-badge.mixed {
  background: #fce7f3;
  color: #9f1239;
}

.assignment-class {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.assignment-body {
  padding: 20px;
}

.assignment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.meta-item i {
  color: #9ca3af;
}

.progress-section {
  margin-bottom: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.progress-value {
  font-size: 13px;
  color: #3b82f6;
  font-weight: 700;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  transition: width 0.3s;
}

.assignment-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.assignment-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.graded {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.returned {
  background: #d1fae5;
  color: #059669;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-action {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-action:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.btn-action.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-action.primary:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
  .assignment-meta {
    flex-direction: column;
    gap: 8px;
  }

  .assignment-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .assignment-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .actions {
    width: 100%;
  }

  .btn-action {
    flex: 1;
  }
}
</style>
