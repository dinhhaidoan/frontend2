<template>
  <div class="filters-container">
    <div class="filter-card">
      <h3 class="filter-title">
        <i class="fas fa-filter"></i>
        Bộ lọc
      </h3>

      <div class="filter-section">
        <label class="filter-label">Học kỳ</label>
        <select v-model="localFilters.semester" @change="emitUpdate" class="filter-select">
          <option value="all">Tất cả học kỳ</option>
          <option value="HK1 2024-2025">HK1 2024-2025</option>
          <option value="HK2 2024-2025">HK2 2024-2025</option>
          <option value="HK3 2024-2025">HK3 2024-2025</option>
          <option value="HK1 2023-2024">HK1 2023-2024</option>
        </select>
      </div>

      <div class="filter-section">
        <label class="filter-label">Trạng thái</label>
        <select v-model="localFilters.status" @change="emitUpdate" class="filter-select">
          <option value="all">Tất cả</option>
          <option value="active">Đang học</option>
          <option value="upcoming">Sắp diễn ra</option>
          <option value="completed">Đã kết thúc</option>
        </select>
      </div>

      <div class="filter-section">
        <label class="filter-label">Loại lớp</label>
        <select v-model="localFilters.classType" @change="emitUpdate" class="filter-select">
          <option value="all">Tất cả</option>
          <option value="theory">Lý thuyết</option>
          <option value="practice">Thực hành</option>
        </select>
      </div>

      <div class="filter-section">
        <label class="filter-label">Môn học</label>
        <select v-model="localFilters.subject" @change="emitUpdate" class="filter-select">
          <option value="all">Tất cả môn</option>
          <option value="web">Lập trình Web</option>
          <option value="mobile">Lập trình Mobile</option>
          <option value="database">Cơ sở dữ liệu</option>
          <option value="network">Mạng máy tính</option>
          <option value="ai">Trí tuệ nhân tạo</option>
        </select>
      </div>

      <button @click="resetFilters" class="btn-reset">
        <i class="fas fa-redo"></i>
        Đặt lại bộ lọc
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats-card">
      <h3 class="filter-title">
        <i class="fas fa-chart-pie"></i>
        Thống kê nhanh
      </h3>
      
      <div class="quick-stat-item">
        <div class="quick-stat-label">
          <i class="fas fa-book-open"></i>
          Đang học
        </div>
        <div class="quick-stat-value active">5</div>
      </div>

      <div class="quick-stat-item">
        <div class="quick-stat-label">
          <i class="fas fa-clock"></i>
          Sắp diễn ra
        </div>
        <div class="quick-stat-value upcoming">2</div>
      </div>

      <div class="quick-stat-item">
        <div class="quick-stat-label">
          <i class="fas fa-check-circle"></i>
          Đã hoàn thành
        </div>
        <div class="quick-stat-value completed">8</div>
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

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

const emitUpdate = () => {
  emit('update', localFilters.value)
}

const resetFilters = () => {
  localFilters.value = {
    semester: 'all',
    status: 'all',
    classType: 'all',
    subject: 'all'
  }
  emitUpdate()
}
</script>

<style scoped>
.filters-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card,
.quick-stats-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-title i {
  color: #3b82f6;
}

.filter-section {
  margin-bottom: 16px;
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.filter-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
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

.btn-reset {
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
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

.btn-reset:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.quick-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.quick-stat-item:last-child {
  border-bottom: none;
}

.quick-stat-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.quick-stat-label i {
  width: 16px;
  color: #9ca3af;
}

.quick-stat-value {
  font-size: 18px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
}

.quick-stat-value.active {
  color: #059669;
  background: #d1fae5;
}

.quick-stat-value.upcoming {
  color: #d97706;
  background: #fef3c7;
}

.quick-stat-value.completed {
  color: #4f46e5;
  background: #e0e7ff;
}

@media (max-width: 1200px) {
  .filters-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filters-container {
    grid-template-columns: 1fr;
  }
}
</style>
