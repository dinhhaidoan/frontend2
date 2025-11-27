<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2>
          <i class="fas fa-book"></i>
          Quản lý đăng ký học phần - {{ student.fullName }}
        </h2>
        <button @click="close" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Student Info -->
        <div class="student-summary">
          <div class="summary-item">
            <span class="label">Mã SV:</span>
            <span class="value">{{ student.studentCode }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Lớp:</span>
            <span class="value">{{ student.officialClass }}</span>
          </div>
          <div class="summary-item">
            <span class="label">GPA:</span>
            <span class="value gpa">{{ student.gpa?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Tín chỉ tích lũy:</span>
            <span class="value credits">{{ student.credits || 0 }} TC</span>
          </div>
        </div>

        <!-- Semester Selection -->
        <div class="semester-section">
          <div class="section-header">
            <h3><i class="fas fa-calendar"></i> Chọn học kỳ</h3>
            <select v-model="selectedSemester" class="semester-select">
              <option v-for="sem in semesters" :key="sem.id" :value="sem.id">
                {{ sem.name }} ({{ sem.year }})
              </option>
            </select>
          </div>

          <div class="semester-stats">
            <div class="stat-box">
              <i class="fas fa-book-open"></i>
              <div>
                <strong>{{ currentSemesterStats.registered }}</strong>
                <span>Đã đăng ký</span>
              </div>
            </div>
            <div class="stat-box">
              <i class="fas fa-hourglass-half"></i>
              <div>
                <strong>{{ currentSemesterStats.studying }}</strong>
                <span>Đang học</span>
              </div>
            </div>
            <div class="stat-box">
              <i class="fas fa-check-circle"></i>
              <div>
                <strong>{{ currentSemesterStats.completed }}</strong>
                <span>Hoàn thành</span>
              </div>
            </div>
            <div class="stat-box">
              <i class="fas fa-award"></i>
              <div>
                <strong>{{ currentSemesterStats.credits }}</strong>
                <span>Tín chỉ</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Course List -->
        <div class="courses-section">
          <div class="section-header">
            <h3><i class="fas fa-list"></i> Danh sách học phần</h3>
            <button @click="showAddCourseModal = true" class="btn-add-course">
              <i class="fas fa-plus"></i> Thêm học phần
            </button>
          </div>

          <div class="courses-table">
            <table>
              <thead>
                <tr>
                  <th>Mã HP</th>
                  <th>Tên học phần</th>
                  <th>Tín chỉ</th>
                  <th>Trạng thái</th>
                  <th>Điểm GK</th>
                  <th>Điểm CK</th>
                  <th>Tổng kết</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="course in filteredCourses" :key="course.id">
                  <td><strong>{{ course.code }}</strong></td>
                  <td>{{ course.name }}</td>
                  <td><span class="credits-badge">{{ course.credits }} TC</span></td>
                  <td>
                    <span class="status-badge" :class="course.status">
                      {{ getCourseStatusLabel(course.status) }}
                    </span>
                  </td>
                  <td>
                    <input
                      v-if="course.status === 'studying' || course.status === 'completed'"
                      v-model.number="course.grades.midterm"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      class="grade-input"
                      @change="updateGrade(course)"
                    />
                    <span v-else>-</span>
                  </td>
                  <td>
                    <input
                      v-if="course.status === 'completed'"
                      v-model.number="course.grades.final"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      class="grade-input"
                      @change="updateGrade(course)"
                    />
                    <span v-else>-</span>
                  </td>
                  <td>
                    <span v-if="course.grades.total !== null" class="total-grade" :class="getGradeClass(course.grades.total)">
                      {{ course.grades.total.toFixed(1) }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                        @click="changeStatus(course)"
                        class="btn-icon"
                        title="Đổi trạng thái"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        @click="removeCourse(course)"
                        class="btn-icon delete"
                        title="Hủy đăng ký"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="filteredCourses.length === 0" class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>Chưa có học phần nào được đăng ký</p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="close" class="btn-close-footer">
          <i class="fas fa-times"></i> Đóng
        </button>
        <button @click="handleSave" class="btn-save">
          <i class="fas fa-save"></i> Lưu thay đổi
        </button>
      </div>
    </div>
  </div>

  <!-- Add Course Modal -->
  <div v-if="showAddCourseModal" class="modal-overlay" @click.self="showAddCourseModal = false">
    <div class="modal-small">
      <h3><i class="fas fa-plus"></i> Thêm học phần</h3>
      
      <div class="form-group">
        <label>Chọn học phần <span class="required">*</span></label>
        <select v-model="newCourseId">
          <option value="">Chọn học phần</option>
          <option v-for="course in availableCourses" :key="course.id" :value="course.id">
            {{ course.code }} - {{ course.name }} ({{ course.credits }} TC)
          </option>
        </select>
      </div>

      <div class="modal-actions">
        <button @click="showAddCourseModal = false" class="btn-cancel">Hủy</button>
        <button @click="addCourse" :disabled="!newCourseId" class="btn-confirm">Thêm</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSemesters } from '@/hooks/useSemesters'

const props = defineProps({
  isOpen: Boolean,
  student: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'save'])

const selectedSemester = ref(null)
const showAddCourseModal = ref(false)
const newCourseId = ref('')

const { semesters, fetchSemesters } = useSemesters()

onMounted(async () => {
  try {
    await fetchSemesters({ page: 1, limit: 100 })
    if (!selectedSemester.value && semesters.value && semesters.value.length) {
      selectedSemester.value = semesters.value[0].id
    }
  } catch (e) {
    console.error('Failed to fetch semesters for CourseRegistrationModal', e)
  }
})

const registeredCourses = ref([
  {
    id: 1,
    code: 'IT001',
    name: 'Lập trình hướng đối tượng',
    credits: 4,
    semester: '1_2024',
    status: 'completed',
    grades: { midterm: 8.5, final: 9.0, total: 8.8 }
  },
  {
    id: 2,
    code: 'IT002',
    name: 'Cấu trúc dữ liệu và giải thuật',
    credits: 4,
    semester: '1_2024',
    status: 'studying',
    grades: { midterm: 7.0, final: null, total: null }
  },
  {
    id: 3,
    code: 'IT003',
    name: 'Cơ sở dữ liệu',
    credits: 3,
    semester: '1_2024',
    status: 'registered',
    grades: { midterm: null, final: null, total: null }
  }
])

const availableCourses = ref([
  { id: 4, code: 'IT004', name: 'Mạng máy tính', credits: 3 },
  { id: 5, code: 'IT005', name: 'Hệ điều hành', credits: 3 },
  { id: 6, code: 'IT006', name: 'Công nghệ phần mềm', credits: 4 }
])

const filteredCourses = computed(() => {
  return registeredCourses.value.filter((c) => c.semester === selectedSemester.value)
})

const currentSemesterStats = computed(() => {
  const courses = filteredCourses.value
  return {
    registered: courses.length,
    studying: courses.filter((c) => c.status === 'studying').length,
    completed: courses.filter((c) => c.status === 'completed').length,
    credits: courses.reduce((sum, c) => sum + c.credits, 0)
  }
})

const getCourseStatusLabel = (status) => {
  const labels = {
    registered: 'Đã đăng ký',
    studying: 'Đang học',
    completed: 'Hoàn thành',
    failed: 'Trượt'
  }
  return labels[status] || status
}

const getGradeClass = (grade) => {
  if (grade >= 8.5) return 'excellent'
  if (grade >= 7.0) return 'good'
  if (grade >= 5.5) return 'average'
  if (grade >= 4.0) return 'fair'
  return 'poor'
}

const updateGrade = (course) => {
  if (course.grades.midterm !== null && course.grades.final !== null) {
    course.grades.total = course.grades.midterm * 0.4 + course.grades.final * 0.6
  }
}

const changeStatus = (course) => {
  const statuses = ['registered', 'studying', 'completed', 'failed']
  const currentIndex = statuses.indexOf(course.status)
  const nextIndex = (currentIndex + 1) % statuses.length
  course.status = statuses[nextIndex]
}

const removeCourse = (course) => {
  if (confirm(`Bạn có chắc chắn muốn hủy đăng ký học phần "${course.name}"?`)) {
    const index = registeredCourses.value.findIndex((c) => c.id === course.id)
    if (index !== -1) {
      registeredCourses.value.splice(index, 1)
    }
  }
}

const addCourse = () => {
  if (!newCourseId.value) return

  const course = availableCourses.value.find((c) => c.id === newCourseId.value)
  if (course) {
    registeredCourses.value.push({
      ...course,
      id: Date.now(),
      semester: selectedSemester.value,
      status: 'registered',
      grades: { midterm: null, final: null, total: null }
    })

    // Remove from available
    const index = availableCourses.value.findIndex((c) => c.id === newCourseId.value)
    if (index !== -1) {
      availableCourses.value.splice(index, 1)
    }
  }

  showAddCourseModal.value = false
  newCourseId.value = ''
}

const handleSave = () => {
  emit('save', {
    studentId: props.student.id,
    courses: registeredCourses.value
  })
  close()
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
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
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

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.modal-header h2 i {
  margin-right: 10px;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.student-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item .label {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 600;
}

.summary-item .value {
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 700;
}

.value.gpa {
  color: #667eea;
}

.value.credits {
  color: #7b1fa2;
}

.semester-section,
.courses-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.section-header h3 i {
  color: #667eea;
  margin-right: 8px;
}

.semester-select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-weight: 600;
}

.semester-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.stat-box {
  background: white;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-box i {
  font-size: 1.8rem;
  color: #667eea;
}

.stat-box strong {
  display: block;
  font-size: 1.5rem;
  color: #2c3e50;
}

.stat-box span {
  display: block;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.btn-add-course {
  background: #27ae60;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-add-course:hover {
  background: #229954;
  transform: translateY(-2px);
}

.btn-add-course i {
  margin-right: 6px;
}

.courses-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

thead {
  background: #f8f9fa;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

th {
  font-weight: 600;
  color: #2c3e50;
}

.credits-badge {
  background: #f3e5f5;
  color: #7b1fa2;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.registered {
  background: #fff9c4;
  color: #f57f17;
}

.status-badge.studying {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.completed {
  background: #c8e6c9;
  color: #2e7d32;
}

.status-badge.failed {
  background: #ffcdd2;
  color: #c62828;
}

.grade-input {
  width: 60px;
  padding: 4px 8px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
}

.grade-input:focus {
  outline: none;
  border-color: #667eea;
}

.total-grade {
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 700;
}

.total-grade.excellent {
  background: #c8e6c9;
  color: #2e7d32;
}

.total-grade.good {
  background: #b3e5fc;
  color: #0277bd;
}

.total-grade.average {
  background: #fff9c4;
  color: #f57f17;
}

.total-grade.fair {
  background: #ffe0b2;
  color: #e65100;
}

.total-grade.poor {
  background: #ffcdd2;
  color: #c62828;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #e3f2fd;
  color: #1976d2;
  transition: all 0.3s;
}

.btn-icon:hover {
  background: #1976d2;
  color: white;
}

.btn-icon.delete {
  background: #ffcdd2;
  color: #c62828;
}

.btn-icon.delete:hover {
  background: #c62828;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #95a5a6;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 2px solid #ecf0f1;
}

.btn-close-footer,
.btn-save {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-close-footer {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-close-footer:hover {
  background: #bdc3c7;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Small Modal */
.modal-small {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-small h3 {
  margin: 0 0 20px;
  color: #2c3e50;
}

.modal-small h3 i {
  color: #667eea;
  margin-right: 8px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 8px;
}

.required {
  color: #e74c3c;
}

.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-cancel:hover {
  background: #bdc3c7;
}

.btn-confirm {
  background: #27ae60;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #229954;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .student-summary {
    grid-template-columns: 1fr;
  }

  .semester-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
