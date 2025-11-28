<template>
  <div class="schedule-filters">
    <div class="filters-header">
      <h3>
        <i class="fas fa-filter"></i>
        Bộ lọc
      </h3>
      <button @click="$emit('reset-filters')" class="btn-reset">
        <i class="fas fa-undo"></i>
        Đặt lại
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
            :value="filters.search"
            @input="updateFilter('search', $event.target.value)"
            placeholder="Tên môn học, giáo viên, phòng..."
          />
        </div>
      </div>

      <!-- Semester -->
      <div class="filter-group">
        <label>Học kỳ</label>
        <select 
          :value="filters.semester"
          @change="updateFilter('semester', $event.target.value)"
        >
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
        <select 
          :value="filters.teacher"
          @change="updateFilter('teacher', $event.target.value)"
        >
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
      <!-- Day of Week -->
      <div class="filter-group">
        <label>Thứ trong tuần</label>
        <select 
          :value="filters.dayOfWeek"
          @change="updateFilter('dayOfWeek', $event.target.value)"
        >
          <option value="">Tất cả các ngày</option>
          <option value="1">Thứ Hai</option>
          <option value="2">Thứ Ba</option>
          <option value="3">Thứ Tư</option>
          <option value="4">Thứ Năm</option>
          <option value="5">Thứ Sáu</option>
          <option value="6">Thứ Bảy</option>
          <option value="7">Chủ Nhật</option>
        </select>
      </div>

      <!-- Time Slot (for class schedules) -->
      <div v-if="activeTab !== 'exam'" class="filter-group">
        <label>Tiết học</label>
        <select 
          :value="filters.timeSlot"
          @change="updateFilter('timeSlot', $event.target.value)"
        >
          <option value="">Tất cả tiết</option>
          <option value="7:00-9:00">Tiết 1-2 (7:00-9:00)</option>
          <option value="9:00-11:00">Tiết 3-4 (9:00-11:00)</option>
          <option value="13:00-15:00">Tiết 5-6 (13:00-15:00)</option>
          <option value="15:00-17:00">Tiết 7-8 (15:00-17:00)</option>
          <option value="18:00-20:00">Tiết 9-10 (18:00-20:00)</option>
        </select>
      </div>
    </div>

    <!-- Active Filters -->
    <div v-if="hasActiveFilters" class="active-filters">
      <span class="active-filters-label">Bộ lọc đang áp dụng:</span>
      <div class="filter-tags">
        <span 
          v-for="filter in activeFiltersList" 
          :key="filter.key"
          class="filter-tag"
        >
          {{ filter.label }}: {{ filter.value }}
          <button @click="clearFilter(filter.key)" class="remove-filter">
            <i class="fas fa-times"></i>
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ScheduleFilters',
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
    },
    subjects: {
      type: Array,
      default: () => []
    },
    activeTab: {
      type: String,
      default: 'class'
    }
  },
  emits: ['update:filters', 'reset-filters'],
  setup(props, { emit }) {
    const updateFilter = (key, value) => {
      emit('update:filters', { [key]: value })
    }

    const clearFilter = (key) => {
      emit('update:filters', { [key]: '' })
    }

    const hasActiveFilters = computed(() => {
      return Object.values(props.filters).some(value => value !== '')
    })

    const activeFiltersList = computed(() => {
      const list = []
      const labelMap = {
        search: 'Tìm kiếm',
        semester: 'Học kỳ',
        subject: 'Môn học',
        teacher: 'Giáo viên',
        room: 'Phòng học',
        dayOfWeek: 'Thứ',
        timeSlot: 'Tiết học',
        examType: 'Loại thi',
        status: 'Trạng thái'
      }

      Object.entries(props.filters).forEach(([key, value]) => {
        if (value) {
          let displayValue = value
          
          // Convert IDs to names for better display
          if (key === 'semester') {
            const semester = props.semesters.find(s => s.id == value)
            displayValue = semester?.name || value
          } else if (key === 'subject') {
            const subject = props.subjects.find(s => s.id == value)
            displayValue = subject ? `${subject.code} - ${subject.name}` : value
          } else if (key === 'teacher') {
            const teacher = props.teachers.find(t => t.id == value)
            displayValue = teacher?.name || value
          } else if (key === 'room') {
            const room = props.rooms.find(r => r.id == value)
            displayValue = room ? `${room.name} - ${room.building}` : value
          } else if (key === 'dayOfWeek') {
            const days = {
              '1': 'Thứ Hai',
              '2': 'Thứ Ba',
              '3': 'Thứ Tư',
              '4': 'Thứ Năm',
              '5': 'Thứ Sáu',
              '6': 'Thứ Bảy',
              '7': 'Chủ Nhật'
            }
            displayValue = days[value] || value
          } else if (key === 'examType') {
            const types = {
              'midterm': 'Giữa kỳ',
              'final': 'Cuối kỳ',
              'makeup': 'Thi lại',
              'improvement': 'Thi cải thiện'
            }
            displayValue = types[value] || value
          } else if (key === 'status') {
            const statuses = {
              'scheduled': 'Đã xếp lịch',
              'draft': 'Nháp',
              'cancelled': 'Đã hủy',
              'completed': 'Hoàn thành'
            }
            displayValue = statuses[value] || value
          }

          list.push({
            key,
            label: labelMap[key],
            value: displayValue
          })
        }
      })

      return list
    })

    return {
      updateFilter,
      clearFilter,
      hasActiveFilters,
      activeFiltersList
    }
  }
}
</script>

<style scoped>
.schedule-filters {
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
  font-size: 18px;
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
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #e2e8f0;
  color: #334155;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
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
  padding: 10px 12px 10px 40px;
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

select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.active-filters {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.active-filters-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  display: block;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.remove-filter {
  background: none;
  border: none;
  color: #1e40af;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.remove-filter:hover {
  background: rgba(30, 64, 175, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .schedule-filters {
    padding: 16px;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .filters-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .filter-tags {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>