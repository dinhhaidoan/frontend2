<template>
  <div class="class-grid-view">
    <div v-if="filteredClasses.length === 0" class="empty-state">
      <i class="fas fa-inbox"></i>
      <p>Không tìm thấy lớp học nào</p>
    </div>

    <div v-else class="classes-grid">
      <div 
        v-for="classItem in filteredClasses" 
        :key="classItem.id"
        class="class-card"
        @click="selectClass(classItem)"
      >
        <div class="card-header">
          <div class="class-info">
            <h3 class="class-name">{{ classItem.name }}</h3>
            <span class="class-code">{{ classItem.code }}</span>
          </div>
          <span :class="['status-badge', classItem.status]">
            {{ getStatusLabel(classItem.status) }}
          </span>
        </div>

        <div class="card-body">
          <div class="info-row">
            <i class="fas fa-book"></i>
            <span>{{ classItem.subject }}</span>
          </div>
          <div class="info-row">
            <i class="fas fa-layer-group"></i>
            <span>{{ classItem.type === 'theory' ? 'Lý thuyết' : 'Thực hành' }}</span>
          </div>
          <div class="info-row">
            <i class="fas fa-users"></i>
            <span>{{ classItem.studentCount }} sinh viên</span>
          </div>
          <div class="info-row">
            <i class="fas fa-calendar-alt"></i>
            <span>{{ classItem.semester }}</span>
          </div>
          <div class="info-row">
            <i class="fas fa-door-open"></i>
            <span>Phòng {{ classItem.room }}</span>
          </div>
        </div>

        <div class="card-footer">
          <div class="progress-info">
            <div class="progress-label">
              <span>Điểm danh</span>
              <span class="progress-value">{{ classItem.attendance }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: classItem.attendance + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button @click.stop="viewDetails(classItem)" class="btn-action primary">
            <i class="fas fa-eye"></i>
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  classes: {
    type: Array,
    required: true
  },
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['class-click'])

const filteredClasses = computed(() => {
  let result = [...props.classes]

  if (props.filters.semester !== 'all') {
    result = result.filter(c => c.semester === props.filters.semester)
  }

  if (props.filters.classType !== 'all') {
    result = result.filter(c => c.type === props.filters.classType)
  }

  if (props.filters.subject !== 'all') {
    result = result.filter(c => c.subjectCode === props.filters.subject)
  }

  if (props.filters.status !== 'all') {
    result = result.filter(c => c.status === props.filters.status)
  }

  return result
})

const getStatusLabel = (status) => {
  const labels = {
    active: 'Đang học',
    completed: 'Đã kết thúc',
    upcoming: 'Sắp diễn ra'
  }
  return labels[status] || status
}

const selectClass = (classItem) => {
  emit('class-click', classItem)
}

const viewDetails = (classItem) => {
  emit('class-click', classItem)
}
</script>

<style scoped>
.class-grid-view {
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

.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.class-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.class-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: #3b82f6;
}

.card-header {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.class-info {
  flex: 1;
}

.class-name {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.class-code {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.active {
  background: #d1fae5;
  color: #059669;
}

.status-badge.completed {
  background: #e0e7ff;
  color: #4f46e5;
}

.status-badge.upcoming {
  background: #fef3c7;
  color: #d97706;
}

.card-body {
  padding: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.info-row i {
  width: 20px;
  color: #9ca3af;
}

.card-footer {
  padding: 0 20px 20px 20px;
}

.progress-info {
  margin-top: 8px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.progress-value {
  color: #3b82f6;
  font-weight: 700;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  transition: width 0.3s;
}

.card-actions {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 10px;
  background: #f9fafb;
}

.btn-action {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
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
  .classes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
