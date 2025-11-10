<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-chalkboard-teacher"></i>
          Gán giáo viên cho {{ subjects.length }} môn học
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Selected Subjects List -->
        <div class="selected-subjects">
          <h4>
            <i class="fas fa-list"></i>
            Môn học đã chọn
          </h4>
          <div class="subjects-list">
            <div 
              v-for="subject in subjects" 
              :key="subject.id" 
              class="subject-item"
            >
              <div class="subject-info">
                <span class="subject-code">{{ subject.code }}</span>
                <span class="subject-name">{{ subject.name }}</span>
              </div>
              <div class="current-teacher">
                <span v-if="subject.teacherId" class="has-teacher">
                  <i class="fas fa-user"></i>
                  {{ subject.teacherName }}
                </span>
                <span v-else class="no-teacher">
                  <i class="fas fa-user-slash"></i>
                  Chưa có giáo viên
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Teacher Selection -->
        <div class="teacher-selection">
          <h4>
            <i class="fas fa-user-check"></i>
            Chọn giáo viên
          </h4>
          
          <!-- Search Teachers -->
          <div class="search-teachers">
            <div class="search-input">
              <i class="fas fa-search"></i>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Tìm kiếm giáo viên theo tên hoặc chuyên môn..."
              />
            </div>
          </div>
          
          <!-- Teachers Grid -->
          <div class="teachers-grid">
            <div 
              v-for="teacher in filteredTeachers" 
              :key="teacher.id"
              class="teacher-card"
              :class="{ selected: selectedTeacherId === teacher.id }"
              @click="selectTeacher(teacher)"
            >
              <div class="teacher-info">
                <div class="teacher-name">{{ teacher.name }}</div>
                <div class="teacher-meta">
                  <span class="department">{{ teacher.department }}</span>
                  <span class="specialization">{{ teacher.specialization }}</span>
                </div>
                <div class="teacher-email">{{ teacher.email }}</div>
              </div>
              <div class="selection-indicator">
                <i v-if="selectedTeacherId === teacher.id" class="fas fa-check-circle"></i>
                <i v-else class="far fa-circle"></i>
              </div>
            </div>
            
            <!-- No Teacher Option -->
            <div 
              class="teacher-card no-teacher-option"
              :class="{ selected: selectedTeacherId === null }"
              @click="selectTeacher(null)"
            >
              <div class="teacher-info">
                <div class="teacher-name">Không gán giáo viên</div>
                <div class="teacher-meta">
                  <span class="description">Bỏ gán giáo viên khỏi các môn học đã chọn</span>
                </div>
              </div>
              <div class="selection-indicator">
                <i v-if="selectedTeacherId === null" class="fas fa-check-circle"></i>
                <i v-else class="far fa-circle"></i>
              </div>
            </div>
          </div>
          
          <!-- No Results -->
          <div v-if="filteredTeachers.length === 0 && searchQuery" class="no-results">
            <i class="fas fa-search"></i>
            <p>Không tìm thấy giáo viên nào phù hợp</p>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">
          <i class="fas fa-times"></i>
          Hủy bỏ
        </button>
        <button @click="handleSave" class="btn-save" :disabled="selectedTeacherId === undefined">
          <i class="fas fa-save"></i>
          Gán giáo viên
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'TeacherAssignModal',
  props: {
    subjects: {
      type: Array,
      required: true
    },
    teachers: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const selectedTeacherId = ref(undefined)
    
    const filteredTeachers = computed(() => {
      if (!searchQuery.value) return props.teachers
      
      const query = searchQuery.value.toLowerCase()
      return props.teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(query) ||
        teacher.specialization.toLowerCase().includes(query) ||
        teacher.department.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query)
      )
    })
    
    const selectTeacher = (teacher) => {
      selectedTeacherId.value = teacher ? teacher.id : null
    }
    
    const handleSave = () => {
      if (selectedTeacherId.value === undefined) return
      
      const teacherData = {
        teacherId: selectedTeacherId.value,
        teacherName: selectedTeacherId.value ? 
          props.teachers.find(t => t.id === selectedTeacherId.value)?.name : null
      }
      
      emit('save', teacherData)
    }
    
    const handleOverlayClick = () => {
      emit('close')
    }
    
    return {
      searchQuery,
      selectedTeacherId,
      filteredTeachers,
      selectTeacher,
      handleSave,
      handleOverlayClick
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.modal-header h3 i {
  color: #f59e0b;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.selected-subjects h4,
.teacher-selection h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.selected-subjects h4 i {
  color: #3b82f6;
}

.teacher-selection h4 i {
  color: #f59e0b;
}

.subjects-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.subject-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.subject-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.subject-code {
  font-family: monospace;
  font-size: 12px;
  background: #f3f4f6;
  padding: 2px 4px;
  border-radius: 4px;
  color: #374151;
}

.subject-name {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
}

.current-teacher {
  font-size: 12px;
}

.has-teacher {
  color: #059669;
  display: flex;
  align-items: center;
  gap: 4px;
}

.no-teacher {
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 4px;
}

.search-input {
  position: relative;
  margin-bottom: 16px;
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
  padding: 12px 12px 12px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.teachers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.teacher-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.teacher-card:hover {
  border-color: #3b82f6;
  background: #f9fafb;
}

.teacher-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.teacher-card.no-teacher-option {
  border-style: dashed;
  border-color: #9ca3af;
}

.teacher-card.no-teacher-option:hover {
  border-color: #ef4444;
  background: #fef2f2;
}

.teacher-card.no-teacher-option.selected {
  border-color: #ef4444;
  background: #fef2f2;
}

.teacher-info {
  flex: 1;
}

.teacher-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.teacher-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 4px;
}

.department {
  font-size: 12px;
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.specialization,
.description {
  font-size: 12px;
  color: #6b7280;
}

.teacher-email {
  font-size: 11px;
  color: #9ca3af;
  font-family: monospace;
}

.selection-indicator {
  margin-left: 12px;
  font-size: 18px;
}

.teacher-card.selected .selection-indicator {
  color: #3b82f6;
}

.teacher-card.no-teacher-option.selected .selection-indicator {
  color: #ef4444;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #9ca3af;
  text-align: center;
}

.no-results i {
  font-size: 32px;
  margin-bottom: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-cancel {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #f59e0b;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #d97706;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 10px;
    max-width: none;
  }
  
  .teachers-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .subject-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}
</style>