<template>
  <div class="lesson-filters">
    <div class="filter-header">
      <h3><i class="fas fa-filter"></i> Bộ lọc</h3>
    </div>
    <div class="filter-body">
      <div class="filter-group">
        <label>Lớp học</label>
        <select v-model="localFilters.class" @change="emitUpdate">
          <option value="all">Tất cả lớp</option>
          <option value="1">Lập trình Web - WEB301</option>
          <option value="2">Thực hành Web - WEB301.1</option>
          <option value="3">Lập trình Mobile - MOB201</option>
          <option value="4">Cơ sở dữ liệu - DB301</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Trạng thái</label>
        <select v-model="localFilters.status" @change="emitUpdate">
          <option value="all">Tất cả</option>
          <option value="published">Đã công bố</option>
          <option value="draft">Bản nháp</option>
          <option value="scheduled">Đã lên lịch</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Loại bài học</label>
        <select v-model="localFilters.type" @change="emitUpdate">
          <option value="all">Tất cả</option>
          <option value="online">Học online</option>
          <option value="offline">Học trực tiếp</option>
          <option value="video">Có video</option>
          <option value="document">Có tài liệu</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Sắp xếp</label>
        <select v-model="localFilters.sortBy" @change="emitUpdate">
          <option value="date-desc">Mới nhất</option>
          <option value="date-asc">Cũ nhất</option>
          <option value="name-asc">Tên A-Z</option>
          <option value="name-desc">Tên Z-A</option>
        </select>
      </div>

      <button @click="resetFilters" class="reset-btn">
        <i class="fas fa-redo"></i>
        Đặt lại
      </button>
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
.lesson-filters {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.filter-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.filter-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-body {
  padding: 20px;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group:last-of-type {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.filter-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-group select:hover {
  border-color: #3b82f6;
}

.filter-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.reset-btn {
  width: 100%;
  padding: 10px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.reset-btn:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}
</style>
