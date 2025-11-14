<template>
  <div class="note-filters">
    <div class="filters-container">
      <!-- Search Box -->
      <div class="search-section">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="localFilters.search"
            type="text" 
            placeholder="Tìm kiếm ghi chú theo tiêu đề, nội dung, tags..."
            @input="updateFilters"
          />
          <button 
            v-if="localFilters.search" 
            @click="clearSearch" 
            class="clear-search"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <!-- Filter Controls -->
      <div class="filter-controls">
        <div class="filter-group">
          <label>Danh mục:</label>
          <select v-model="localFilters.category" @change="updateFilters">
            <option value="">Tất cả</option>
            <option value="study">Học tập</option>
            <option value="project">Dự án</option>
            <option value="meeting">Cuộc họp</option>
            <option value="resource">Tài liệu</option>
            <option value="personal">Cá nhân</option>
            <option value="work">Công việc</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Trạng thái:</label>
          <select v-model="localFilters.status" @change="updateFilters">
            <option value="">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Độ ưu tiên:</label>
          <select v-model="localFilters.priority" @change="updateFilters">
            <option value="">Tất cả</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>
        </div>
        
        <button @click="resetFilters" class="btn-reset">
          <i class="fas fa-undo"></i>
          Đặt lại
        </button>
      </div>
      
      <!-- Quick Filters -->
      <div class="quick-filters">
        <span class="quick-filter-label">Lọc nhanh:</span>
        <button 
          @click="setQuickFilter('favorites')"
          class="quick-filter-btn"
          :class="{ active: isQuickFilterActive('favorites') }"
        >
          <i class="fas fa-heart"></i>
          Yêu thích
        </button>
        <button 
          @click="setQuickFilter('archived')"
          class="quick-filter-btn"
          :class="{ active: isQuickFilterActive('archived') }"
        >
          <i class="fas fa-archive"></i>
          Lưu trữ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      search: '',
      category: '',
      status: '',
      priority: '',
      dateRange: null
    })
  }
})

const emit = defineEmits(['update:modelValue', 'reset'])

const localFilters = ref(JSON.parse(JSON.stringify(props.modelValue)))
const activeQuickFilter = ref('')

watch(() => props.modelValue, (newFilters) => {
  localFilters.value = JSON.parse(JSON.stringify(newFilters))
}, { deep: true })

const updateFilters = () => {
  emit('update:modelValue', { ...localFilters.value })
}

const clearSearch = () => {
  localFilters.value.search = ''
  updateFilters()
}

const resetFilters = () => {
  localFilters.value = {
    search: '',
    category: '',
    status: '',
    priority: '',
    dateRange: null
  }
  activeQuickFilter.value = ''
  emit('reset')
}

const setQuickFilter = (filterType) => {
  // Reset other filters first
  localFilters.value = {
    search: '',
    category: '',
    status: '',
    priority: '',
    dateRange: null
  }
  
  if (activeQuickFilter.value === filterType) {
    // If already active, deactivate
    activeQuickFilter.value = ''
  } else {
    activeQuickFilter.value = filterType
    
    switch (filterType) {
      case 'favorites':
        localFilters.value.search = 'favorite:true'
        break
      case 'recent':
        localFilters.value.dateRange = '7days'
        break
      case 'archived':
        localFilters.value.search = 'archived:true'
        break
    }
  }
  
  updateFilters()
}

const isQuickFilterActive = (filterType) => {
  return activeQuickFilter.value === filterType
}
</script>

<style scoped>
.note-filters {
  margin-bottom: 32px;
}

.filters-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 24px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

/* Search Section */
.search-section {
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 600px;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #9ca3af;
  z-index: 1;
}

.search-box input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 12px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.clear-search {
  position: absolute;
  right: 12px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;  
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
}

.clear-search:hover {
  background: rgba(107, 114, 128, 0.2);
}

/* Filter Controls */
.filter-controls {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid rgba(209, 213, 219, 0.8);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.filter-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid rgba(107, 114, 128, 0.3);
  border-radius: 8px;
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  background: rgba(107, 114, 128, 0.15);
  transform: translateY(-1px);
}

/* Quick Filters */
.quick-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.quick-filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.quick-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-filter-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
  transform: translateY(-1px);
}

.quick-filter-btn.active {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .filters-container {
    padding: 20px;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .filter-group {
    justify-content: space-between;
  }
  
  .filter-group select {
    min-width: 140px;
  }
  
  .quick-filters {
    justify-content: flex-start;
  }
  
  .quick-filter-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>