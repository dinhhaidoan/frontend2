<template>
  <div class="filter-section">
    <div class="filter-controls">
      <div class="filter-group">
        <label>Vai trò:</label>
        <select
          :value="modelValue.role"
          @change="updateFilter('role', $event.target.value)"
        >
          <option value="">Tất cả vai trò</option>
          <option value="student">Sinh viên</option>
          <option value="teacher">Giảng viên</option>
          <option value="staff">Giáo vụ</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Trạng thái:</label>
        <select
          :value="modelValue.status"
          @change="updateFilter('status', $event.target.value)"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Tạm khóa</option>
          <option value="pending">Chờ xác thực</option>
        </select>
      </div>

      <div class="filter-actions">
        <button @click="resetFilters" class="btn-reset">
          <i class="fas fa-undo"></i>
          Đặt lại
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({ role: '', status: '' })
  }
})

const emit = defineEmits(['update:modelValue', 'reset'])

const hasActiveFilters = computed(() => {
  return !!(props.modelValue.role || props.modelValue.status)
})

const updateFilter = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}

const resetFilters = () => {
  emit('update:modelValue', { role: '', status: '' })
  emit('reset')
}
</script>

<style scoped>
.filter-section {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border: 1px solid rgba(229, 231, 235, 0.6);
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid rgba(209, 213, 219, 0.6);
  border-radius: 8px;
  background: white;
  font-size: 14px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.btn-reset {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.06);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.12);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-actions {
    margin-left: 0;
    justify-content: center;
  }
}
</style>