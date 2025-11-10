<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-file-alt"></i>
          {{ isEdit ? 'Chỉnh sửa lịch thi' : 'Thêm lịch thi mới' }}
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
                  {{ subject.code }} - {{ subject.name }}
                </option>
              </select>
            </div>

            <!-- Exam Type -->
            <div class="form-group">
              <label class="required">Loại thi</label>
              <select v-model="formData.examType" required>
                <option value="">-- Chọn loại thi --</option>
                <option value="midterm">Thi giữa kỳ</option>
                <option value="final">Thi cuối kỳ</option>
                <option value="makeup">Thi lại</option>
                <option value="improvement">Thi cải thiện</option>
              </select>
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

            <!-- Exam Date -->
            <div class="form-group">
              <label class="required">Ngày thi</label>
              <input
                type="date"
                v-model="formData.date"
                required
                @change="checkConflicts"
              />
            </div>

            <!-- Start Time -->
            <div class="form-group">
              <label class="required">Giờ bắt đầu</label>
              <input
                type="time"
                v-model="formData.startTime"
                required
                @change="checkConflicts"
              />
            </div>

            <!-- Duration -->
            <div class="form-group">
              <label class="required">Thời gian thi (phút)</label>
              <select 
                v-model="formData.duration" 
                required
                @change="calculateEndTime"
              >
                <option value="">-- Chọn thời gian --</option>
                <option value="60">60 phút</option>
                <option value="90">90 phút</option>
                <option value="120">120 phút</option>
                <option value="150">150 phút</option>
                <option value="180">180 phút</option>
              </select>
            </div>

            <!-- End Time (Auto calculated) -->
            <div class="form-group">
              <label>Giờ kết thúc</label>
              <input
                type="time"
                v-model="formData.endTime"
                readonly
                class="readonly-input"
              />
            </div>

            <!-- Teacher -->
            <div class="form-group">
              <label>Giáo viên giám sát</label>
              <select v-model="formData.teacherId">
                <option value="">-- Chọn giáo viên --</option>
                <option 
                  v-for="teacher in availableTeachers" 
                  :key="teacher.id" 
                  :value="teacher.id"
                >
                  {{ teacher.name }}
                </option>
              </select>
              <small v-if="conflictingTeachers.length > 0" class="warning">
                ⚠️ Giáo viên có lịch trùng: {{ conflictingTeachers.join(', ') }}
              </small>
            </div>

            <!-- Room -->
            <div class="form-group">
              <label class="required">Phòng thi</label>
              <select v-model="formData.roomId" required>
                <option value="">-- Chọn phòng thi --</option>
                <option 
                  v-for="room in availableRooms" 
                  :key="room.id" 
                  :value="room.id"
                >
                  {{ room.name }} - {{ room.building }} ({{ room.capacity }} chỗ)
                </option>
              </select>
              <small v-if="conflictingRooms.length > 0" class="warning">
                ⚠️ Phòng có lịch trùng: {{ conflictingRooms.join(', ') }}
              </small>
            </div>

            <!-- Max Students -->
            <div class="form-group">
              <label class="required">Số sinh viên tối đa</label>
              <input
                type="number"
                v-model="formData.maxStudents"
                min="1"
                required
                placeholder="VD: 40"
              />
            </div>

            <!-- Status -->
            <div class="form-group">
              <label class="required">Trạng thái</label>
              <select v-model="formData.status" required>
                <option value="scheduled">Đã xếp lịch</option>
                <option value="draft">Nháp</option>
              </select>
            </div>

            <!-- Instructions -->
            <div class="form-group full-width">
              <label>Hướng dẫn thi</label>
              <textarea
                v-model="formData.instructions"
                placeholder="VD: Sinh viên mang theo CMND, thẻ sinh viên và dụng cụ thi..."
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- Conflict Warning -->
          <div v-if="hasConflicts" class="conflict-warning">
            <div class="warning-header">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Phát hiện xung đột lịch</span>
            </div>
            <div class="conflict-details">
              <div v-for="conflict in conflicts" :key="conflict.id" class="conflict-item">
                {{ conflict.message }}
              </div>
            </div>
          </div>

          <!-- Exam Summary -->
          <div v-if="examSummary" class="exam-summary">
            <h4>
              <i class="fas fa-info-circle"></i>
              Thông tin lịch thi
            </h4>
            <div class="summary-grid">
              <div class="summary-item">
                <label>Môn thi:</label>
                <span>{{ getSubjectName() }}</span>
              </div>
              <div class="summary-item">
                <label>Loại thi:</label>
                <span class="exam-type" :class="formData.examType">{{ getExamTypeName() }}</span>
              </div>
              <div class="summary-item">
                <label>Thời gian:</label>
                <span>{{ formatExamTime() }}</span>
              </div>
              <div class="summary-item">
                <label>Phòng thi:</label>
                <span>{{ getRoomName() }}</span>
              </div>
              <div class="summary-item">
                <label>Sức chứa:</label>
                <span>{{ formData.maxStudents }} sinh viên</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="$emit('close')" class="btn-cancel">
              Hủy
            </button>
            <button type="submit" class="btn-save" :disabled="!isFormValid">
              <i class="fas fa-save"></i>
              {{ isEdit ? 'Cập nhật' : 'Tạo lịch thi' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'

export default {
  name: 'ExamModal',
  props: {
    exam: {
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
      examType: '',
      semesterId: '',
      date: '',
      startTime: '',
      endTime: '',
      duration: '',
      teacherId: '',
      roomId: '',
      maxStudents: '',
      status: 'scheduled',
      instructions: ''
    })

    const conflicts = ref([])
    const existingExams = ref([]) // This would normally come from a store or API

    // Function to load exam data
    const loadExamData = () => {
      if (props.exam) {
        Object.keys(formData.value).forEach(key => {
          if (props.exam[key] !== undefined) {
            formData.value[key] = props.exam[key]
          }
        })
      } else {
        // Reset form for add mode
        formData.value = {
          subjectId: '',
          examType: '',
          semesterId: '',
          date: '',
          startTime: '',
          endTime: '',
          duration: '',
          teacherId: '',
          roomId: '',
          maxStudents: '',
          status: 'scheduled',
          instructions: ''
        }
      }
    }

    // Initialize form data
    loadExamData()

    // Watch for exam changes
    watch(() => props.exam, () => {
      loadExamData()
    }, { deep: true })

    const isFormValid = computed(() => {
      return formData.value.subjectId &&
             formData.value.examType &&
             formData.value.semesterId &&
             formData.value.date &&
             formData.value.startTime &&
             formData.value.endTime &&
             formData.value.duration &&
             formData.value.roomId &&
             formData.value.maxStudents &&
             formData.value.status
    })

    const hasConflicts = computed(() => {
      return conflicts.value.length > 0
    })

    const availableTeachers = computed(() => {
      return props.teachers
    })

    const availableRooms = computed(() => {
      return props.rooms
    })

    const conflictingTeachers = computed(() => {
      return conflicts.value
        .filter(c => c.type === 'teacher')
        .map(c => c.teacherName)
    })

    const conflictingRooms = computed(() => {
      return conflicts.value
        .filter(c => c.type === 'room')
        .map(c => c.roomName)
    })

    const examSummary = computed(() => {
      return formData.value.subjectId && 
             formData.value.examType && 
             formData.value.date && 
             formData.value.startTime &&
             formData.value.roomId
    })

    const handleOverlayClick = () => {
      emit('close')
    }

    const handleSubjectChange = () => {
      checkConflicts()
    }

    const calculateEndTime = () => {
      if (formData.value.startTime && formData.value.duration) {
        const startTime = new Date(`2024-01-01T${formData.value.startTime}:00`)
        const endTime = new Date(startTime.getTime() + parseInt(formData.value.duration) * 60000)
        formData.value.endTime = endTime.toTimeString().slice(0, 5)
        checkConflicts()
      }
    }

    const checkConflicts = () => {
      conflicts.value = []
      
      if (!formData.value.date || !formData.value.startTime || !formData.value.endTime) {
        return
      }

      const examDate = formData.value.date
      const examStartTime = formData.value.startTime
      const examEndTime = formData.value.endTime

      // Check teacher conflicts
      if (formData.value.teacherId) {
        const teacherConflicts = existingExams.value.filter(exam => 
          exam.teacherId === formData.value.teacherId &&
          exam.date === examDate &&
          timeOverlap(examStartTime, examEndTime, exam.startTime, exam.endTime) &&
          (!props.isEdit || exam.id !== props.exam?.id)
        )

        teacherConflicts.forEach(conflict => {
          const teacher = props.teachers.find(t => t.id === formData.value.teacherId)
          conflicts.value.push({
            id: `teacher-${conflict.id}`,
            type: 'teacher',
            message: `Giáo viên ${teacher?.name} đã có lịch thi môn "${conflict.subjectName}" vào ${conflict.startTime}-${conflict.endTime}`,
            teacherName: teacher?.name
          })
        })
      }

      // Check room conflicts
      if (formData.value.roomId) {
        const roomConflicts = existingExams.value.filter(exam => 
          exam.roomId === formData.value.roomId &&
          exam.date === examDate &&
          timeOverlap(examStartTime, examEndTime, exam.startTime, exam.endTime) &&
          (!props.isEdit || exam.id !== props.exam?.id)
        )

        roomConflicts.forEach(conflict => {
          const room = props.rooms.find(r => r.id === formData.value.roomId)
          conflicts.value.push({
            id: `room-${conflict.id}`,
            type: 'room',
            message: `Phòng ${room?.name} đã được sử dụng cho thi môn "${conflict.subjectName}" vào ${conflict.startTime}-${conflict.endTime}`,
            roomName: room?.name
          })
        })
      }
    }

    const timeOverlap = (start1, end1, start2, end2) => {
      return start1 < end2 && start2 < end1
    }

    const getSubjectName = () => {
      if (!formData.value.subjectId) return ''
      const subject = props.subjects.find(s => s.id === formData.value.subjectId)
      return subject ? `${subject.code} - ${subject.name}` : ''
    }

    const getExamTypeName = () => {
      const types = {
        'midterm': 'Thi giữa kỳ',
        'final': 'Thi cuối kỳ',
        'makeup': 'Thi lại',
        'improvement': 'Thi cải thiện'
      }
      return types[formData.value.examType] || ''
    }

    const getRoomName = () => {
      if (!formData.value.roomId) return ''
      const room = props.rooms.find(r => r.id === formData.value.roomId)
      return room ? `${room.name} - ${room.building}` : ''
    }

    const formatExamTime = () => {
      if (!formData.value.date || !formData.value.startTime || !formData.value.duration) return ''
      
      const date = new Date(formData.value.date)
      const dateStr = date.toLocaleDateString('vi-VN', { 
        weekday: 'long', 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
      
      return `${dateStr}, ${formData.value.startTime}-${formData.value.endTime} (${formData.value.duration} phút)`
    }

    const handleSubmit = () => {
      if (!isFormValid.value) return

      const examData = {
        ...formData.value,
        maxStudents: parseInt(formData.value.maxStudents),
        duration: parseInt(formData.value.duration),
        type: 'exam',
        registeredStudents: props.exam?.registeredStudents || 0
      }

      // Add subject info
      const subject = props.subjects.find(s => s.id === examData.subjectId)
      if (subject) {
        examData.subjectName = subject.name
        examData.subjectCode = subject.code
      }

      // Add exam type name
      examData.examTypeName = getExamTypeName()

      // Add teacher info
      if (examData.teacherId) {
        const teacher = props.teachers.find(t => t.id === examData.teacherId)
        if (teacher) {
          examData.teacherName = teacher.name
        }
      }

      // Add room info
      if (examData.roomId) {
        const room = props.rooms.find(r => r.id === examData.roomId)
        if (room) {
          examData.roomName = room.name
        }
      }

      emit('save', examData)
    }

    // Watch for changes that might cause conflicts
    watch([
      () => formData.value.date,
      () => formData.value.startTime,
      () => formData.value.endTime,
      () => formData.value.teacherId,
      () => formData.value.roomId
    ], () => {
      nextTick(() => {
        checkConflicts()
      })
    })

    // Auto-calculate end time when start time or duration changes
    watch([
      () => formData.value.startTime,
      () => formData.value.duration
    ], () => {
      calculateEndTime()
    })

    return {
      formData,
      conflicts,
      isFormValid,
      hasConflicts,
      availableTeachers,
      availableRooms,
      conflictingTeachers,
      conflictingRooms,
      examSummary,
      handleOverlayClick,
      handleSubjectChange,
      calculateEndTime,
      getSubjectName,
      getExamTypeName,
      getRoomName,
      formatExamTime,
      handleSubmit,
      checkConflicts
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 24px;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
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
  color: #ef4444;
}

input, select, textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.readonly-input {
  background: #f9fafb;
  color: #6b7280;
}

small {
  font-size: 12px;
  color: #6b7280;
}

small.warning {
  color: #f59e0b;
}

.conflict-warning {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
}

.conflict-details {
  font-size: 14px;
  color: #92400e;
}

.conflict-item {
  margin-bottom: 4px;
}

.exam-summary {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.exam-summary h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #92400e;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  font-size: 14px;
}

.summary-item label {
  font-weight: 500;
  color: #374151;
}

.summary-item span {
  color: #0f172a;
}

.exam-type {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.exam-type.midterm {
  background: #dbeafe;
  color: #1e40af;
}

.exam-type.final {
  background: #fef3c7;
  color: #92400e;
}

.exam-type.makeup,
.exam-type.improvement {
  background: #fef2f2;
  color: #dc2626;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
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
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .modal-header,
  .modal-body {
    padding: 16px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>