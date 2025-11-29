<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-calendar-plus"></i>
          {{ isEdit ? 'Chỉnh sửa lịch học' : 'Thêm lịch học mới' }}
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <!-- Subject Selection -->
            <div class="form-group full-width">
              <label class="required">Chọn môn học</label>
              <select 
                v-model="formData.subjectId" 
                required
                @change="handleSubjectChange"
              >
                <option value="">-- Chọn môn học --</option>
                <option 
                  v-for="subject in subjects" 
                  :key="subject.id" 
                  :value="subject.id"
                >
                  {{ subject.code }} - {{ subject.name }}{{ subject.teacherName ? (' — ' + subject.teacherName) : '' }}
                </option>
              </select>
            </div>

            <!-- Subject Info Display -->
            <div v-if="selectedSubject" class="subject-info">
              <div class="info-grid">
                <div class="info-item">
                  <strong>Học kỳ:</strong> {{ selectedSubject.semesterName }}
                </div>
                <div class="info-item">
                  <strong>Phòng học:</strong> {{ selectedSubject.roomName }}
                </div>
              </div>
            </div>

            <!-- Schedule Type -->
            <div class="form-group">
              <label class="required">Loại lịch</label>
              <select v-model="formData.scheduleType" required>
                <option value="study">Lịch học</option>
                <option value="exam">Lịch thi</option>
              </select>
            </div>

            <!-- Group Selection (for practical classes) -->
            <div class="form-group">
              <label>Nhóm thực hành</label>
              <select v-model="formData.groupId">
                <option value="">-- Không chia nhóm --</option>
                <option value="group1">Nhóm 1</option>
                <option value="group2">Nhóm 2</option>
                <option value="group3">Nhóm 3</option>
                <option value="group4">Nhóm 4</option>
              </select>
              <small>Chọn nhóm nếu môn học có thực hành riêng</small>
            </div>

            <!-- Schedule Builder -->
            <div class="form-group full-width">
              <label class="required">Xếp lịch học</label>
              
              <!-- Multiple Days Selection -->
              <div class="schedule-builder">
                <div class="days-selection">
                  <label>Chọn các thứ trong tuần:</label>
                  <div class="days-checkboxes">
                    <label 
                      v-for="day in dayOptions" 
                      :key="day.value"
                      class="day-checkbox"
                      :class="{ 'selected': selectedDays.includes(day.value) }"
                    >
                      <input
                        type="checkbox"
                        :value="day.value"
                        v-model="selectedDays"
                      />
                      <span>{{ day.label }}</span>
                    </label>
                  </div>
                </div>

                <!-- Individual Day Schedule Setup -->
                <div v-if="selectedDays.length > 0" class="individual-days-setup">
                  <label>Thiết lập lịch học riêng cho từng ngày:</label>
                  
                  <div class="days-schedule-tabs">
                    <div class="tab-headers">
                      <button 
                        v-for="day in selectedDays" 
                        :key="day"
                        type="button"
                        class="tab-header"
                        :class="{ 'active': currentEditingDay === day }"
                        @click="currentEditingDay = day"
                      >
                        {{ getDayName(day) }}
                        <span v-if="dayScheduleData[day] && dayScheduleData[day].length > 0" class="badge">
                          {{ dayScheduleData[day].length }} tiết
                        </span>
                      </button>
                    </div>

                    <!-- Time Slots for Current Editing Day -->
                    <div v-if="currentEditingDay" class="tab-content">
                      <div class="day-header">
                        <h4>{{ getDayName(currentEditingDay) }}</h4>
                        <small>Chọn các tiết học cho ngày này:</small>
                      </div>
                      
                      <div class="time-slots-grid">
                        <label 
                          v-for="slot in timeSlotOptions" 
                          :key="slot.value"
                          class="time-slot-checkbox"
                          :class="{
                            'selected': isDaySlotSelected(currentEditingDay, slot.value),
                            'disabled': !isSlotAvailable(slot.value)
                          }"
                        >
                          <input
                            type="checkbox"
                            :value="slot.value"
                            :checked="isDaySlotSelected(currentEditingDay, slot.value)"
                            @change="toggleDaySlot(currentEditingDay, slot.value)"
                            :disabled="!isSlotAvailable(slot.value)"
                          />
                          <span class="slot-info">
                            <strong>{{ slot.label }}</strong>
                            <small>{{ slot.time }}</small>
                          </span>
                        </label>
                      </div>

                      <!-- Current Day Preview -->
                      <div v-if="dayScheduleData[currentEditingDay] && dayScheduleData[currentEditingDay].length > 0" class="current-day-preview">
                        <strong>{{ getDayName(currentEditingDay) }}:</strong> 
                        {{ getDaySlotText(currentEditingDay) }}
                        <span class="duration">({{ getDayDuration(currentEditingDay) }} phút)</span>
                      </div>
                    </div>
                  </div>

                  <!-- All Days Preview and Add Button -->
                  <div v-if="hasAnyDaySchedule" class="all-days-preview">
                    <h4>Tổng quan lịch học:</h4>
                    <div v-for="day in selectedDays" :key="day" class="preview-day">
                      <div v-if="dayScheduleData[day] && dayScheduleData[day].length > 0">
                        <strong>{{ getDayName(day) }}:</strong> {{ getDaySlotText(day) }}
                        <span class="duration">({{ getDayDuration(day) }} phút)</span>
                      </div>
                      <div v-else class="empty-day">
                        <strong>{{ getDayName(day) }}:</strong> <em>Chưa chọn tiết học</em>
                      </div>
                    </div>
                    
                    <button 
                      type="button" 
                      @click="addAllDaySchedules" 
                      class="btn-add-schedule"
                      :disabled="!hasValidSchedules"
                    >
                      <i class="fas fa-plus"></i>
                      Thêm tất cả lịch học ({{ getValidScheduleCount }} ngày)
                    </button>
                  </div>
                </div>

                <!-- Added Schedule Days -->
                <div v-if="scheduleDays.length > 0" class="added-schedules">
                  <h4>Lịch học đã thiết lập:</h4>
                  <div 
                    v-for="(daySchedule, index) in scheduleDays" 
                    :key="index" 
                    class="schedule-day-item"
                  >
                    <div class="day-info">
                      <div class="day-header">
                        <strong>{{ getDayName(daySchedule.day) }}</strong>
                        <span class="group-badge" v-if="formData.groupId">{{ getGroupName(formData.groupId) }}</span>
                      </div>
                      <div class="slots-info">{{ daySchedule.slotsText }}</div>
                      <div class="duration-info">{{ daySchedule.duration }} phút</div>
                    </div>
                    <button 
                      type="button" 
                      @click="removeScheduleDay(index)"
                      class="btn-remove-day"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Start Date -->
            <div class="form-group">
              <label class="required">Ngày bắt đầu</label>
              <input
                type="date"
                v-model="formData.startDate"
                required
              />
            </div>

            <!-- End Date -->
            <div class="form-group">
              <label>Ngày kết thúc</label>
              <input
                type="date"
                v-model="formData.endDate"
              />
              <small>Để trống nếu chỉ tạo lịch cho một buổi</small>
            </div>

            <!-- Repeat Options -->
            <div class="form-group full-width">
              <label>Tùy chọn lặp lại</label>
              <div class="repeat-options">
                <label class="radio-option">
                  <input type="radio" v-model="formData.repeatType" value="none" />
                  <span>Không lặp lại</span>
                </label>
                <label class="radio-option">
                  <input type="radio" v-model="formData.repeatType" value="weekly" />
                  <span>Hàng tuần</span>
                </label>
                <label class="radio-option">
                  <input type="radio" v-model="formData.repeatType" value="custom_weeks" />
                  <span>Tùy chỉnh</span>
                </label>
              </div>
            </div>

            <!-- Custom Repeat Settings -->
            <div v-if="formData.repeatType === 'custom_weeks'" class="form-group full-width">
              <label>Cài đặt lặp lại</label>
              <div class="custom-repeat">
                <div class="repeat-row">
                  <span>Lặp lại mỗi</span>
                  <input 
                    type="number" 
                    v-model="formData.repeatInterval" 
                    min="1" 
                    max="4"
                    class="repeat-input"
                  />
                  <span>tuần</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="$emit('close')" class="btn-cancel">
              Hủy
            </button>
            <button type="submit" class="btn-save" :disabled="!isFormValid">
              <i class="fas fa-save"></i>
              {{ isEdit ? 'Cập nhật' : 'Tạo lịch học' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'ScheduleModal',
  props: {
    schedule: {
      type: Object,
      default: null
    },
    subjects: {
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
      subjectId: '',
      scheduleType: 'study',
      groupId: '',
      startDate: '',
      endDate: '',
      repeatType: 'weekly',
      repeatInterval: 1,
      status: 'scheduled',
      notes: ''
    })

    // Schedule building variables
    const selectedDays = ref([])
    const scheduleDays = ref([])
    const selectedSubject = ref(null)
    
    // Individual day schedule data
    const currentEditingDay = ref('')
    const dayScheduleData = ref({}) // { '2': ['1', '2', '3'], '4': ['6', '7'] }

    const dayOptions = [
      { value: '2', label: 'Thứ Hai' },
      { value: '3', label: 'Thứ Ba' },
      { value: '4', label: 'Thứ Tư' },
      { value: '5', label: 'Thứ Năm' },
      { value: '6', label: 'Thứ Sáu' },
      { value: '7', label: 'Thứ Bảy' },
      { value: '8', label: 'Chủ Nhật' }
    ]

    const timeSlotOptions = [
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
    ]

    // Handle subject selection
    const handleSubjectChange = () => {
      const subject = props.subjects.find(s => s.id === formData.value.subjectId)
      if (subject) {
        selectedSubject.value = subject
      }
    }

    const selectedTeacherName = computed(() => {
      if (selectedSubject.value && selectedSubject.value.teacherName) return selectedSubject.value.teacherName
      // try to find teacher from props.teachers if teacherId present
      const teacherId = selectedSubject.value?.teacherId || selectedSubject.value?.teacher_id
      if (teacherId && Array.isArray(props.teachers)) {
        const t = props.teachers.find(x => x.teacherId === teacherId || x.id === teacherId)
        if (t) return t.name
      }
      return ''
    })

    // Auto-select first day when days are selected
    watch(selectedDays, (newDays) => {
      if (newDays.length > 0 && !currentEditingDay.value) {
        currentEditingDay.value = newDays[0]
      } else if (newDays.length === 0) {
        currentEditingDay.value = ''
        dayScheduleData.value = {}
      } else if (!newDays.includes(currentEditingDay.value)) {
        currentEditingDay.value = newDays[0]
      }
    }, { deep: true })

    // Slot availability check (simplified)
    const isSlotAvailable = (slotValue) => {
      return true // Simplified for now
    }

    // Get selected slots text
    const getSelectedSlotsText = () => {
      if (selectedTimeSlots.value.length === 0) return ''
      
      const slots = selectedTimeSlots.value
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(slotValue => {
          const slot = timeSlotOptions.find(s => s.value === slotValue)
          return slot ? `${slot.label} (${slot.time})` : slotValue
        })
      
      return slots.join(', ')
    }

    // Get selected duration
    const getSelectedDuration = () => {
      return selectedTimeSlots.value.length * 45 // 45 minutes per slot
    }

    // Get day name
    const getDayName = (dayValue) => {
      const day = dayOptions.find(d => d.value === dayValue)
      return day ? day.label : `Thứ ${dayValue}`
    }

    // Get group name
    const getGroupName = (groupId) => {
      const groupNames = {
        'group1': 'Nhóm 1',
        'group2': 'Nhóm 2', 
        'group3': 'Nhóm 3',
        'group4': 'Nhóm 4'
      }
      return groupNames[groupId] || groupId
    }

    // Individual day schedule functions
    const isDaySlotSelected = (day, slotValue) => {
      return dayScheduleData.value[day]?.includes(slotValue) || false
    }

    const toggleDaySlot = (day, slotValue) => {
      if (!dayScheduleData.value[day]) {
        dayScheduleData.value[day] = []
      }
      
      const index = dayScheduleData.value[day].indexOf(slotValue)
      if (index > -1) {
        dayScheduleData.value[day].splice(index, 1)
      } else {
        dayScheduleData.value[day].push(slotValue)
      }
    }

    const getDaySlotText = (day) => {
      const slots = dayScheduleData.value[day] || []
      if (slots.length === 0) return 'Chưa chọn tiết'
      
      return slots
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(slotValue => {
          const slot = timeSlotOptions.find(s => s.value === slotValue)
          return slot ? `${slot.label} (${slot.time})` : slotValue
        })
        .join(', ')
    }

    const getDayDuration = (day) => {
      const slots = dayScheduleData.value[day] || []
      return slots.length * 45 // 45 minutes per slot
    }

    const hasAnyDaySchedule = computed(() => {
      return selectedDays.value.some(day => 
        dayScheduleData.value[day] && dayScheduleData.value[day].length > 0
      )
    })

    const hasValidSchedules = computed(() => {
      return selectedDays.value.some(day => 
        dayScheduleData.value[day] && dayScheduleData.value[day].length > 0
      )
    })

    const getValidScheduleCount = computed(() => {
      return selectedDays.value.filter(day => 
        dayScheduleData.value[day] && dayScheduleData.value[day].length > 0
      ).length
    })

    // Add all day schedules
    const addAllDaySchedules = () => {
      // Remove existing schedules for selected days
      scheduleDays.value = scheduleDays.value.filter(schedule => 
        !selectedDays.value.includes(schedule.day)
      )
      
      // Add new schedules for days that have slots selected
      selectedDays.value.forEach(day => {
        if (dayScheduleData.value[day] && dayScheduleData.value[day].length > 0) {
          scheduleDays.value.push({
            day: day,
            slots: [...dayScheduleData.value[day]],
            slotsText: getDaySlotText(day),
            duration: getDayDuration(day)
          })
        }
      })

      // Clear selections
      selectedDays.value = []
      dayScheduleData.value = {}
      currentEditingDay.value = ''
    }

    // Remove schedule day
    const removeScheduleDay = (index) => {
      scheduleDays.value.splice(index, 1)
    }

    // Handle form submission
    const handleSubmit = () => {
      if (!isFormValid.value) return

      const scheduleData = {
        ...formData.value,
        scheduleDays: scheduleDays.value,
        scheduleType: formData.value.scheduleType
      }
      if (scheduleData.repeatType === 'custom_weeks' && scheduleData.repeatInterval !== undefined) {
        scheduleData.repeatWeeks = scheduleData.repeatInterval
      }

      // Add subject info
      if (selectedSubject.value) {
        scheduleData.subjectName = selectedSubject.value.name
        scheduleData.subjectCode = selectedSubject.value.code
        scheduleData.teacherName = selectedSubject.value.teacherName
        scheduleData.roomName = selectedSubject.value.roomName
      }

      emit('save', scheduleData)
    }

    // Handle overlay click
    const handleOverlayClick = () => {
      emit('close')
    }

    // Function to load schedule data
// Helper chuyển đổi thứ từ API (ví dụ 1=CN, 2=T2) sang format của Modal (8=CN, 2=T2)
    // Bạn cần kiểm tra xem API trả về 1 hay 0 cho Chủ nhật để điều chỉnh hàm này
    const apiDayToModalDay = (weekday) => {
      const w = Number(weekday)
      if (isNaN(w)) return null
      // Giả sử API: 2->Thứ 2 ... 7->Thứ 7, 8 (hoặc 1/0) -> Chủ nhật
      // Modal đang dùng: '2'...'8' (8 là CN)
      // Nếu API trả về 8 là CN thì giữ nguyên, nếu 0 hoặc 1 là CN thì map về 8
      if (w === 0 || w === 1) return '8' 
      return String(w)
    }

    // Thay thế hàm loadScheduleData cũ bằng hàm này:

const loadScheduleData = () => {
  // Reset state
  scheduleDays.value = []
  selectedDays.value = []
  dayScheduleData.value = {}
  currentEditingDay.value = ''

  if (props.schedule) {
    const s = props.schedule
    console.log('Modal received:', s) // Debug

    // 1. Map fields (Chuyển đổi type an toàn)
    // subjectId cần khớp type với value trong <option> (thường là number)
    // Nếu s.subjectId là string "1" mà option value là number 1, v-model có thể không nhận.
    formData.value.subjectId = s.subjectId
    
    formData.value.scheduleType = s.scheduleType || 'study'
    formData.value.groupId = s.groupId || ''
    
    // Cắt chuỗi ngày (YYYY-MM-DD) nếu API trả về full datetime ISO
    formData.value.startDate = s.startDate ? String(s.startDate).split('T')[0] : ''
    formData.value.endDate = s.endDate ? String(s.endDate).split('T')[0] : ''
    
    formData.value.repeatType = s.repeatType || 'weekly'
    formData.value.repeatInterval = s.repeatInterval || 1
    formData.value.status = s.status || 'scheduled'
    formData.value.notes = s.notes || ''

    // 2. Map Schedule Days
    if (s.scheduleDays && Array.isArray(s.scheduleDays)) {
      // Dữ liệu hiển thị danh sách bên phải
      scheduleDays.value = s.scheduleDays.map(d => {
        const dayStr = apiDayToModalDay(d.day)
        const slotArr = Array.isArray(d.slots) ? d.slots.map(String) : []
        return {
          day: dayStr,
          slots: slotArr,
          slotsText: slotArr.map(sl => `Tiết ${sl}`).join(', '),
          duration: slotArr.length * 45
        }
      }).filter(d => d.day) // Lọc bỏ ngày null

      // Dữ liệu cho form chỉnh sửa (checkboxes)
      const loadedDays = []
      const loadedData = {}
      
      scheduleDays.value.forEach(item => {
        if (!loadedDays.includes(item.day)) {
          loadedDays.push(item.day)
        }
        // Map slot về mảng string để so sánh checkbox
        loadedData[item.day] = item.slots.map(String)
      })

      selectedDays.value = loadedDays
      dayScheduleData.value = loadedData
      
      if (loadedDays.length > 0) {
        currentEditingDay.value = loadedDays[0]
      }
    }

    // Trigger để hiện tên môn/phòng/gv
    if (formData.value.subjectId) {
        // Dùng setTimeout để đảm bảo DOM đã update hoặc subjects prop đã sẵn sàng
        setTimeout(() => handleSubjectChange(), 0)
    }
  } else {
    // Reset form for Create Mode
    formData.value = {
      subjectId: '',
      scheduleType: props.scheduleType || 'study',
      groupId: '',
      startDate: '',
      endDate: '',
      repeatType: 'weekly',
      repeatInterval: 1,
      status: 'scheduled',
      notes: ''
    }
  }
}

    // Initialize form data for edit mode
    loadScheduleData()

    // Watch for schedule changes
    watch(() => props.schedule, () => {
      loadScheduleData()
    }, { deep: true })

    // Form validation
    const isFormValid = computed(() => {
      return formData.value.subjectId && 
             formData.value.scheduleType &&
             scheduleDays.value.length > 0 &&
             formData.value.status
    })

    return {
      formData,
      selectedDays,
      scheduleDays,
      selectedSubject,
      currentEditingDay,
      dayScheduleData,
      dayOptions,
      timeSlotOptions,
      isFormValid,
      handleSubjectChange,
      isSlotAvailable,
      getDayName,
      getGroupName,
      removeScheduleDay,
      handleSubmit,
      handleOverlayClick,
      // Individual day functions
      isDaySlotSelected,
      toggleDaySlot,
      getDaySlotText,
      getDayDuration,
      hasAnyDaySchedule,
      hasValidSchedules,
      getValidScheduleCount,
      addAllDaySchedules
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
  z-index: 100000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-close {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
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
  max-height: 70vh;
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
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group label.required::after {
  content: ' *';
  color: #dc2626;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group small {
  font-size: 12px;
  color: #6b7280;
  margin-top: -2px;
}

/* Subject Info */
.subject-info {
  grid-column: 1 / -1;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.info-item {
  font-size: 14px;
  color: #0369a1;
}

/* Schedule Builder */
.schedule-builder {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  background: #fefefe;
}

/* Days Selection */
.days-selection {
  margin-bottom: 16px;
}

.days-selection label {
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.days-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.day-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  cursor: pointer;
  font-size: 14px;
}

.day-checkbox:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.day-checkbox.selected {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
}

.day-checkbox input[type="checkbox"] {
  margin: 0;
}

/* Time Slots Section */
.time-slots-section {
  margin-top: 16px;
}

.time-slots-section > label {
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.day-time-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selector-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.day-selection label {
  font-weight: 500;
  margin-right: 8px;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 12px;
}

.time-slot-checkbox {
  display: flex;
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

.add-day-section {
  margin-top: 16px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 6px;
}

.selected-preview {
  margin-bottom: 8px;
  font-size: 14px;
  color: #0369a1;
}

.duration {
  color: #0c4a6e;
  font-weight: 500;
  margin-left: 8px;
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
}

.btn-add-day:hover {
  background: #047857;
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

.day-info {
  flex: 1;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.group-badge {
  background: #3b82f6;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
}

.slots-info {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 2px;
}

.duration-info {
  color: #059669;
  font-size: 12px;
  font-weight: 500;
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

/* Repeat Options */
.repeat-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.custom-repeat {
  margin-top: 8px;
}

.repeat-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.repeat-input {
  width: 60px;
  text-align: center;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-cancel,
.btn-save {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  background: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.btn-save:hover:not(:disabled) {
  background: #2563eb;
}

.btn-save:disabled {
  background: #d1d5db;
  color: #9ca3af;
  border-color: #d1d5db;
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
  
  .info-grid {
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
  
  .repeat-options {
    flex-direction: column;
    gap: 8px;
  }
}

/* Schedule Preview Section */
.schedule-preview-section {
  margin-top: 16px;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 6px;
}

.selected-preview h4 {
  margin: 0 0 12px 0;
  color: #0c4a6e;
  font-weight: 600;
}

.preview-day {
  margin-bottom: 8px;
  font-size: 14px;
  color: #0369a1;
}

.duration {
  color: #0c4a6e;
  font-weight: 500;
  margin-left: 8px;
}

.btn-add-schedule {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;
}

.btn-add-schedule:hover {
  background: #047857;
  transform: translateY(-1px);
}

.btn-add-schedule:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

/* Individual Days Setup */
.individual-days-setup {
  margin-top: 16px;
}

.individual-days-setup > label {
  font-weight: 600;
  margin-bottom: 12px;
  display: block;
}

.days-schedule-tabs {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.tab-headers {
  display: flex;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.tab-header {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-header:not(:last-child) {
  border-right: 1px solid #e5e7eb;
}

.tab-header:hover {
  background: #f3f4f6;
  color: #374151;
}

.tab-header.active {
  background: white;
  color: #3b82f6;
  border-bottom: 2px solid #3b82f6;
  margin-bottom: -1px;
}

.badge {
  background: #3b82f6;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.tab-header.active .badge {
  background: #1e40af;
}

.tab-content {
  padding: 16px;
  background: white;
}

.day-header h4 {
  margin: 0 0 4px 0;
  color: #374151;
  font-weight: 600;
}

.day-header small {
  color: #6b7280;
  margin-bottom: 12px;
  display: block;
}

.current-day-preview {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 4px;
  font-size: 14px;
  color: #0369a1;
}

.all-days-preview {
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 6px;
}

.all-days-preview h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-weight: 600;
}

.all-days-preview .preview-day {
  margin-bottom: 6px;
  font-size: 14px;
}

.empty-day {
  color: #9ca3af;
  font-style: italic;
}

/* Responsive for tabs */
@media (max-width: 768px) {
  .tab-headers {
    flex-wrap: wrap;
  }
  
  .tab-header {
    min-width: calc(50% - 1px);
    flex: none;
  }
}
</style>