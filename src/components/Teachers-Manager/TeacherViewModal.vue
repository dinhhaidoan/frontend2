<template>
  <div class="modal-overlay" @click="handleOverlayClick" v-if="isOpen">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-user"></i>
          Chi tiết giảng viên: {{ teacher?.name }}
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="teacher-profile">
          <!-- Profile Header -->
          <div class="profile-header">
            <div class="avatar">
              <img
                v-if="teacher?.avatar && (! (avatarFailedSet && avatarFailedSet.has && avatarFailedSet.has(teacher.avatar)) || (avatarBlobMap && avatarBlobMap.value && avatarBlobMap.value.has(teacher.avatar)))"
                :src="avatarSrc(teacher.avatar)"
                :alt="teacher?.name"
                @error="onAvatarError($event, teacher.avatar)"
              />
              <i v-else class="fas fa-user"></i>
            </div>
            <div class="basic-info">
              <h2>{{ teacher?.name }}</h2>
              <p class="teacher-code">{{ teacher?.code }}</p>
              <div class="status-badge" :class="teacher?.status">
                <i :class="getStatusIcon(teacher?.status)"></i>
                {{ getStatusName(teacher?.status) }}
              </div>
            </div>
            <div class="quick-stats">
              <div class="stat">
                <span class="number">{{ teacher?.subjectCount || 0 }}</span>
                <span class="label">Môn dạy</span>
              </div>
              <div class="stat">
                <span class="number">{{ teacher?.classCount || 0 }}</span>
                <span class="label">Lớp phụ trách</span>
              </div>
              <div class="stat">
                <span class="number">{{ teacher?.studentCount || 0 }}</span>
                <span class="label">Sinh viên</span>
              </div>
            </div>
          </div>
          
          <!-- Tab Navigation -->
          <div class="tab-navigation">
            <button 
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="{ 'active': activeTab === tab.id }"
              class="tab-button"
            >
              <i :class="tab.icon"></i>
              {{ tab.name }}
            </button>
          </div>
          
          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Personal Information Tab -->
            <div v-if="activeTab === 'personal'" class="tab-panel">
              <div class="info-sections">
                <div class="info-section">
                  <h4>Thông tin cá nhân</h4>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>Email</label>
                      <span>{{ teacher?.email || '-' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Số điện thoại</label>
                      <span>{{ teacher?.phone || '-' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Ngày sinh</label>
                      <span>{{ formatDate(teacher?.dateOfBirth) || '-' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Giới tính</label>
                      <span>{{ getGenderName(teacher?.gender) || '-' }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="info-section">
                  <h4>Thông tin học thuật</h4>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>Khoa/Bộ môn</label>
                      <span>CÔNG NGHỆ THÔNG TIN</span>
                    </div>
                    <div class="info-item">
                      <label>Học hàm học vị</label>
                      <span class="academic-rank" :class="teacher?.academicRank">
                        {{ getAcademicRankName(teacher?.academicRank) }}
                      </span>
                    </div>
                    <div class="info-item">
                      <label>Chức vụ</label>
                      <span>{{ getPositionName(teacher) }}</span>
                    </div>
                    <div class="info-item">
                      <label>Ngày tham gia</label>
                      <span>{{ formatDate(teacher?.createdAt) || '-' }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="info-section" v-if="teacher?.notes">
                  <h4>Ghi chú nội bộ</h4>
                  <p class="notes">{{ teacher?.notes }}</p>
                </div>
              </div>
            </div>
            
            <!-- Subjects Tab -->
             <div v-else-if="teacherSubjects.length > 0" class="subjects-list">
                <div v-for="subject in teacherSubjects" :key="subject.id" class="subject-card">
                  <div class="subject-info">
                    <h5>{{ subject.name || subject.code || 'Chưa đặt tên' }}</h5>
                    <p class="subject-code">{{ subject.code }}</p>
                    <div class="subject-meta">
                      <span><i class="fas fa-layer-group"></i> {{ subject.credits }} tín chỉ</span>
                      <span><i class="fas fa-user-graduate"></i> {{ subject.studentCount }} SV</span>
                      <span><i class="fas fa-clock"></i> {{ subject.semesterName }}</span>
                    </div>
                  </div>
                  <button class="btn-action" @click="viewSubject(subject)" title="Xem chi tiết">
                    <i class="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            
            <!-- Classes Tab -->
             <div v-else-if="teacherClasses.length > 0" class="classes-list">
              <div v-for="cls in teacherClasses" :key="cls.id" class="class-card">
                  <div class="class-info">
                  <h5>{{ cls.name || cls.code || 'Chưa đặt tên' }}</h5>
                  <p class="class-code">{{ cls.code }}</p>
                  <div class="class-meta">
                    <span><i class="fas fa-users"></i> {{ cls.studentCount }} Sinh viên</span>
                    <span><i class="fas fa-calendar-alt"></i> Khóa: {{ cls.year }}</span>
                  </div>
                </div>
                <button class="btn-action" @click="viewClass(cls)" title="Xem danh sách lớp">
                  <i class="fas fa-list"></i>
                </button>
              </div>
            </div>
            
            <!-- Schedule Tab -->
            <div v-if="activeTab === 'schedule'" class="tab-panel">
              <div class="schedule-section">
                <div class="section-header">
                  <h4>Lịch giảng dạy</h4>
                  <div class="section-actions">
                    <select v-model="selectedWeek" class="week-selector">
                      <option value="current">Tuần hiện tại</option>
                      <option value="next">Tuần sau</option>
                      <option value="all">Toàn bộ học kỳ</option>
                    </select>
                  </div>
                </div>
                
                <div class="schedule-grid">
                  <div class="schedule-day" v-for="day in weekDays" :key="day.id">
                    <h5>{{ day.name }}</h5>
                    <div v-if="getScheduleByDay(day.id).length > 0" class="day-schedule">
                      <div 
                        v-for="schedule in getScheduleByDay(day.id)"
                        :key="schedule.id"
                        class="schedule-item"
                      >
                        <div class="time">{{ schedule.time }}</div>
                        <div class="subject">{{ schedule.subjectName }}</div>
                        <div class="room">{{ schedule.roomName }}</div>
                      </div>
                    </div>
                    <div v-else class="no-schedule">
                      <span>Không có lịch</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Statistics Tab -->
            <div v-if="activeTab === 'statistics'" class="tab-panel">
              <div class="statistics-section">
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-icon subjects">
                      <i class="fas fa-book-open"></i>
                    </div>
                    <div class="stat-info">
                      <h4>{{ teacher?.subjectCount || 0 }}</h4>
                      <p>Môn giảng dạy</p>
                    </div>
                  </div>
                  
                  <div class="stat-card">
                    <div class="stat-icon classes">
                      <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                      <h4>{{ teacher?.classCount || 0 }}</h4>
                      <p>Lớp phụ trách</p>
                    </div>
                  </div>
                  
                  <div class="stat-card">
                    <div class="stat-icon students">
                      <i class="fas fa-user-graduate"></i>
                    </div>
                    <div class="stat-info">
                      <h4>{{ teacher?.studentCount || 0 }}</h4>
                      <p>Tổng sinh viên</p>
                    </div>
                  </div>
                  
                  <div class="stat-card">
                    <div class="stat-icon hours">
                      <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                      <h4>{{ teacher?.teachingHours || 0 }}</h4>
                      <p>Giờ giảng dạy/tuần</p>
                    </div>
                  </div>
                </div>
                
                <!-- Additional statistics can be added here -->
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('edit', teacher)" class="btn-edit">
          <i class="fas fa-edit"></i>
          Chỉnh sửa
        </button>
        <button @click="$emit('close')" class="btn-close-modal">
          <i class="fas fa-times"></i>
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onBeforeUnmount, computed } from 'vue'
import { fetchImageAsBlobUrl, revokeBlobUrl } from '@/composables/useAvatarLoader'

// Import Services
import courseClassService from '@/services/courseClassService'
import officeClassService from '@/services/officeClassService'
import { mapOfficeClass } from '@/types/officeClass'

export default {
  name: 'TeacherViewModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    teacher: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'edit'],
  setup(props, { emit }) {
    const activeTab = ref('personal')
    
    // State cho dữ liệu
    const teacherSubjects = ref([])
    const teacherClasses = ref([])
    const teacherSchedule = ref([])
    
    // Loading states để UX tốt hơn
    const isLoadingSubjects = ref(false)
    const isLoadingClasses = ref(false)

    // --- Avatar Logic (Giữ nguyên từ code cũ của bạn) ---
    const avatarBlobMap = ref(new Map())
    const avatarFailedSet = ref(new Set())
    const avatarSrc = (url) => {
      if (!url) return ''
      return avatarBlobMap.value.has(url) ? avatarBlobMap.value.get(url) : url
    }
    const onAvatarError = async (ev, url) => {
      if (!url) return
      try {
        if (ev?.target?.dataset?._fetchTried === '1') {
          avatarFailedSet.value.add(url)
          if (ev.target) ev.target.style.display = 'none'
          return
        }
        if (ev?.target) ev.target.dataset._fetchTried = '1'
        const b = await fetchImageAsBlobUrl(url)
        if (b) {
          avatarBlobMap.value.set(url, b)
          if (ev.target) ev.target.src = b
          return
        }
      } catch (e) {
        avatarFailedSet.value.add(url)
      }
    }
    // ----------------------------------------------------

    const selectedWeek = ref('current')
    
    const tabs = [
      { id: 'personal', name: 'Thông tin cá nhân', icon: 'fas fa-user' },
      { id: 'subjects', name: 'Môn học', icon: 'fas fa-book-open' }, // Course Classes
      { id: 'classes', name: 'Lớp chủ nhiệm', icon: 'fas fa-users' }, // Office Classes
      { id: 'schedule', name: 'Lịch giảng dạy', icon: 'fas fa-calendar' },
      { id: 'statistics', name: 'Thống kê', icon: 'fas fa-chart-bar' }
    ]
    
    const weekDays = [
      { id: 2, name: 'Thứ 2' },
      { id: 3, name: 'Thứ 3' },
      { id: 4, name: 'Thứ 4' },
      { id: 5, name: 'Thứ 5' },
      { id: 6, name: 'Thứ 6' },
      { id: 7, name: 'Thứ 7' },
      { id: 8, name: 'Chủ nhật' }
    ]
    
    const handleOverlayClick = () => emit('close')

    // --- Helpers hiển thị thông tin ---
    const getStatusName = (status) => {
      const statuses = { 'active': 'Đang giảng dạy', 'on-break': 'Tạm nghỉ', 'resigned': 'Nghỉ việc' }
      return statuses[status] || status
    }
    const getStatusIcon = (status) => {
      const icons = { 'active': 'fas fa-check-circle', 'on-break': 'fas fa-pause-circle', 'resigned': 'fas fa-times-circle' }
      return icons[status] || 'fas fa-question-circle'
    }
    const getAcademicRankName = (rank) => {
      const ranks = { 'gs': 'Giáo sư', 'pgs': 'Phó giáo sư', 'ts': 'Tiến sĩ', 'ths': 'Thạc sĩ', 'ksh': 'Kỹ sư', 'cn': 'Cử nhân' }
      return ranks[rank] || rank
    }
    const getGenderName = (gender) => ({ 'male': 'Nam', 'female': 'Nữ', 'other': 'Khác' })[gender] || gender
    
    const getPositionName = (t) => {
      if (!t) return '-'
      const pos = t.position
      if (pos && typeof pos === 'string' && isNaN(Number(pos))) return pos
      const nested = t.raw?.Teacher?.Position?.position_name || t.raw?.Position?.position_name || t.teacher?.Position?.position_name || t.teacher?.position_name
      if (nested) return nested
      return pos ? String(pos) : '-'
    }
    
    const formatDate = (date) => date ? new Date(date).toLocaleDateString('vi-VN') : null
    
    const getScheduleByDay = (dayId) => teacherSchedule.value.filter(schedule => schedule.dayOfWeek === dayId)

    // --- FETCH DATA LOGIC ---

    // 1. Fetch Subjects (Course Classes) - Môn đang dạy
    const loadTeacherSubjects = async () => {
      if (!props.teacher?.code) return
      isLoadingSubjects.value = true
      try {
        console.log('[TeacherViewModal] loadTeacherSubjects called for teacher:', props.teacher?.code)
        // Gọi API listCourseClasses với tham số teacher_code
        const response = await courseClassService.listCourseClasses({
          page: 1,
          limit: 100, // Lấy nhiều để hiển thị
          teacher_code: props.teacher.code, // Quan trọng: Truyền code giảng viên
          status: 'active' // Chỉ lấy lớp đang hoạt động
        })

        // Map dữ liệu từ API sang cấu trúc UI cần
        // Giả định response có thể trả về nhiều dạng: response.items, response.data (object) hoặc response (array)
        const raw = response.data ?? response.items ?? response ?? []
        const itemsList = Array.isArray(raw)
          ? raw
          : (Array.isArray(raw.items) ? raw.items : (Array.isArray(raw.data) ? raw.data : []))
        console.log('[TeacherViewModal] loadTeacherSubjects response:', response)
        console.log('[TeacherViewModal] loadTeacherSubjects itemsList length:', itemsList.length)

        teacherSubjects.value = itemsList.map(item => ({
          id: item._id || item.id,
          name: item.course_name || item.Course?.name || item.Course?.course_name || item.course?.name || item.course?.course_name || item.Course?.Course?.name || item.course?.Course?.name || item.Course?.Subject?.name || item.Course?.Subject?.subject_name || item.Subject?.name || item.subject?.subject_name || item.subject?.name || item.name || item.title || item.courseName || item.Course?.display || item.course?.display || 'Chưa đặt tên', // many fallbacks
          code: item.course_code || item.Course?.code || item.code || item.course?.code || item.courseCode || item.Course?.course_code || item.Course?.Course?.code || item.course?.Course?.code || '', // Mã học phần
          credits: item.credits || item.Course?.credits || item.course?.credits || item.credit || 0,
          studentCount: item.student_count || item.total_students || item.students?.length || item.studentCount || 0,
          semesterName: item.semester_name || item.Semester?.name || item.semester?.name || 'N/A'
        }))
        console.log('[TeacherViewModal] teacherSubjects mapped count:', teacherSubjects.value.length)
        if (itemsList.length > 0) console.log('[TeacherViewModal] first raw subject', itemsList[0], 'first mapped', teacherSubjects.value[0])
      } catch (error) {
        console.error('Failed to load teacher subjects:', error)
        // Có thể thêm toast notification ở đây
      } finally {
        isLoadingSubjects.value = false
      }
    }

    // 2. Fetch Classes (Office Classes) - Lớp chủ nhiệm/hành chính
    const loadTeacherClasses = async () => {
      if (!props.teacher?.code) return
      isLoadingClasses.value = true
      try {
        console.log('[TeacherViewModal] loadTeacherClasses called for teacher:', props.teacher?.code)
        const response = await officeClassService.listOfficeClasses({
          page: 1,
          limit: 100,
          teacher_code: props.teacher.code // Lọc theo giảng viên chủ nhiệm
        })

        const raw = response.data ?? response.items ?? response ?? []
        const itemsList = Array.isArray(raw)
          ? raw
          : (Array.isArray(raw.items) ? raw.items : (Array.isArray(raw.data) ? raw.data : []))
        console.log('[TeacherViewModal] loadTeacherClasses response:', response)
        console.log('[TeacherViewModal] loadTeacherClasses itemsList length:', itemsList.length)

        // Normalize mapping using mapOfficeClass helper to handle nested/varied shapes
        const mappedClasses = itemsList.map(item => mapOfficeClass(item))
        teacherClasses.value = mappedClasses.map(c => ({
          id: c.id,
          name: c.name || c.code || `Lớp ${c.id}`,
          code: c.code || c.id,
          studentCount: c.studentCount || 0,
          year: c.academicYearName || c.academic_year_id || c.course || 'N/A'
        }))
        console.log('[TeacherViewModal] teacherClasses mapped count:', teacherClasses.value.length)
        if (itemsList.length > 0) console.log('[TeacherViewModal] teacherClasses first mapped:', teacherClasses.value[0], 'first raw:', itemsList[0])
      } catch (error) {
        console.error('Failed to load teacher office classes:', error)
      } finally {
        isLoadingClasses.value = false
      }
    }

    // Mock Schedule (Giữ nguyên hoặc cần viết service riêng nếu có API lịch)
    const loadScheduleData = () => {
      // Logic lấy lịch nên được tách ra service riêng (VD: scheduleService)
      // Hiện tại giữ mock để demo UI
      teacherSchedule.value = [
        { id: 1, dayOfWeek: 2, time: '07:00 - 09:00', subjectName: 'Lập trình Web', roomName: 'A101' },
      ]
    }

    // --- WATCHERS ---
    
    // Khi mở modal -> Reset tab về personal
    watch(() => props.isOpen, (val) => {
      if (val) {
        activeTab.value = 'personal'
      }
    })

    // Khi chuyển tab -> Gọi API tương ứng (Lazy load)
    watch(activeTab, (newTab) => {
      if (!props.teacher) return

      switch (newTab) {
        case 'subjects':
          if (teacherSubjects.value.length === 0) loadTeacherSubjects()
          break
        case 'classes':
          if (teacherClasses.value.length === 0) loadTeacherClasses()
          break
        case 'schedule':
          if (teacherSchedule.value.length === 0) loadScheduleData()
          break
      }
    })

    // Nút refresh thủ công
    const refreshSubjects = () => loadTeacherSubjects()
    const refreshClasses = () => loadTeacherClasses()

    // Navigation (Giữ nguyên logic cũ hoặc điều hướng thật)
    const viewSubject = (subject) => {
      console.log('Navigate to subject:', subject.id)
      // router.push(...)
    }
    const viewClass = (classItem) => {
      console.log('Navigate to class:', classItem.id)
    }

    onBeforeUnmount(() => {
      for (const v of avatarBlobMap.value.values()) revokeBlobUrl(v)
      avatarBlobMap.value.clear()
      avatarFailedSet.value.clear()
    })
    
    return {
      activeTab,
      selectedWeek,
      teacherSubjects,
      teacherClasses,
      teacherSchedule,
      tabs,
      weekDays,
      handleOverlayClick,
      avatarSrc,
      onAvatarError,
      getStatusName,
      getStatusIcon,
      getAcademicRankName,
      getGenderName,
      getPositionName,
      formatDate,
      getScheduleByDay,
      
      // Expose actions
      refreshSubjects,
      refreshClasses,
      viewSubject,
      viewClass,
      
      // Helpers & Loading state
      avatarBlobMap,
      avatarFailedSet,
      isLoadingSubjects,
      isLoadingClasses
    }
  }
}
</script>

<style scoped>
.loading-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-style: italic;
}
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
  /* header and other elements use very high z-index (e.g. 99999). Ensure modal sits on top */
  z-index: 100002 !important;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-header h3 {
  margin: 0;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
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
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.profile-header {
  display: flex;
  gap: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 32px;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.basic-info {
  flex: 1;
}

.basic-info h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.teacher-code {
  margin: 0 0 12px 0;
  font-size: 16px;
  opacity: 0.9;
  font-family: 'Monaco', 'Consolas', monospace;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.quick-stats {
  display: flex;
  gap: 24px;
}

.stat {
  text-align: center;
}

.stat .number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.stat .label {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.tab-navigation {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.tab-button {
  flex: 1;
  padding: 16px 20px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: #374151;
  background: #f9fafb;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #eff6ff;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.tab-panel {
  padding: 24px;
}

.info-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.info-section h4 {
  margin: 0 0 16px 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-section h4:before {
  content: '';
  width: 4px;
  height: 16px;
  background: #3b82f6;
  border-radius: 2px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  font-size: 14px;
  color: #111827;
  font-weight: 500;
}

.academic-rank {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.academic-rank.gs,
.academic-rank.pgs {
  background: #dc2626;
}

.academic-rank.ts {
  background: #7c3aed;
}

.academic-rank.ths {
  background: #059669;
}

.academic-rank.ksh,
.academic-rank.cn {
  background: #0891b2;
}

.notes {
  margin: 0;
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h4 {
  margin: 0;
  color: #374151;
  font-size: 18px;
  font-weight: 600;
}

.section-actions {
  display: flex;
  gap: 12px;
}

.btn-refresh,
.week-selector {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-refresh:hover {
  background: #f3f4f6;
}

.subjects-list,
.classes-list {
  display: grid;
  gap: 16px;
}

.subject-card,
.class-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.subject-card:hover,
.class-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.subject-info h5,
.class-info h5 {
  margin: 0 0 4px 0;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
}

.subject-code,
.class-code {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 14px;
  font-family: 'Monaco', 'Consolas', monospace;
}

.subject-meta,
.class-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.subject-meta span,
.class-meta span {
  padding: 2px 6px;
  background: #f3f4f6;
  border-radius: 4px;
  color: #6b7280;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #dbeafe;
  color: #1d4ed8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #bfdbfe;
}

.empty-subjects,
.empty-classes {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.empty-subjects i,
.empty-classes i {
  font-size: 32px;
  color: #d1d5db;
  margin-bottom: 12px;
  display: block;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}

.schedule-day {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.schedule-day h5 {
  margin: 0;
  padding: 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-align: center;
}

.day-schedule {
  padding: 8px;
}

.schedule-item {
  padding: 8px;
  margin-bottom: 8px;
  background: #eff6ff;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

.schedule-item:last-child {
  margin-bottom: 0;
}

.schedule-item .time {
  font-size: 12px;
  font-weight: 600;
  color: #1d4ed8;
}

.schedule-item .subject {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  margin: 2px 0;
}

.schedule-item .room {
  font-size: 11px;
  color: #6b7280;
}

.no-schedule {
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stat-icon.subjects {
  background: #8b5cf6;
}

.stat-icon.classes {
  background: #06b6d4;
}

.stat-icon.students {
  background: #10b981;
}

.stat-icon.hours {
  background: #f59e0b;
}

.stat-info h4 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.stat-info p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-edit,
.btn-close-modal {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-edit {
  background: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.btn-edit:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-close-modal {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-close-modal:hover {
  background: #f3f4f6;
  color: #374151;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .quick-stats {
    justify-content: center;
  }
  
  .tab-navigation {
    flex-wrap: wrap;
  }
  
  .tab-button {
    flex: none;
    min-width: 50%;
  }
  
  .schedule-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>