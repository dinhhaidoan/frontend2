<template>
  <div class="filters-container">
    <div class="filter-card">
      <h3 class="filter-title">
        <i class="fas fa-filter"></i>
        Bộ lọc
      </h3>

      <div class="filter-section">
        <label class="filter-label">Lớp học</label>
        <select v-model="localFilters.class" @change="emitUpdate" class="filter-select">
          <option value="all">Tất cả lớp học</option>
          <option value="1">Lập trình Web - WEB301</option>
          <option value="2">Thực hành Web - WEB301.1</option>
          <option value="3">Lập trình Mobile - MOB201</option>
          <option value="4">Cơ sở dữ liệu - DB301</option>
        </select>
      </div>

      <div class="filter-section">
        <label class="filter-label">Trạng thái</label>
        <select v-model="localFilters.status" @change="emitUpdate" class="filter-select">
          <option value="all">Tất cả</option>
          <option value="not-started">Chưa học</option>
          <option value="in-progress">Đang học</option>
          <option value="completed">Đã hoàn thành</option>
        </select>
      </div>

      <div class="filter-section">
        <label class="filter-label">Loại nội dung</label>
        <select v-model="localFilters.type" @change="emitUpdate" class="filter-select">
          <option value="all">Tất cả</option>
          <option value="video">Có video</option>
          <option value="document">Có tài liệu</option>
          <option value="online">Học online</option>
        </select>
      </div>

      <div class="filter-section">
        <label class="filter-label">Sắp xếp</label>
        <select v-model="localFilters.sortBy" @change="emitUpdate" class="filter-select">
          <option value="date-desc">Mới nhất</option>
          <option value="date-asc">Cũ nhất</option>
          <option value="name-asc">Tên A-Z</option>
          <option value="name-desc">Tên Z-A</option>
        </select>
      </div>

      <button @click="resetFilters" class="btn-reset">
        <i class="fas fa-redo"></i>
        Đặt lại bộ lọc
      </button>
    </div>

    <!-- Quick Progress -->
    <div class="progress-card">
      <h3 class="filter-title">
        <i class="fas fa-chart-line"></i>
        Tiến độ học tập
      </h3>
      
      <div class="progress-item">
        <div class="progress-header">
          <span class="progress-label">Bài học đã hoàn thành</span>
          <span class="progress-value">8/15</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 53%"></div>
        </div>
      </div>

      <div class="progress-item">
        <div class="progress-header">
          <span class="progress-label">Video đã xem</span>
          <span class="progress-value">12/18</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill video" style="width: 67%"></div>
        </div>
      </div>

      <div class="progress-item">
        <div class="progress-header">
          <span class="progress-label">Tài liệu đã tải</span>
          <span class="progress-value">20/25</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill material" style="width: 80%"></div>
        </div>
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
    class: 'all',
    status: 'all',
    type: 'all',
    sortBy: 'date-desc'
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
.progress-card {
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

.progress-item {
  margin-bottom: 16px;
}

.progress-item:last-child {
  margin-bottom: 0;
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
  color: #1f2937;
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
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-fill.video {
  background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
}

.progress-fill.material {
  background: linear-gradient(90deg, #ec4899 0%, #db2777 100%);
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
