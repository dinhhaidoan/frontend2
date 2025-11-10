<template>
  <div class="subject-filters">
    <div class="filters-header">
      <h3>
        <i class="fas fa-filter"></i>
        Lọc và tìm kiếm
      </h3>
      <button @click="resetFilters" class="btn-reset" v-if="hasActiveFilters">
        <i class="fas fa-times"></i>
        Xóa bộ lọc
      </button>
    </div>
    
    <div class="filters-grid">
      <!-- Search -->
      <div class="filter-group">
        <label>Tìm kiếm</label>
        <div class="search-input">
          <i class="fas fa-search"></i>
          <input
            type="text"
            v-model="localFilters.search"
            placeholder="Tìm theo tên, mã môn, giáo viên..."
            @input="updateFilters"
          />
        </div>
      </div>
      
      <!-- Semester -->
      <div class="filter-group">
        <label>Học kỳ</label>
        <select v-model="localFilters.semester" @change="updateFilters">
          <option value="">Tất cả học kỳ</option>
          <option 
            v-for="semester in semesters" 
            :key="semester.id" 
            :value="semester.id"
          >
            {{ semester.name }}
          </option>
        </select>
      </div>
      
      <!-- Teacher -->
      <div class="filter-group">
        <label>Giáo viên</label>
        <select v-model="localFilters.teacher" @change="updateFilters">
          <option value="">Tất cả giáo viên</option>
          <option 
            v-for="teacher in teachers" 
            :key="teacher.id" 
            :value="teacher.id"
          >
            {{ teacher.name }}
          </option>
        </select>
      </div>
      
      <!-- Room -->
      <div class="filter-group">
        <label>Phòng học</label>
        <select v-model="localFilters.room" @change="updateFilters">
          <option value="">Tất cả phòng</option>
          <option 
            v-for="room in rooms" 
            :key="room.id" 
            :value="room.id"
          >
            {{ room.name }} - {{ room.building }}
          </option>
        </select>
      </div>
      
      <!-- Status -->
      <div class="filter-group">
        <label>Trạng thái</label>
        <select v-model="localFilters.status" @change="updateFilters">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
          <option value="pending">Chờ duyệt</option>
        </select>
      </div>
      
      <!-- Registration Status -->
      <div class="filter-group">
        <label>Đăng ký</label>
        <select v-model="localFilters.registrationStatus" @change="updateFilters">
          <option value="">Tất cả</option>
          <option value="open">Mở đăng ký</option>
          <option value="closed">Đóng đăng ký</option>
        </select>
      </div>
      
      <!-- Department -->
      <div class="filter-group">
        <label>Khoa/Bộ môn</label>
        <select v-model="localFilters.department" @change="updateFilters">
          <option value="">Tất cả khoa</option>
          <option value="CNTT">Công nghệ thông tin</option>
          <option value="DTVT">Điện tử viễn thông</option>
          <option value="TOÁN">Toán ứng dụng</option>
        </select>
      </div>
      
      <!-- Credits -->
      <div class="filter-group">
        <label>Số tín chỉ</label>
        <select v-model="localFilters.credits" @change="updateFilters">
          <option value="">Tất cả</option>
          <option value="1">1 tín chỉ</option>
          <option value="2">2 tín chỉ</option>
          <option value="3">3 tín chỉ</option>
          <option value="4">4 tín chỉ</option>
          <option value="5">5+ tín chỉ</option>
        </select>
      </div>
    </div>
    
    <!-- Active Filters Display -->
    <div class="active-filters" v-if="hasActiveFilters">
      <span class="active-filters-label">Bộ lọc đang áp dụng:</span>
      <div class="active-filters-list">
        <span v-if="localFilters.search" class="filter-tag">
          Tìm kiếm: "{{ localFilters.search }}"
          <i class="fas fa-times" @click="removeFilter('search')"></i>
        </span>
        <span v-if="localFilters.semester" class="filter-tag">
          {{ getSemesterName(localFilters.semester) }}
          <i class="fas fa-times" @click="removeFilter('semester')"></i>
        </span>
        <span v-if="localFilters.teacher" class="filter-tag">
          {{ getTeacherName(localFilters.teacher) }}
          <i class="fas fa-times" @click="removeFilter('teacher')"></i>
        </span>
        <span v-if="localFilters.room" class="filter-tag">
          {{ getRoomName(localFilters.room) }}
          <i class="fas fa-times" @click="removeFilter('room')"></i>
        </span>
        <span v-if="localFilters.status" class="filter-tag">
          {{ getStatusLabel(localFilters.status) }}
          <i class="fas fa-times" @click="removeFilter('status')"></i>
        </span>
        <span v-if="localFilters.registrationStatus" class="filter-tag">
          {{ getRegistrationStatusLabel(localFilters.registrationStatus) }}
          <i class="fas fa-times" @click="removeFilter('registrationStatus')"></i>
        </span>
        <span v-if="localFilters.department" class="filter-tag">
          {{ localFilters.department }}
          <i class="fas fa-times" @click="removeFilter('department')"></i>
        </span>
        <span v-if="localFilters.credits" class="filter-tag">
          {{ localFilters.credits }} tín chỉ
          <i class="fas fa-times" @click="removeFilter('credits')"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'SubjectFilters',
  props: {
    filters: {
      type: Object,
      required: true
    },
    semesters: {
      type: Array,
      default: () => []
    },
    teachers: {
      type: Array,
      default: () => []
    },
    rooms: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:filters', 'reset-filters'],
  setup(props, { emit }) {
    const localFilters = ref({ ...props.filters })
    
    const hasActiveFilters = computed(() => {
      return Object.values(localFilters.value).some(value => value !== '' && value !== null)
    })
    
    const updateFilters = () => {
      emit('update:filters', localFilters.value)
    }
    
    const resetFilters = () => {
      localFilters.value = {
        search: '',
        semester: '',
        teacher: '',
        room: '',
        status: '',
        registrationStatus: '',
        department: '',
        credits: ''
      }
      emit('reset-filters')
    }
    
    const removeFilter = (filterKey) => {
      localFilters.value[filterKey] = ''
      updateFilters()
    }
    
    // Helper methods for display names
    const getSemesterName = (semesterId) => {
      const semester = props.semesters.find(s => s.id == semesterId)
      return semester ? semester.name : ''
    }
    
    const getTeacherName = (teacherId) => {
      const teacher = props.teachers.find(t => t.id == teacherId)
      return teacher ? teacher.name : ''
    }
    
    const getRoomName = (roomId) => {
      const room = props.rooms.find(r => r.id == roomId)
      return room ? `${room.name} - ${room.building}` : ''
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        active: 'Hoạt động',
        inactive: 'Không hoạt động',
        pending: 'Chờ duyệt'
      }
      return labels[status] || status
    }
    
    const getRegistrationStatusLabel = (status) => {
      const labels = {
        open: 'Mở đăng ký',
        closed: 'Đóng đăng ký'
      }
      return labels[status] || status
    }
    
    // Watch for external filter changes
    watch(() => props.filters, (newFilters) => {
      localFilters.value = { ...newFilters }
    }, { deep: true })
    
    return {
      localFilters,
      hasActiveFilters,
      updateFilters,
      resetFilters,
      removeFilter,
      getSemesterName,
      getTeacherName,
      getRoomName,
      getStatusLabel,
      getRegistrationStatusLabel
    }
  }
}
</script>

<style scoped>
.subject-filters {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.filters-header h3 i {
  color: #3b82f6;
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #ef4444;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #dc2626;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.search-input {
  position: relative;
}

.search-input i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.search-input input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-group select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.active-filters {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.active-filters-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  display: block;
}

.active-filters-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  font-size: 12px;
  color: #1e40af;
}

.filter-tag i {
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  transition: all 0.2s;
}

.filter-tag i:hover {
  background: #1e40af;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .subject-filters {
    padding: 16px;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .filters-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .active-filters-list {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>