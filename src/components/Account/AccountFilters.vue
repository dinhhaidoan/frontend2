<template>
  <div class="filter-section">
    <div class="search-container">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          :value="modelValue.searchQuery"
          @input="updateFilter('searchQuery', $event.target.value)"
          type="text" 
          placeholder="Tìm kiếm theo tên, email, mã số..."
        />
      </div>
    </div>
    
    <div class="filter-controls">
      <div class="filter-group">
        <label>Vai trò:</label>
        <select 
          :value="modelValue.selectedRole" 
          @change="updateFilter('selectedRole', $event.target.value)"
        >
          <option value="">Tất cả</option>
          <option value="student">Sinh viên</option>
          <option value="teacher">Giảng viên</option>
          <option value="staff">Giáo vụ</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Trạng thái:</label>
        <select 
          :value="modelValue.selectedStatus" 
          @change="updateFilter('selectedStatus', $event.target.value)"
        >
          <option value="">Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Tạm khóa</option>
          <option value="pending">Chờ xác thực</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Khoa/Phòng ban:</label>
        <select 
          :value="modelValue.selectedDepartment" 
          @change="updateFilter('selectedDepartment', $event.target.value)"
        >
          <option value="">Tất cả</option>
          <option value="cntt">Công nghệ thông tin</option>
          <option value="dtvt">Điện tử viễn thông</option>
          <option value="co-khi">Cơ khí</option>
          <option value="kinh-te">Kinh tế</option>
        </select>
      </div>
      
      <button @click="$emit('reset')" class="btn-reset">
        <i class="fas fa-undo"></i>
        Đặt lại
      </button>
    </div>
  </div>
</template>

<script setup>
// Vue compiler macros - no import needed

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      searchQuery: '',
      selectedRole: '',
      selectedStatus: '',
      selectedDepartment: ''
    })
  }
})

const emit = defineEmits(['update:modelValue', 'reset'])

const updateFilter = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}
</script>

<style scoped>
.filter-section {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.search-container {
  margin-bottom: 16px;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  min-width: 140px;
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  background: rgba(239, 68, 68, 0.15);
}

/* Responsive */
@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>