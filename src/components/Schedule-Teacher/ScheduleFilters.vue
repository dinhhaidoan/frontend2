<template>
  <div class="schedule-filters">
    <div class="filter-header">
      <h3>Bộ lọc</h3>
      <button @click="resetFilters" class="reset-btn">
        <i class="fas fa-redo"></i>
        Đặt lại
      </button>
    </div>

    <div class="filter-group">
      <label class="filter-label">Loại lớp</label>
      <select v-model="localFilters.classType" @change="emitUpdate" class="filter-select">
        <option value="all">Tất cả</option>
        <option value="theory">Lý thuyết</option>
        <option value="practice">Thực hành</option>
        <option value="lab">Bài tập</option>
      </select>
    </div>

    <div class="filter-group">
      <label class="filter-label">Môn học</label>
      <select v-model="localFilters.subject" @change="emitUpdate" class="filter-select">
        <option value="all">Tất cả</option>
        <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
          {{ subject.name }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label class="filter-label">Trạng thái</label>
      <select v-model="localFilters.status" @change="emitUpdate" class="filter-select">
        <option value="all">Tất cả</option>
        <option value="scheduled">Đã lên lịch</option>
        <option value="ongoing">Đang diễn ra</option>
        <option value="completed">Đã hoàn thành</option>
        <option value="cancelled">Đã hủy</option>
      </select>
    </div>

    <div class="filter-group">
      <label class="filter-label">Phòng học</label>
      <select v-model="localFilters.room" @change="emitUpdate" class="filter-select">
        <option value="all">Tất cả</option>
        <option v-for="room in rooms" :key="room" :value="room">
          {{ room }}
        </option>
      </select>
    </div>

    <div class="filter-stats">
      <div class="stat-item">
        <span class="stat-label">Lớp được lọc</span>
        <span class="stat-value">{{ filteredCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

const localFilters = ref({ ...props.filters })

const subjects = ref([
  { id: 'cs101', name: 'Lập trình C' },
  { id: 'cs102', name: 'Cấu trúc dữ liệu' },
  { id: 'cs103', name: 'Cơ sở dữ liệu' },
  { id: 'cs104', name: 'Mạng máy tính' },
  { id: 'cs105', name: 'Lập trình Web' }
])

const rooms = ref([
  'A101', 'A102', 'A201', 'B101', 'B201', 'C301', 'Lab1', 'Lab2'
])

const filteredCount = ref(15)

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

const emitUpdate = () => {
  emit('update', localFilters.value)
}

const resetFilters = () => {
  localFilters.value = {
    classType: 'all',
    subject: 'all',
    status: 'all',
    room: 'all'
  }
  emitUpdate()
}
</script>

<style scoped>
.schedule-filters {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.reset-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
  padding: 6px 12px;
  border-radius: 6px;
}

.reset-btn:hover {
  color: #3b82f6;
  background: #f3f4f6;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.filter-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: #d1d5db;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-stats {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #3b82f6;
}
</style>
