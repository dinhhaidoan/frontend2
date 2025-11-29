<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <div class="student-header-info">
          <img
            v-if="student.avatar && (!(_failed.has(student.avatar)) || _blobMap.value.has(student.avatar))"
            :src="avatarSrc(student.avatar)"
            :alt="student.fullName"
            @error="onAvatarError($event, student.avatar)"
          />
          <img v-else :src="'/default-avatar.png'" :alt="student.fullName" />
          <div>
            <h2>{{ student.fullName }}</h2>
            <p>{{ student.studentCode }}</p>
          </div>
        </div>
        <button @click="close" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Tab Navigation -->
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="{ active: activeTab === tab.id }"
            class="tab-button"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Thông tin cá nhân -->
          <div v-if="activeTab === 'personal'" class="info-section">
            <h3><i class="fas fa-user"></i> Thông tin cá nhân</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Mã sinh viên:</span>
                <span class="value">{{ student.studentCode }}</span>
              </div>
              <div class="info-item">
                <span class="label">Họ và tên:</span>
                <span class="value">{{ student.fullName }}</span>
              </div>
              <div class="info-item">
                <span class="label">Ngày sinh:</span>
                <span class="value">{{ formatDate(student.dateOfBirth) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Giới tính:</span>
                <span class="value">{{ getGenderLabel(student.gender) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Email:</span>
                <span class="value">{{ student.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">Số điện thoại:</span>
                <span class="value">{{ student.phoneNumber || 'Chưa cập nhật' }}</span>
              </div>
              <div class="info-item full-width">
                <span class="label">Địa chỉ:</span>
                <span class="value">{{ student.address || 'Chưa cập nhật' }}</span>
              </div>
              <div class="info-item">
                <span class="label">CCCD/CMND:</span>
                <span class="value">{{ student.identityCard || 'Chưa cập nhật' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Nơi sinh:</span>
                <span class="value">{{ student.birthPlace || 'Chưa cập nhật' }}</span>
              </div>
            </div>

            <h3><i class="fas fa-users"></i> Thông tin phụ huynh</h3>
            <div class="info-grid">
              <template v-if="student.parents && student.parents.length">
                <div v-for="(p, i) in student.parents" :key="i" class="info-item">
                  <span class="label">Họ tên phụ huynh {{ i + 1 }}:</span>
                  <span class="value">{{ p.parent_name || p.name || p.parentName || 'Chưa cập nhật' }}</span>
                </div>
                <div v-for="(p, i) in student.parents" :key="'phone-'+i" class="info-item">
                  <span class="label">SĐT phụ huynh {{ i + 1 }}:</span>
                  <span class="value">{{ p.parent_contact || p.contact || p.parent_phone || 'Chưa cập nhật' }}</span>
                </div>
              </template>
              <template v-else>
                <div class="info-item">
                  <span class="label">Họ tên:</span>
                  <span class="value">{{ student.parentName || 'Chưa cập nhật' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Số điện thoại:</span>
                  <span class="value">{{ student.parentPhone || 'Chưa cập nhật' }}</span>
                </div>
              </template>
            </div>
          </div>

          <!-- Thông tin học vụ -->
          <div v-if="activeTab === 'academic'" class="info-section">
            <div class="academic-summary">
              <div class="summary-card">
                <i class="fas fa-graduation-cap"></i>
                <div>
                  <h4>{{ student.major }}</h4>
                  <p>Ngành học</p>
                </div>
              </div>
              <div class="summary-card">
                <i class="fas fa-users"></i>
                <div>
                  <h4>{{ student.officialClass }}</h4>
                  <p>Lớp hành chính</p>
                </div>
              </div>
              <div class="summary-card">
                <i class="fas fa-calendar"></i>
                <div>
                  <h4>K{{ student.course }}</h4>
                  <p>Khóa học</p>
                </div>
              </div>
              <div class="summary-card">
                <i class="fas fa-info-circle"></i>
                <div>
                  <h4>{{ getStatusLabel(student.status) }}</h4>
                  <p>Trạng thái</p>
                </div>
              </div>
            </div>

            <h3><i class="fas fa-chart-line"></i> Thành tích học tập</h3>
            <div class="academic-stats">
              <div class="stat-box">
                <div class="stat-icon" style="background: #e3f2fd; color: #1976d2;">
                  <i class="fas fa-star"></i>
                </div>
                <div class="stat-info">
                  <h4>{{ student.gpa?.toFixed(2) || '0.00' }}</h4>
                  <p>GPA</p>
                  <span class="grade-label">{{ getGradeLabel(student.gpa) }}</span>
                </div>
              </div>
              <div class="stat-box">
                <div class="stat-icon" style="background: #f3e5f5; color: #7b1fa2;">
                  <i class="fas fa-award"></i>
                </div>
                <div class="stat-info">
                  <h4>{{ student.credits || 0 }}</h4>
                  <p>Tín chỉ tích lũy</p>
                </div>
              </div>
              <div class="stat-box">
                <div class="stat-icon" style="background: #e8f5e9; color: #2e7d32;">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                  <h4>{{ student.completedSubjects || 0 }}</h4>
                  <p>Môn đã hoàn thành</p>
                </div>
              </div>
              <div class="stat-box">
                <div class="stat-icon" style="background: #fff3e0; color: #e65100;">
                  <i class="fas fa-redo"></i>
                </div>
                <div class="stat-info">
                  <h4>{{ student.retakeSubjects || 0 }}</h4>
                  <p>Môn học lại</p>
                </div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="label">Ngày nhập học:</span>
                <span class="value">{{ formatDate(student.enrollmentDate) }}</span>
              </div>
            </div>
          </div>

          <!-- Đăng ký học phần -->
          <div v-if="activeTab === 'courses'" class="info-section">
            <div class="section-header">
              <h3><i class="fas fa-book"></i> Học phần đã đăng ký</h3>
              <select v-model="selectedSemester" class="semester-select">
                <option value="">Tất cả học kỳ</option>
                <option value="1_2024">HK1 2024-2025</option>
                <option value="2_2024">HK2 2024-2025</option>
                <option value="1_2023">HK1 2023-2024</option>
              </select>
            </div>

            <div class="courses-list">
              <div v-for="course in registeredCourses" :key="course.id" class="course-item">
                <div class="course-info">
                  <h4>{{ course.name }}</h4>
                  <p>Mã HP: {{ course.code }} | {{ course.credits }} TC</p>
                </div>
                <div class="course-details">
                  <span class="course-semester">{{ course.semester }}</span>
                  <span class="course-status" :class="course.status">
                    {{ getCourseStatusLabel(course.status) }}
                  </span>
                </div>
                <div v-if="course.grades" class="course-grades">
                  <span>Giữa kỳ: <strong>{{ course.grades.midterm || 'N/A' }}</strong></span>
                  <span>Cuối kỳ: <strong>{{ course.grades.final || 'N/A' }}</strong></span>
                  <span>Tổng kết: <strong>{{ course.grades.total || 'N/A' }}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Lịch sử học tập -->
          <div v-if="activeTab === 'progress'" class="info-section">
            <h3><i class="fas fa-history"></i> Tiến độ học tập qua các kỳ</h3>
            
            <div class="progress-chart">
              <div v-for="semester in academicProgress" :key="semester.id" class="semester-progress">
                <div class="semester-header">
                  <h4>{{ semester.name }}</h4>
                  <span class="semester-year">{{ semester.year }}</span>
                </div>
                <div class="semester-stats">
                  <div class="progress-item">
                    <span class="progress-label">GPA:</span>
                    <span class="progress-value" :class="getGPAClass(semester.gpa)">
                      {{ semester.gpa.toFixed(2) }}
                    </span>
                  </div>
                  <div class="progress-item">
                    <span class="progress-label">Tín chỉ:</span>
                    <span class="progress-value">{{ semester.credits }} TC</span>
                  </div>
                  <div class="progress-item">
                    <span class="progress-label">Tích lũy:</span>
                    <span class="progress-value">{{ semester.totalCredits }} TC</span>
                  </div>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: (semester.totalCredits / 140) * 100 + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <h3><i class="fas fa-tasks"></i> Môn còn thiếu theo chương trình đào tạo</h3>
            <div v-if="missingCourses.length > 0" class="missing-courses">
              <div class="missing-course-summary">
                <div class="summary-card">
                  <i class="fas fa-book-open"></i>
                  <div>
                    <h4>{{ missingCourses.length }}</h4>
                    <p>Môn còn thiếu</p>
                  </div>
                </div>
                <div class="summary-card">
                  <i class="fas fa-calculator"></i>
                  <div>
                    <h4>{{ totalMissingCredits }}</h4>
                    <p>Tín chỉ còn lại</p>
                  </div>
                </div>
                <div class="summary-card">
                  <i class="fas fa-percent"></i>
                  <div>
                    <h4>{{ completionPercentage }}%</h4>
                    <p>Hoàn thành</p>
                  </div>
                </div>
              </div>

              <div class="missing-courses-table">
                <table>
                  <thead>
                    <tr>
                      <th>Mã HP</th>
                      <th>Tên học phần</th>
                      <th>Tín chỉ</th>
                      <th>Học kỳ đề xuất</th>
                      <th>Loại</th>
                      <th>Môn tiên quyết</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="course in missingCourses" :key="course.id">
                      <td><strong>{{ course.code }}</strong></td>
                      <td>{{ course.name }}</td>
                      <td class="text-center">{{ course.credits }}</td>
                      <td>{{ course.suggestedSemester }}</td>
                      <td>
                        <span class="course-type-badge" :class="course.type">
                          {{ getCourseTypeLabel(course.type) }}
                        </span>
                      </td>
                      <td>
                        <span v-if="course.prerequisites" class="prerequisites">
                          {{ course.prerequisites }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="empty-state">
              <i class="fas fa-check-circle"></i>
              <p>Đã hoàn thành chương trình đào tạo</p>
            </div>

            <h3><i class="fas fa-exclamation-triangle"></i> Cảnh báo học tập</h3>
            <div v-if="warnings.length > 0" class="warnings-list">
              <div v-for="warning in warnings" :key="warning.id" class="warning-item" :class="warning.level">
                <i :class="warning.icon"></i>
                <div>
                  <h4>{{ warning.title }}</h4>
                  <p>{{ warning.description }}</p>
                  <small>{{ formatDate(warning.date) }}</small>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <i class="fas fa-check-circle"></i>
              <p>Không có cảnh báo nào</p>
            </div>
          </div>

          <!-- Lịch sử thay đổi -->
          <div v-if="activeTab === 'history'" class="info-section">
            <h3><i class="fas fa-clock"></i> Lịch sử thay đổi</h3>
            
            <div class="timeline">
              <div v-for="event in statusHistory" :key="event.id" class="timeline-item">
                <div class="timeline-marker" :class="event.type"></div>
                <div class="timeline-content">
                  <h4>{{ event.title }}</h4>
                  <p>{{ event.description }}</p>
                  <div class="timeline-meta">
                    <span><i class="fas fa-user"></i> {{ event.updatedBy }}</span>
                    <span><i class="fas fa-calendar"></i> {{ formatDate(event.date) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('edit', student)" class="btn-edit">
          <i class="fas fa-edit"></i> Chỉnh sửa
        </button>
        <button @click="printProfile" class="btn-print">
          <i class="fas fa-print"></i> In hồ sơ
        </button>
        <button @click="close" class="btn-close-footer">
          <i class="fas fa-times"></i> Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { fetchImageAsBlobUrl, revokeBlobUrl } from '@/composables/useAvatarLoader'

const props = defineProps({
  isOpen: Boolean,
  student: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'edit'])

const activeTab = ref('personal')
const selectedSemester = ref('')

const tabs = [
  { id: 'personal', label: 'Thông tin cá nhân', icon: 'fas fa-user' },
  { id: 'academic', label: 'Học vụ', icon: 'fas fa-graduation-cap' },
  { id: 'courses', label: 'Học phần', icon: 'fas fa-book' },
  { id: 'progress', label: 'Tiến độ', icon: 'fas fa-chart-line' },
  { id: 'history', label: 'Lịch sử', icon: 'fas fa-clock' }
]

const _blobMap = ref(new Map())
const _failed = ref(new Set())

const avatarSrc = (url) => {
  if (!url) return ''
  if (_blobMap.value.has(url)) return _blobMap.value.get(url)
  return url
}

const onAvatarError = async (ev, url) => {
  if (!url) return
  if (ev && ev.target && ev.target.dataset && ev.target.dataset._fetchTried === '1') {
    _failed.value.add(url)
    try { ev.target.style.display = 'none' } catch (e) {}
    return
  }
  if (ev && ev.target && ev.target.dataset) ev.target.dataset._fetchTried = '1'
  try {
    const b = await fetchImageAsBlobUrl(url)
    if (b) {
      _blobMap.value.set(url, b)
      if (ev && ev.target) ev.target.src = b
      return
    }
  } catch (e) {
    _failed.value.add(url)
  }
  try { if (ev && ev.target) ev.target.style.display = 'none' } catch (e) {}
}

onBeforeUnmount(() => {
  for (const v of _blobMap.value.values()) revokeBlobUrl(v)
  _blobMap.value.clear()
  _failed.value.clear()
})

const registeredCourses = ref([
  {
    id: 1,
    code: 'IT001',
    name: 'Lập trình hướng đối tượng',
    credits: 4,
    semester: 'HK1 2024-2025',
    status: 'completed',
    grades: { midterm: 8.5, final: 9.0, total: 8.8 }
  },
  {
    id: 2,
    code: 'IT002',
    name: 'Cấu trúc dữ liệu và giải thuật',
    credits: 4,
    semester: 'HK1 2024-2025',
    status: 'studying',
    grades: { midterm: 7.0, final: null, total: null }
  }
])

const academicProgress = ref([
  { id: 1, name: 'HK1', year: '2024-2025', gpa: 3.5, credits: 18, totalCredits: 108 },
  { id: 2, name: 'HK2', year: '2023-2024', gpa: 3.2, credits: 20, totalCredits: 90 },
  { id: 3, name: 'HK1', year: '2023-2024', gpa: 3.0, credits: 22, totalCredits: 70 }
])

const warnings = ref([
  {
    id: 1,
    level: 'warning',
    icon: 'fas fa-exclamation-triangle',
    title: 'GPA thấp',
    description: 'GPA học kỳ 1 năm 2023-2024 dưới 2.5',
    date: '2024-01-15'
  }
])

// Mock data cho môn còn thiếu
const missingCourses = ref([
  {
    id: 1,
    code: 'IT301',
    name: 'Cơ sở dữ liệu nâng cao',
    credits: 4,
    suggestedSemester: 'HK2 2024-2025',
    type: 'required',
    prerequisites: 'IT201'
  },
  {
    id: 2,
    code: 'IT302',
    name: 'Lập trình Web',
    credits: 3,
    suggestedSemester: 'HK2 2024-2025',
    type: 'required',
    prerequisites: 'IT001, IT002'
  },
  {
    id: 3,
    code: 'IT401',
    name: 'Machine Learning',
    credits: 4,
    suggestedSemester: 'HK1 2025-2026',
    type: 'elective',
    prerequisites: 'IT301'
  },
  {
    id: 4,
    code: 'IT402',
    name: 'An toàn thông tin',
    credits: 3,
    suggestedSemester: 'HK1 2025-2026',
    type: 'required',
    prerequisites: null
  },
  {
    id: 5,
    code: 'IT403',
    name: 'DevOps và CI/CD',
    credits: 3,
    suggestedSemester: 'HK2 2025-2026',
    type: 'elective',
    prerequisites: 'IT302'
  }
])

// Computed properties cho phần môn còn thiếu
const totalMissingCredits = computed(() => {
  return missingCourses.value.reduce((sum, course) => sum + course.credits, 0)
})

const completionPercentage = computed(() => {
  const totalCreditsRequired = 140 // Tổng số tín chỉ cần thiết
  const currentCredits = props.student?.credits || 0
  return Math.round((currentCredits / totalCreditsRequired) * 100)
})

const statusHistory = ref([
  {
    id: 1,
    type: 'info',
    title: 'Thay đổi lớp học',
    description: 'Chuyển từ lớp 22IT1 sang 22IT2',
    updatedBy: 'Admin',
    date: '2024-09-01'
  },
  {
    id: 2,
    type: 'success',
    title: 'Cập nhật thông tin',
    description: 'Cập nhật số điện thoại và địa chỉ',
    updatedBy: 'Sinh viên',
    date: '2024-08-15'
  }
])

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('vi-VN')
}

const getGenderLabel = (gender) => {
  const labels = { male: 'Nam', female: 'Nữ', other: 'Khác' }
  return labels[gender] || 'N/A'
}

const getStatusLabel = (status) => {
  const labels = {
    studying: 'Đang học',
    reserved: 'Bảo lưu',
    suspended: 'Nghỉ học',
    graduated: 'Tốt nghiệp',
    expelled: 'Thôi học'
  }
  return labels[status] || status
}

const getCourseStatusLabel = (status) => {
  const labels = {
    registered: 'Đã đăng ký',
    studying: 'Đang học',
    completed: 'Hoàn thành',
    failed: 'Trượt'
  }
  return labels[status] || status
}

const getGradeLabel = (gpa) => {
  if (gpa >= 3.6) return 'Xuất sắc'
  if (gpa >= 3.2) return 'Giỏi'
  if (gpa >= 2.5) return 'Khá'
  if (gpa >= 2.0) return 'Trung bình'
  return 'Yếu'
}

const getGPAClass = (gpa) => {
  if (gpa >= 3.6) return 'excellent'
  if (gpa >= 3.2) return 'good'
  if (gpa >= 2.5) return 'average'
  if (gpa >= 2.0) return 'fair'
  return 'poor'
}

const getCourseTypeLabel = (type) => {
  const labels = {
    required: 'Bắt buộc',
    elective: 'Tự chọn',
    general: 'Đại cương'
  }
  return labels[type] || type
}

const printProfile = () => {
  window.print()
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100001;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.student-header-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.student-header-info img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
}

.student-header-info h2 {
  margin: 0;
  font-size: 1.8rem;
}

.student-header-info p {
  margin: 5px 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  font-size: 1.3rem;
  transition: all 0.3s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #ecf0f1;
  overflow-x: auto;
}

.tab-button {
  padding: 12px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: #7f8c8d;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
}

.tab-button:hover {
  color: #667eea;
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-button i {
  margin-right: 8px;
}

.info-section h3 {
  color: #2c3e50;
  margin: 24px 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #ecf0f1;
  font-size: 1.1rem;
}

.info-section h3 i {
  color: #667eea;
  margin-right: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item .label {
  font-weight: 600;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.info-item .value {
  color: #2c3e50;
  font-size: 1rem;
}

.academic-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 12px;
  color: white;
  display: flex;
  align-items: center;
  gap: 15px;
}

.summary-card i {
  font-size: 2.5rem;
  opacity: 0.8;
}

.summary-card h4 {
  margin: 0;
  font-size: 1.3rem;
}

.summary-card p {
  margin: 5px 0 0;
  opacity: 0.9;
}

.academic-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-box {
  background: white;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.stat-info h4 {
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
}

.stat-info p {
  margin: 5px 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.grade-label {
  display: inline-block;
  padding: 2px 10px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.semester-select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.course-info h4 {
  margin: 0 0 5px;
  color: #2c3e50;
}

.course-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.course-details {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.course-semester {
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.course-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.course-status.completed {
  background: #c8e6c9;
  color: #2e7d32;
}

.course-status.studying {
  background: #fff9c4;
  color: #f57f17;
}

.course-grades {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e0e0e0;
  font-size: 0.9rem;
}

.progress-chart {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.semester-progress {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
}

.semester-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.semester-header h4 {
  margin: 0;
  color: #2c3e50;
}

.semester-year {
  color: #7f8c8d;
  font-weight: 600;
}

.semester-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.progress-item {
  display: flex;
  gap: 8px;
}

.progress-label {
  color: #7f8c8d;
  font-weight: 600;
}

.progress-value {
  color: #2c3e50;
  font-weight: 700;
}

.progress-value.excellent {
  color: #2e7d32;
}

.progress-value.good {
  color: #0277bd;
}

.progress-value.average {
  color: #f57f17;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.warnings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.warning-item {
  display: flex;
  gap: 15px;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid;
}

.warning-item.warning {
  background: #fff9c4;
  border-color: #f57f17;
  color: #f57f17;
}

.warning-item i {
  font-size: 1.5rem;
}

.warning-item h4 {
  margin: 0 0 5px;
}

.warning-item p {
  margin: 0 0 5px;
  color: #2c3e50;
}

.warning-item small {
  color: #7f8c8d;
}

/* Missing Courses Styles */
.missing-courses {
  margin-top: 16px;
}

.missing-course-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.missing-course-summary .summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.missing-course-summary .summary-card i {
  font-size: 32px;
  opacity: 0.9;
}

.missing-course-summary .summary-card h4 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.missing-course-summary .summary-card p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.missing-courses-table {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.missing-courses-table table {
  width: 100%;
  border-collapse: collapse;
}

.missing-courses-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
  font-size: 14px;
}

.missing-courses-table td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
}

.missing-courses-table tr:last-child td {
  border-bottom: none;
}

.missing-courses-table tr:hover {
  background: #f8f9fa;
}

.course-type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.course-type-badge.required {
  background: #fff3cd;
  color: #856404;
}

.course-type-badge.elective {
  background: #d1ecf1;
  color: #0c5460;
}

.course-type-badge.general {
  background: #d4edda;
  color: #155724;
}

.prerequisites {
  color: #667eea;
  font-weight: 500;
  font-size: 13px;
}

.text-center {
  text-align: center !important;
}

.text-muted {
  color: #95a5a6;
}

.timeline {
  position: relative;
  padding-left: 40px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-marker {
  position: absolute;
  left: -32px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid #667eea;
  background: white;
}

.timeline-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
}

.timeline-content h4 {
  margin: 0 0 8px;
  color: #2c3e50;
}

.timeline-content p {
  margin: 0 0 12px;
  color: #7f8c8d;
}

.timeline-meta {
  display: flex;
  gap: 20px;
  font-size: 0.85rem;
  color: #95a5a6;
}

.timeline-meta i {
  margin-right: 5px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #95a5a6;
}

.empty-state i {
  font-size: 3rem;
  color: #27ae60;
  margin-bottom: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 2px solid #ecf0f1;
}

.btn-edit,
.btn-print,
.btn-close-footer {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background: #f39c12;
  color: white;
}

.btn-edit:hover {
  background: #e67e22;
}

.btn-print {
  background: #3498db;
  color: white;
}

.btn-print:hover {
  background: #2980b9;
}

.btn-close-footer {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-close-footer:hover {
  background: #bdc3c7;
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .info-grid,
  .academic-summary,
  .academic-stats {
    grid-template-columns: 1fr;
  }

  .semester-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
