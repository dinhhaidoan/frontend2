<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-book"></i>
          {{ isEdit ? 'Chỉnh sửa môn học' : 'Thêm môn học mới' }}
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <!-- Framework Subject Selection -->
            <div class="form-group full-width">
              <label class="required">Chọn môn học từ chương trình khung</label>
              <select 
                v-model="formData.frameworkSubjectId" 
                required
                @change="handleFrameworkSubjectChange"
              >
                <option value="">-- Chọn môn học --</option>
                <option 
                  v-for="fwSubject in frameworkSubjects" 
                  :key="fwSubject.id" 
                  :value="fwSubject.id"
                >
                  {{ fwSubject.code }} - {{ fwSubject.name }} ({{ fwSubject.credits }} TC)
                </option>
              </select>
            </div>
            
            <!-- Subject Code -->
            <div class="form-group">
              <label class="required">Mã môn học</label>
              <input
                type="text"
                v-model="formData.code"
                required
                placeholder="VD: CS101-01"
              />
              <small>Mã môn sẽ được tạo tự động dựa trên môn gốc</small>
            </div>
            
            <!-- Subject Name -->
            <div class="form-group">
              <label class="required">Tên môn học</label>
              <input
                type="text"
                v-model="formData.name"
                required
                readonly
              />
            </div>
            
            <!-- Semester -->
            <div class="form-group">
              <label class="required">Học kỳ</label>
              <select v-model="formData.semesterId" required>
                <option value="">-- Chọn học kỳ --</option>
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
            <div class="form-group">
              <label>Giáo viên phụ tr책</label>
              <select v-model="formData.teacherId">
                <option value="">-- Chọn giáo viên --</option>
                <option 
                  v-for="teacher in teachers" 
                  :key="teacher.id" 
                  :value="teacher.id"
                >
                  {{ teacher.name }} - {{ teacher.specialization }}
                </option>
              </select>
            </div>
            
            <!-- Room -->
            <div class="form-group">
              <label>Phòng học</label>
              <select v-model="formData.roomId">
                <option value="">-- Chọn phòng học --</option>
                <option 
                  v-for="room in rooms" 
                  :key="room.id" 
                  :value="room.id"
                >
                  {{ room.name }} - {{ room.building }} ({{ room.capacity }} chỗ)
                </option>
              </select>
            </div>
            
            <!-- Credits -->
            <div class="form-group">
              <label>Số tín chỉ</label>
              <input
                type="number"
                v-model.number="formData.credits"
                min="1"
                max="10"
                readonly
              />
            </div>
            
            <!-- Max Students -->
            <div class="form-group">
              <label class="required">Số sinh viên tối đa</label>
              <input
                type="number"
                v-model.number="formData.maxStudents"
                min="1"
                max="200"
                required
              />
            </div>
            
            <!-- Status -->
            <div class="form-group">
              <label>Trạng thái</label>
              <select v-model="formData.status">
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="pending">Chờ duyệt</option>
              </select>
            </div>
            
            <!-- Registration Open -->
            <div class="form-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="formData.registrationOpen"
                />
                <span class="checkmark"></span>
                Mở đăng ký cho sinh viên
              </label>
            </div>
            
            <!-- Description -->
            <div class="form-group full-width">
              <label>Mô tả</label>
              <textarea
                v-model="formData.description"
                rows="3"
                placeholder="Mô tả chi tiết về môn học..."
              ></textarea>
            </div>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">
          <i class="fas fa-times"></i>
          Hủy bỏ
        </button>
        <button @click="handleSubmit" class="btn-save" :disabled="!isFormValid">
          <i class="fas fa-save"></i>
          {{ isEdit ? 'Cập nhật' : 'Tạo môn học' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'SubjectModal',
  props: {
    subject: {
      type: Object,
      default: null
    },
    frameworkSubjects: {
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
    semesters: {
      type: Array,
      default: () => []
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const formData = ref({
      frameworkSubjectId: '',
      code: '',
      name: '',
      semesterId: '',
      teacherId: '',
      roomId: '',
      credits: 0,
      maxStudents: 40,
      status: 'active',
      registrationOpen: false,
      description: '',
      schedule: '',
      department: ''
    })

    // Schedule selection variables
    const scheduleMode = ref('single')
    const selectedDay = ref('')
    const selectedTimeSlots = ref([])
    const scheduleDays = ref([])

    // Time slot options
    const timeSlotOptions = ref([
      { value: '1', label: 'Tiết 1', time: '07:00-07:45' },
      { value: '2', label: 'Tiết 2', time: '07:50-08:35' },
      { value: '3', label: 'Tiết 3', time: '08:40-09:25' },
      { value: '4', label: 'Tiết 4', time: '09:35-10:20' },
      { value: '5', label: 'Tiết 5', time: '10:25-11:10' },
      { value: '6', label: 'Tiết 6', time: '13:00-13:45' },
      { value: '7', label: 'Tiết 7', time: '13:50-14:35' },
      { value: '8', label: 'Tiết 8', time: '14:40-15:25' },
      { value: '9', label: 'Tiết 9', time: '15:35-16:20' },
      { value: '10', label: 'Tiết 10', time: '16:25-17:10' },
      { value: '11', label: 'Tiết 11', time: '18:00-18:45' },
      { value: '12', label: 'Tiết 12', time: '18:50-19:35' },
      { value: '13', label: 'Tiết 13', time: '19:40-20:25' }
    ])

    const isFormValid = computed(() => {
      return formData.value.frameworkSubjectId &&
             formData.value.code &&
             formData.value.name &&
             formData.value.semesterId &&
             formData.value.maxStudents > 0
    })
    
    const initializeForm = () => {
      if (props.subject) {
        formData.value = { ...props.subject }
      } else {
        formData.value = {
          frameworkSubjectId: '',
          code: '',
          name: '',
          semesterId: '',
          teacherId: '',
          roomId: '',
          credits: 0,
          maxStudents: 40,
          status: 'active',
          registrationOpen: false,
          description: '',
          schedule: '',
          department: ''
        }
      }
    }
    
    const handleFrameworkSubjectChange = () => {
      const selectedSubject = props.frameworkSubjects.find(
        s => s.id == formData.value.frameworkSubjectId
      )
      
      if (selectedSubject) {
        // Generate unique code
        const baseCode = selectedSubject.code
        const existingCodes = [] // This should come from existing subjects
        let counter = 1
        let newCode = `${baseCode}-${counter.toString().padStart(2, '0')}`
        
        while (existingCodes.includes(newCode)) {
          counter++
          newCode = `${baseCode}-${counter.toString().padStart(2, '0')}`
        }
        
        formData.value.code = newCode
        formData.value.name = selectedSubject.name
        formData.value.credits = selectedSubject.credits
        formData.value.description = selectedSubject.description
        formData.value.department = selectedSubject.department
      }
    }
    
    // Schedule handling functions
    const isSlotAvailable = (slotValue) => {
      // Check if slot is already used in other days
      return !scheduleDays.value.some(day => 
        day.slots.includes(slotValue) && day.day !== selectedDay.value
      )
    }

    const getSelectedSlotsText = () => {
      if (selectedTimeSlots.value.length === 0) return ''
      
      const slots = selectedTimeSlots.value
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(slotValue => {
          const slot = timeSlotOptions.value.find(s => s.value === slotValue)
          return slot ? `${slot.label} (${slot.time})` : slotValue
        })
      
      return slots.join(', ')
    }

    const getSelectedDuration = () => {
      return selectedTimeSlots.value.length * 45 // 45 minutes per slot
    }

    const addScheduleDay = () => {
      if (selectedDay.value && selectedTimeSlots.value.length > 0) {
        // Remove existing schedule for this day
        scheduleDays.value = scheduleDays.value.filter(day => day.day !== selectedDay.value)
        
        // Add new schedule
        scheduleDays.value.push({
          day: selectedDay.value,
          slots: [...selectedTimeSlots.value],
          slotsText: getSelectedSlotsText(),
          duration: getSelectedDuration()
        })

        // Update formData.schedule with combined schedule
        updateCombinedSchedule()

        // Clear selections
        selectedTimeSlots.value = []
      }
    }

    const removeScheduleDay = (index) => {
      scheduleDays.value.splice(index, 1)
      updateCombinedSchedule()
    }

    const updateCombinedSchedule = () => {
      if (scheduleDays.value.length > 0) {
        const scheduleText = scheduleDays.value
          .map(day => `Thứ ${day.day}: ${day.slotsText}`)
          .join(' | ')
        formData.value.schedule = scheduleText
      } else {
        formData.value.schedule = ''
      }
    }

    // Watch for schedule mode changes
    watch(scheduleMode, (newMode) => {
      if (newMode === 'single') {
        selectedDay.value = ''
        selectedTimeSlots.value = []
        scheduleDays.value = []
        // Keep existing schedule text for single mode
      } else {
        // Clear single schedule when switching to multiple
        if (formData.value.schedule && !formData.value.schedule.includes('Thứ')) {
          formData.value.schedule = ''
        }
      }
    })

    const handleSubmit = () => {
      if (!isFormValid.value) return
      
      // Add schedule data for multiple mode
      if (scheduleMode.value === 'multiple' && scheduleDays.value.length > 0) {
        formData.value.scheduleDays = scheduleDays.value
        formData.value.hasMultipleSchedule = true
      } else {
        formData.value.hasMultipleSchedule = false
      }
      
      // Add teacher name and room name for display
      if (formData.value.teacherId) {
        const teacher = props.teachers.find(t => t.id == formData.value.teacherId)
        formData.value.teacherName = teacher ? teacher.name : ''
      }
      
      if (formData.value.roomId) {
        const room = props.rooms.find(r => r.id == formData.value.roomId)
        formData.value.roomName = room ? room.name : ''
      }
      
      emit('save', formData.value)
    }
    
    const handleOverlayClick = () => {
      emit('close')
    }
    
    // Watch for subject changes
    watch(() => props.subject, () => {
      initializeForm()
    }, { immediate: true })
    
    onMounted(() => {
      initializeForm()
    })
    
    return {
      formData,
      isFormValid,
      scheduleMode,
      selectedDay,
      selectedTimeSlots,
      scheduleDays,
      timeSlotOptions,
      handleFrameworkSubjectChange,
      handleSubmit,
      handleOverlayClick,
      isSlotAvailable,
      getSelectedSlotsText,
      getSelectedDuration,
      addScheduleDay,
      removeScheduleDay
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
  color: #3b82f6;
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
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input[readonly] {
  background: #f9fafb;
  color: #6b7280;
}

.form-group small {
  font-size: 12px;
  color: #6b7280;
  margin-top: -2px;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
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
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #2563eb;
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
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}

/* Schedule Selection Styles */
.schedule-selection-mode {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
}

.schedule-selection-mode label {
  display: flex !important;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 500;
}

.single-schedule {
  margin-top: 8px;
}

.multiple-schedule {
  margin-top: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  background: #fefefe;
}

.day-time-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-slots-section {
  margin-top: 12px;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  margin-top: 8px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 12px;
}

.time-slot-checkbox {
  display: flex !important;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  cursor: pointer;
}

.time-slot-checkbox:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.time-slot-checkbox.selected {
  background: #dbeafe;
  border-color: #3b82f6;
}

.time-slot-checkbox.disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.time-slot-checkbox input[type="checkbox"] {
  margin: 0;
}

.slot-info {
  display: flex;
  flex-direction: column;
}

.slot-info small {
  color: #6b7280;
  font-size: 11px;
}

.selected-slots-preview {
  margin-top: 16px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 6px;
  font-size: 14px;
}

.selected-slots-preview h4 {
  margin: 0 0 8px 0;
  color: #0c4a6e;
  font-weight: 600;
}

.selected-slots-list {
  color: #0369a1;
  margin: 4px 0;
}

.total-duration {
  color: #0c4a6e;
  font-weight: 500;
  margin: 8px 0;
}

.btn-add-day {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-add-day:hover:not(:disabled) {
  background: #047857;
}

.btn-add-day:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.added-schedules {
  margin-top: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
}

.added-schedules h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-weight: 600;
}

.schedule-day-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 8px;
}

.schedule-info {
  flex: 1;
}

.schedule-info strong {
  color: #374151;
}

.schedule-info small {
  color: #6b7280;
  margin-left: 8px;
}

.btn-remove-day {
  padding: 4px 8px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-remove-day:hover {
  background: #b91c1c;
}
</style>