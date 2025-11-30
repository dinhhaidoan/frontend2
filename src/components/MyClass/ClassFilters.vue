<template>
  <div class="class-filters">
    <div class="filter-header">
      <h3><i class="fas fa-filter"></i> Bộ lọc</h3>
    </div>
    <div class="filter-body">
      <div class="filter-group">
        <label>Học kỳ</label>
        <select v-model="localFilters.semester" @change="emitUpdate">
          <option value="all">Tất cả</option>
          <option value="1-2024">HK1 2024-2025</option>
          <option value="2-2024">HK2 2024-2025</option>
          <option value="1-2025">HK1 2025-2026</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Môn học</label>
        <select v-model="localFilters.subject" @change="emitUpdate">
          <option value="all">Tất cả</option>
          <option value="web">Lập trình Web</option>
          <option value="mobile">Lập trình Mobile</option>
          <option value="database">Cơ sở dữ liệu</option>
          <option value="network">Mạng máy tính</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Trạng thái</label>
        <select v-model="localFilters.status" @change="emitUpdate">
          <option value="all">Tất cả</option>
          <option value="active">Đang học</option>
          <option value="completed">Đã kết thúc</option>
          <option value="upcoming">Sắp bắt đầu</option>
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
    semester: 'all',
    classType: 'all',
    subject: 'all',
    status: 'all'
  }
  emitUpdate()
}
</script>

<style scoped>
.class-filters {
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
