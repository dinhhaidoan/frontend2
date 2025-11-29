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
                  {{ subject.code }} - {{ subject.name }}{{ getTeacherNameFromSubject(subject) ? (' — ' + getTeacherNameFromSubject(subject)) : '' }}
                </option>
              </select>
            </div>

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

            <div class="form-group">
              <label class="required">Loại lịch</label>
              <select v-model="formData.scheduleType" required>
                <option value="study">Lịch học</option>
                <option value="exam">Lịch thi</option>
              </select>
            </div>

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

            <div class="form-group full-width">
              <label class="required">Xếp lịch học</label>
              
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

                      <div v-if="dayScheduleData[currentEditingDay] && dayScheduleData[currentEditingDay].length > 0" class="current-day-preview">
                        <strong>{{ getDayName(currentEditingDay) }}:</strong> 
                        {{ getDaySlotText(currentEditingDay) }}
                        <span class="duration">({{ getDayDuration(currentEditingDay) }} phút)</span>
                      </div>
                    </div>
                  </div>

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

            <div class="form-group">
              <label class="required">Ngày bắt đầu</label>
              <input type="date" v-model="formData.startDate" required />
            </div>

            <div class="form-group">
              <label>Ngày kết thúc</label>
              <input type="date" v-model="formData.endDate" />
              <small>Để trống nếu chỉ tạo lịch cho một buổi</small>
            </div>

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

            <div v-if="formData.repeatType === 'custom_weeks'" class="form-group full-width">
              <label>Cài đặt lặp lại</label>
              <div class="custom-repeat">
                <div class="repeat-row">
                  <span>Lặp lại mỗi</span>
                  <input type="number" v-model="formData.repeatInterval" min="1" max="4" class="repeat-input" />
                  <span>tuần</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="$emit('close')" class="btn-cancel">Hủy</button>
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
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'ScheduleModal',
  props: {
    schedule: { type: Object, default: null },
    subjects: { type: Array, default: () => [] },
    teachers: { type: Array, default: () => [] },
    rooms: { type: Array, default: () => [] },
    semesters: { type: Array, default: () => [] },
    isEdit: { type: Boolean, default: false }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    // 1. STATE
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

    const selectedDays = ref([])
    const scheduleDays = ref([])
    const selectedSubject = ref(null)
    const currentEditingDay = ref('')
    const dayScheduleData = ref({})

    // 2. CONSTANTS
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

    // 3. HELPERS
    const handleSubjectChange = () => {
      const subject = props.subjects.find(s => s.id === formData.value.subjectId)
      if (subject) selectedSubject.value = subject
    }

    const getDayName = (val) => dayOptions.find(d => d.value === val)?.label || `Thứ ${val}`
    
    const getGroupName = (id) => {
      const names = { 'group1': 'Nhóm 1', 'group2': 'Nhóm 2', 'group3': 'Nhóm 3', 'group4': 'Nhóm 4' }
      return names[id] || id
    }

    const getTeacherNameFromSubject = (subject) => {
      if (!subject) return ''
      return subject.teacherName || ''
    }

    const isSlotAvailable = () => true

    // 4. TAB LOGIC
    const isDaySlotSelected = (day, slot) => dayScheduleData.value[day]?.includes(slot) || false

    const toggleDaySlot = (day, slot) => {
      if (!dayScheduleData.value[day]) dayScheduleData.value[day] = []
      const idx = dayScheduleData.value[day].indexOf(slot)
      if (idx > -1) dayScheduleData.value[day].splice(idx, 1)
      else dayScheduleData.value[day].push(slot)
    }

    const getDaySlotText = (day) => {
      const slots = dayScheduleData.value[day] || []
      if (slots.length === 0) return 'Chưa chọn tiết'
      return slots.sort((a, b) => parseInt(a) - parseInt(b))
        .map(v => {
          const s = timeSlotOptions.find(opt => opt.value === v)
          return s ? `${s.label} (${s.time})` : v
        }).join(', ')
    }

    const getDayDuration = (day) => (dayScheduleData.value[day] || []).length * 45

    // 5. COMPUTED
    const hasAnyDaySchedule = computed(() => selectedDays.value.some(d => dayScheduleData.value[d]?.length > 0))
    const hasValidSchedules = computed(() => hasAnyDaySchedule.value)
    const getValidScheduleCount = computed(() => selectedDays.value.filter(d => dayScheduleData.value[d]?.length > 0).length)
    
    const isFormValid = computed(() => 
      formData.value.subjectId && 
      formData.value.scheduleType && 
      scheduleDays.value.length > 0 && 
      formData.value.status
    )

    // 6. ACTIONS
    const addAllDaySchedules = () => {
      scheduleDays.value = scheduleDays.value.filter(s => !selectedDays.value.includes(s.day))
      selectedDays.value.forEach(day => {
        if (dayScheduleData.value[day]?.length > 0) {
          scheduleDays.value.push({
            day,
            slots: [...dayScheduleData.value[day]],
            slotsText: getDaySlotText(day),
            duration: getDayDuration(day)
          })
        }
      })
      // Reset
      selectedDays.value = []
      dayScheduleData.value = {}
      currentEditingDay.value = ''
    }

    const removeScheduleDay = (index) => scheduleDays.value.splice(index, 1)

    const handleSubmit = () => {
      if (!isFormValid.value) return
      const data = {
        ...formData.value,
        scheduleDays: scheduleDays.value.map(d => ({ day: d.day, slots: d.slots }))
      }
      if (data.repeatType === 'custom_weeks') data.repeatWeeks = formData.value.repeatInterval
      if (selectedSubject.value) {
        data.subjectName = selectedSubject.value.name
        data.subjectCode = selectedSubject.value.code
        data.teacherName = selectedSubject.value.teacherName
        data.roomName = selectedSubject.value.roomName
      }
      emit('save', data)
    }

    const handleOverlayClick = () => emit('close')

    // 7. LOAD DATA
    const apiDayToModalDay = (w) => {
      const n = Number(w)
      if (isNaN(n)) return null
      if (n === 0 || n === 1) return '8'
      return String(n)
    }

    const loadScheduleData = () => {
      // Reset
      scheduleDays.value = []
      selectedDays.value = []
      dayScheduleData.value = {}
      currentEditingDay.value = ''

      if (!props.schedule) {
        // Create Mode
        formData.value = {
          subjectId: '', scheduleType: 'study', groupId: '',
          startDate: '', endDate: '', repeatType: 'weekly',
          repeatInterval: 1, status: 'scheduled', notes: ''
        }
        return
      }

      // Edit Mode
      const s = props.schedule
      formData.value.subjectId = s.subjectId || s.courseClassId || ''
      formData.value.scheduleType = s.scheduleType || (s.type === 'exam' ? 'exam' : 'study')
      formData.value.groupId = s.groupId || ''
      formData.value.status = s.status || 'scheduled'
      formData.value.notes = s.notes || ''
      formData.value.repeatType = (s.repeatType === 'custom' || s.repeatType === 'custom_weeks') ? 'custom_weeks' : (s.repeatType || 'weekly')
      formData.value.repeatInterval = s.repeatInterval || s.repeatWeeks || 1
      
      const toDateStr = (d) => d ? (typeof d === 'string' ? d.split('T')[0] : d.toISOString().split('T')[0]) : ''
      formData.value.startDate = toDateStr(s.startDate)
      formData.value.endDate = toDateStr(s.endDate)

      if (s.scheduleDays && Array.isArray(s.scheduleDays)) {
        // Load danh sách đã có
        scheduleDays.value = s.scheduleDays.map(d => {
          const dayStr = apiDayToModalDay(d.day || d.dayOfWeek || d.weekdayId)
          const slots = (d.slots || d.timeSlots || []).map(String)
          return {
            day: dayStr,
            slots,
            slotsText: slots.map(v => {
              const opt = timeSlotOptions.find(o => o.value === v)
              return opt ? `${opt.label} (${opt.time})` : v
            }).join(', '),
            duration: slots.length * 45
          }
        }).filter(d => d.day)

        // Load ngược vào builder để sửa nhanh
        const days = []
        const data = {}
        scheduleDays.value.forEach(d => {
          if (!days.includes(d.day)) days.push(d.day)
          data[d.day] = [...d.slots]
        })
        selectedDays.value = days
        dayScheduleData.value = data
        if (days.length > 0) currentEditingDay.value = days[0]
      }

      if (formData.value.subjectId) setTimeout(handleSubjectChange, 0)
    }

    watch(() => props.schedule, loadScheduleData, { deep: true, immediate: true })
    
    // Auto switch tabs
    watch(selectedDays, (newVal) => {
      if (newVal.length > 0 && !currentEditingDay.value) currentEditingDay.value = newVal[0]
      else if (newVal.length === 0) currentEditingDay.value = ''
      else if (!newVal.includes(currentEditingDay.value)) currentEditingDay.value = newVal[0]
    }, { deep: true })

    return {
      formData, selectedDays, scheduleDays, selectedSubject,
      currentEditingDay, dayScheduleData, dayOptions, timeSlotOptions,
      isFormValid, handleSubjectChange, getTeacherNameFromSubject,
      isSlotAvailable, getDayName, getGroupName, removeScheduleDay,
      handleSubmit, handleOverlayClick, isDaySlotSelected, toggleDaySlot,
      getDaySlotText, getDayDuration, hasAnyDaySchedule, hasValidSchedules,
      getValidScheduleCount, addAllDaySchedules
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