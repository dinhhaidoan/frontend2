<template>
  <Transition name="modal">
    <div v-if="schedule" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <div class="header-info">
            <h2>Điểm danh lớp {{ schedule.class }}</h2>
            <p class="schedule-info">
              {{ schedule.subject }} • {{ schedule.room }} • {{ schedule.startTime }} - {{ schedule.endTime }}
            </p>
          </div>
          <button @click="close" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-toolbar">
          <div class="toolbar-left">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Tìm sinh viên..."
                class="search-input"
              >
            </div>
            <div class="attendance-summary">
              <span class="summary-item present">
                <i class="fas fa-check-circle"></i>
                Có mặt: <strong>{{ presentCount }}</strong>
              </span>
              <span class="summary-item absent">
                <i class="fas fa-times-circle"></i>
                Vắng: <strong>{{ absentCount }}</strong>
              </span>
              <span class="summary-item total">
                Tổng: <strong>{{ students.length }}</strong>
              </span>
            </div>
          </div>
          <div class="toolbar-right">
            <button @click="markAllPresent" class="btn-quick">
              <i class="fas fa-check-double"></i>
              Có mặt hết
            </button>
            <button @click="markAllAbsent" class="btn-quick">
              <i class="fas fa-user-times"></i>
              Vắng hết
            </button>
          </div>
        </div>

        <div class="modal-body">
          <div class="student-list">
            <div 
              v-for="student in filteredStudents"
              :key="student.id"
              :class="['student-item', { 'present': student.present, 'absent': !student.present }]"
              @click="toggleAttendance(student)"
            >
              <div class="student-info">
                <img :src="avatarSrc(student.avatar)" :alt="student.name" class="student-avatar" @error="onAvatarError($event, student.avatar)">
                <div class="student-details">
                  <div class="student-name">{{ student.name }}</div>
                  <div class="student-code">{{ student.code }}</div>
                </div>
              </div>
              <div class="attendance-status">
                <button 
                  @click.stop="setPresent(student)"
                  :class="['status-btn', 'present-btn', { active: student.present }]"
                >
                  <i class="fas fa-check"></i>
                  Có mặt
                </button>
                <button 
                  @click.stop="setAbsent(student)"
                  :class="['status-btn', 'absent-btn', { active: !student.present }]"
                >
                  <i class="fas fa-times"></i>
                  Vắng
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="close" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            Hủy
          </button>
          <button @click="saveAttendance" class="btn btn-primary">
            <i class="fas fa-save"></i>
            Lưu điểm danh
          </button>
        </div>
      </div>

      <!-- Confirmation Dialog -->
      <Transition name="fade">
        <div v-if="showConfirmation" class="confirmation-overlay" @click="closeConfirmation">
          <div class="confirmation-dialog" @click.stop>
            <div class="confirmation-header">
              <i class="fas fa-check-circle"></i>
              <h3>Xác nhận lưu điểm danh</h3>
            </div>
            <div class="confirmation-body">
              <p>Bạn có chắc chắn muốn lưu kết quả điểm danh này không?</p>
              <div class="confirmation-summary">
                <div class="summary-item present">
                  <i class="fas fa-user-check"></i>
                  <span class="label">Có mặt:</span>
                  <span class="value">{{ presentCount }}/{{ students.length }}</span>
                </div>
                <div class="summary-item absent">
                  <i class="fas fa-user-times"></i>
                  <span class="label">Vắng mặt:</span>
                  <span class="value">{{ absentCount }}/{{ students.length }}</span>
                </div>
              </div>
            </div>
            <div class="confirmation-footer">
              <button @click="closeConfirmation" class="btn-cancel-confirm">
                <i class="fas fa-times"></i>
                Hủy
              </button>
              <button @click="confirmSave" class="btn-confirm">
                <i class="fas fa-check"></i>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { fetchImageAsBlobUrl, revokeBlobUrl } from '@/composables/useAvatarLoader'

const props = defineProps({
  schedule: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const searchQuery = ref('')
const showConfirmation = ref(false)

// Mock student data
const students = ref([
  { id: 1, name: 'Nguyễn Văn A', code: 'SV001', avatar: 'https://i.pravatar.cc/150?img=1', present: true },
  { id: 2, name: 'Trần Thị B', code: 'SV002', avatar: 'https://i.pravatar.cc/150?img=2', present: true },
  { id: 3, name: 'Lê Văn C', code: 'SV003', avatar: 'https://i.pravatar.cc/150?img=3', present: false },
  { id: 4, name: 'Phạm Thị D', code: 'SV004', avatar: 'https://i.pravatar.cc/150?img=4', present: true },
  { id: 5, name: 'Hoàng Văn E', code: 'SV005', avatar: 'https://i.pravatar.cc/150?img=5', present: true },
  { id: 6, name: 'Võ Thị F', code: 'SV006', avatar: 'https://i.pravatar.cc/150?img=6', present: false },
  { id: 7, name: 'Đặng Văn G', code: 'SV007', avatar: 'https://i.pravatar.cc/150?img=7', present: true },
  { id: 8, name: 'Bùi Thị H', code: 'SV008', avatar: 'https://i.pravatar.cc/150?img=8', present: true }
])

const blobMap = ref({})

const avatarSrc = (url) => {
  if (!url) return '/default-avatar.png'
  return blobMap.value[url] || url
}

const onAvatarError = async (event, url) => {
  try {
    if (!url || blobMap.value[url]) return
    const b = await fetchImageAsBlobUrl(url)
    blobMap.value[url] = b
    event.target.src = b
  } catch (err) {
    console.debug('avatar fetch fallback failed', err)
  }
}

onBeforeUnmount(() => {
  Object.values(blobMap.value).forEach(v => revokeBlobUrl(v))
})

const filteredStudents = computed(() => {
  if (!searchQuery.value) return students.value
  
  const query = searchQuery.value.toLowerCase()
  return students.value.filter(s => 
    s.name.toLowerCase().includes(query) ||
    s.code.toLowerCase().includes(query)
  )
})

const presentCount = computed(() => {
  return students.value.filter(s => s.present).length
})

const absentCount = computed(() => {
  return students.value.filter(s => !s.present).length
})

const toggleAttendance = (student) => {
  student.present = !student.present
}

const setPresent = (student) => {
  student.present = true
}

const setAbsent = (student) => {
  student.present = false
}

const markAllPresent = () => {
  students.value.forEach(s => s.present = true)
}

const markAllAbsent = () => {
  students.value.forEach(s => s.present = false)
}

const close = () => {
  emit('close')
}

const openConfirmation = () => {
  showConfirmation.value = true
}

const closeConfirmation = () => {
  showConfirmation.value = false
}

const confirmSave = () => {
  const attendanceData = {
    scheduleId: props.schedule?.id,
    class: props.schedule?.class,
    date: new Date(),
    students: students.value.map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      present: s.present
    })),
    presentCount: presentCount.value,
    absentCount: absentCount.value
  }
  
  emit('save', attendanceData)
  emit('close')
}

const saveAttendance = () => {
  openConfirmation()
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
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.header-info {
  flex: 1;
}

.header-info h2 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.schedule-info {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.modal-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  gap: 16px;
  align-items: center;
  flex: 1;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 250px;
}

.search-box i {
  color: #9ca3af;
  font-size: 14px;
}

.search-input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
}

.attendance-summary {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.summary-item i {
  font-size: 16px;
}

.summary-item.present i {
  color: #10b981;
}

.summary-item.absent i {
  color: #ef4444;
}

.summary-item.total {
  color: #374151;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.btn-quick {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #374151;
}

.btn-quick:hover {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.student-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.student-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.student-item.present {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-color: #86efac;
}

.student-item.absent {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border-color: #fca5a5;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.student-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.student-details {
  flex: 1;
}

.student-name {
  font-weight: 600;
  color: #111827;
  font-size: 15px;
  margin-bottom: 2px;
}

.student-code {
  font-size: 13px;
  color: #6b7280;
}

.attendance-status {
  display: flex;
  gap: 8px;
}

.status-btn {
  padding: 8px 16px;
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.present-btn {
  background: #f0fdf4;
  color: #15803d;
  border-color: #86efac;
}

.present-btn:hover {
  background: #dcfce7;
  border-color: #4ade80;
}

.present-btn.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.absent-btn {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fca5a5;
}

.absent-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}

.absent-btn.active {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

/* Transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* Confirmation Dialog */
.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.confirmation-dialog {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  overflow: hidden;
}

.confirmation-header {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.confirmation-header i {
  font-size: 24px;
}

.confirmation-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.confirmation-body {
  padding: 24px;
}

.confirmation-body p {
  margin: 0 0 20px 0;
  color: #374151;
  font-size: 15px;
  line-height: 1.6;
}

.confirmation-summary {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.summary-item {
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item.present {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #10b981;
}

.summary-item.absent {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 2px solid #ef4444;
}

.summary-item i {
  font-size: 20px;
  margin-bottom: 4px;
}

.summary-item.present i {
  color: #059669;
}

.summary-item.absent i {
  color: #dc2626;
}

.summary-item .label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.summary-item .value {
  font-size: 24px;
  font-weight: 700;
}

.summary-item.present .value {
  color: #059669;
}

.summary-item.absent .value {
  color: #dc2626;
}

.confirmation-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel-confirm,
.btn-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-cancel-confirm {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel-confirm:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: #10b981;
  color: white;
}

.btn-confirm:hover {
  background: #059669;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-enter-active .confirmation-dialog,
.fade-leave-active .confirmation-dialog {
  transition: transform 0.2s;
}

.fade-enter-from .confirmation-dialog,
.fade-leave-to .confirmation-dialog {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .modal-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-left {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .attendance-summary {
    justify-content: space-between;
  }
  
  .toolbar-right {
    justify-content: stretch;
  }
  
  .btn-quick {
    flex: 1;
    justify-content: center;
  }
  
  .student-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .attendance-status {
    width: 100%;
  }
  
  .status-btn {
    flex: 1;
    justify-content: center;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
