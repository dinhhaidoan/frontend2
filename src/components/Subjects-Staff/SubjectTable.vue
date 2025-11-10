<template>
  <div class="subject-table">
    <div class="table-header">
      <div class="table-info">
        <span class="result-count">
          Hiển thị {{ subjects.length }} môn học
        </span>
      </div>
      
      <div class="table-actions">
        <button 
          v-if="selectedSubjects.length > 0"
          @click="$emit('select:subjects', [])"
          class="btn-clear-selection"
        >
          <i class="fas fa-times"></i>
          Bỏ chọn tất cả
        </button>
      </div>
    </div>
    
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="select-col">
              <input 
                type="checkbox" 
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th>Mã môn</th>
            <th>Tên môn học</th>
            <th>Học kỳ</th>
            <th>Giáo viên</th>
            <th>Phòng học</th>
            <th>Tín chỉ</th>
            <th>Sinh viên</th>
            <th>Trạng thái</th>
            <th>Đăng ký</th>
            <th class="actions-col">Thao tác</th>
          </tr>
        </thead>
        
        <tbody v-if="!loading">
          <tr 
            v-for="subject in subjects" 
            :key="subject.id"
            :class="{ 'selected': isSelected(subject.id) }"
          >
            <td>
              <input 
                type="checkbox" 
                :checked="isSelected(subject.id)"
                @change="toggleSelection(subject.id)"
              />
            </td>
            
            <td class="code-col">
              <span class="subject-code">{{ subject.code }}</span>
            </td>
            
            <td class="name-col">
              <div class="subject-name">{{ subject.name }}</div>
              <div class="subject-description">{{ subject.description }}</div>
            </td>
            
            <td class="semester-col">
              <span class="semester-name">{{ getSemesterName(subject.semesterId) }}</span>
            </td>
            
            <td class="teacher-col">
              <div class="teacher-info" v-if="subject.teacherId">
                <span class="teacher-name">{{ subject.teacherName }}</span>
              </div>
              <span class="no-teacher" v-else>Chưa gán</span>
            </td>
            
            <td class="room-col">
              <div class="room-info" v-if="subject.roomId">
                <span class="room-name">{{ subject.roomName }}</span>
              </div>
              <span class="no-room" v-else>Chưa gán</span>
            </td>
            
            <td class="credits-col">
              <span class="credits-badge">{{ subject.credits }} TC</span>
            </td>
            
            <td class="students-col">
              <div class="student-count">
                <span class="registered">{{ subject.registeredCount || 0 }}</span>
                <span class="separator">/</span>
                <span class="max">{{ subject.maxStudents || 0 }}</span>
              </div>
              <div class="progress-bar" v-if="subject.maxStudents > 0">
                <div 
                  class="progress-fill" 
                  :style="{ width: getRegistrationProgress(subject) + '%' }"
                ></div>
              </div>
            </td>
            
            <td class="status-col">
              <span 
                class="status-badge" 
                :class="subject.status"
              >
                {{ getStatusLabel(subject.status) }}
              </span>
            </td>
            
            <td class="registration-col">
              <button 
                @click="$emit('toggle:registration', subject)"
                class="registration-toggle"
                :class="{ active: subject.registrationOpen }"
              >
                <i :class="subject.registrationOpen ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
                {{ subject.registrationOpen ? 'Mở' : 'Đóng' }}
              </button>
            </td>
            
            <td class="actions-col">
              <div class="action-buttons">
                <button 
                  @click="$emit('view:subject', subject)"
                  class="action-btn view"
                  title="Xem chi tiết"
                >
                  <i class="fas fa-eye"></i>
                </button>
                
                <button 
                  @click="$emit('view:students', subject)"
                  class="action-btn students"
                  title="Xem sinh viên đăng ký"
                >
                  <i class="fas fa-user-graduate"></i>
                </button>
                
                <button 
                  @click="$emit('edit:subject', subject)"
                  class="action-btn edit"
                  title="Chỉnh sửa"
                >
                  <i class="fas fa-edit"></i>
                </button>
                
                <button 
                  @click="$emit('duplicate:subject', subject)"
                  class="action-btn duplicate"
                  title="Sao chép"
                >
                  <i class="fas fa-copy"></i>
                </button>
                
                <button 
                  @click="$emit('delete:subject', subject)"
                  class="action-btn delete"
                  title="Xóa"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Đang tải dữ liệu...</span>
      </div>
      
      <!-- Empty State -->
      <div v-if="!loading && subjects.length === 0" class="empty-state">
        <i class="fas fa-book-open"></i>
        <h3>Không có môn học nào</h3>
        <p>Chưa có môn học nào được tạo hoặc không có kết quả phù hợp với bộ lọc.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  name: 'SubjectTable',
  props: {
    subjects: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    selectedSubjects: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'select:subjects', 
    'edit:subject', 
    'delete:subject', 
    'view:subject', 
    'view:students',
    'duplicate:subject',
    'toggle:registration'
  ],
  setup(props, { emit }) {
    const selectedIds = computed(() => props.selectedSubjects.map(s => s.id))
    
    const isAllSelected = computed(() => {
      return props.subjects.length > 0 && 
             props.subjects.every(subject => selectedIds.value.includes(subject.id))
    })
    
    const isSelected = (subjectId) => {
      return selectedIds.value.includes(subjectId)
    }
    
    const toggleSelection = (subjectId) => {
      let newSelection = [...selectedIds.value]
      
      if (newSelection.includes(subjectId)) {
        newSelection = newSelection.filter(id => id !== subjectId)
      } else {
        newSelection.push(subjectId)
      }
      
      emit('select:subjects', newSelection)
    }
    
    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        emit('select:subjects', [])
      } else {
        emit('select:subjects', props.subjects.map(s => s.id))
      }
    }
    
    const getSemesterName = (semesterId) => {
      // This should be passed as a prop or accessed from a store
      const semesters = [
        { id: 1, name: 'Học kỳ I - 2024-2025' },
        { id: 2, name: 'Học kỳ II - 2024-2025' }
      ]
      const semester = semesters.find(s => s.id === semesterId)
      return semester ? semester.name : 'Không xác định'
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        active: 'Hoạt động',
        inactive: 'Không hoạt động',
        pending: 'Chờ duyệt'
      }
      return labels[status] || status
    }
    
    const getRegistrationProgress = (subject) => {
      if (!subject.maxStudents) return 0
      return Math.min(100, (subject.registeredCount || 0) / subject.maxStudents * 100)
    }
    
    return {
      selectedIds,
      isAllSelected,
      isSelected,
      toggleSelection,
      toggleSelectAll,
      getSemesterName,
      getStatusLabel,
      getRegistrationProgress
    }
  }
}
</script>

<style scoped>
.subject-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.result-count {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.btn-clear-selection {
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

.btn-clear-selection:hover {
  background: #dc2626;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f9fafb;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.data-table tr:hover {
  background: #f9fafb;
}

.data-table tr.selected {
  background: #eff6ff;
}

.select-col,
.actions-col {
  width: 60px;
  text-align: center;
}

.code-col {
  width: 120px;
}

.subject-code {
  font-family: monospace;
  font-weight: 600;
  color: #374151;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.name-col {
  min-width: 200px;
}

.subject-name {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 2px;
}

.subject-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
}

.semester-col {
  width: 160px;
}

.semester-name {
  font-size: 12px;
  color: #374151;
  background: #e0e7ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.teacher-col,
.room-col {
  width: 120px;
}

.teacher-name,
.room-name {
  font-size: 13px;
  color: #374151;
}

.no-teacher,
.no-room {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
}

.credits-col {
  width: 80px;
  text-align: center;
}

.credits-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.students-col {
  width: 100px;
}

.student-count {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 4px;
  font-size: 13px;
}

.registered {
  font-weight: 600;
  color: #0f172a;
}

.separator {
  color: #9ca3af;
}

.max {
  color: #6b7280;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #f3f4f6;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.status-col {
  width: 100px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fef2f2;
  color: #991b1b;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.registration-col {
  width: 100px;
}

.registration-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.registration-toggle.active {
  background: #dcfce7;
  border-color: #10b981;
  color: #059669;
}

.registration-toggle:not(.active) {
  color: #6b7280;
}

.registration-toggle:hover {
  background: #f3f4f6;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.action-btn.view {
  background: #eff6ff;
  color: #2563eb;
}

.action-btn.view:hover {
  background: #dbeafe;
}

.action-btn.students {
  background: #f0f9ff;
  color: #0ea5e9;
}

.action-btn.students:hover {
  background: #e0f2fe;
}

.action-btn.edit {
  background: #fef3c7;
  color: #d97706;
}

.action-btn.edit:hover {
  background: #fde68a;
}

.action-btn.duplicate {
  background: #f3e8ff;
  color: #7c3aed;
}

.action-btn.duplicate:hover {
  background: #e9d5ff;
}

.action-btn.delete {
  background: #fef2f2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #fee2e2;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-state i {
  font-size: 24px;
  margin-bottom: 12px;
  color: #3b82f6;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #d1d5db;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #374151;
}

.empty-state p {
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .data-table {
    font-size: 13px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px 12px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
}
</style>