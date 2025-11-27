<template>
  <div class="students-manager-page">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-user-graduate"></i> Quản lý sinh viên</h1>
        <p>Quản lý thông tin, học vụ và tiến độ học tập của sinh viên</p>
      </div>
    </div>

    <div class="page-content">
      <!-- Statistics -->
      <StudentStats :stats="statistics" />

      <!-- Bulk Actions -->
      <BulkActions
        v-if="selectedStudents.length > 0"
        :selected-count="selectedStudents.length"
        @clear-selection="clearSelection"
        @change-class="handleBulkChangeClass"
        @change-status="handleBulkChangeStatus"
        @assign-advisor="handleBulkAssignAdvisor"
        @export="handleBulkExport"
        @send-notification="handleBulkNotification"
        @delete="handleBulkDelete"
      />

      <!-- Filters -->
      <StudentFilters @update:filters="handleFilterChange" />

      <!-- Student Table -->
      <StudentTable
        :students="filteredStudents"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        @add="openAddModal"
        @edit="openEditModal"
        @view="openViewModal"
        @delete="handleDelete"
        @import="openImportModal"
        @export="handleExport"
        @page-change="handlePageChange"
        @update:pageSize="handlePageSizeChange"
        @sort="handleSort"
      />
    </div>

    <!-- Modals -->
    <StudentModal
      :isOpen="showStudentModal"
      :student="selectedStudent"
      @close="closeStudentModal"
      @submit="handleSubmitStudent"
    />

    <StudentViewModal
      :isOpen="showViewModal"
      :student="selectedStudent"
      @close="closeViewModal"
      @edit="openEditFromView"
    />

    <ImportModal
      :isOpen="showImportModal"
      @close="closeImportModal"
      @import="handleImportData"
    />

    <!-- Delete Student Confirmation -->
    <ConfirmDialog
      :show="deleteStudentModalVisible"
      type="danger"
      title="Xác nhận xóa sinh viên"
      :message="studentToDelete ? `Bạn có chắc muốn xóa sinh viên ${studentToDelete.fullName || studentToDelete.studentCode}? Hành động này không thể hoàn tác.` : 'Bạn có chắc muốn xóa sinh viên này?'
      "
      confirmText="Xóa"
      cancelText="Hủy"
      @confirm="confirmDeleteStudent"
      @cancel="closeDeleteStudentModal"
    />

    <!-- Update Student Confirmation -->
    <ConfirmDialog
      :show="updateStudentModalVisible"
      type="warning"
      title="Xác nhận cập nhật thông tin sinh viên"
      :message="studentToUpdate ? `Bạn có chắc chắn muốn cập nhật thông tin sinh viên ${studentToUpdate.fullName || studentToUpdate.studentCode}?` : 'Bạn có chắc chắn muốn cập nhật thông tin sinh viên này?'
      "
      confirmText="Xác nhận"
      cancelText="Hủy"
      @confirm="confirmUpdateStudent"
      @cancel="closeUpdateStudentModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StudentStats from '@/components/Students-Manager/StudentStats.vue'
import StudentFilters from '@/components/Students-Manager/StudentFilters.vue'
import StudentTable from '@/components/Students-Manager/StudentTable.vue'
import StudentModal from '@/components/Students-Manager/StudentModal.vue'
import StudentViewModal from '@/components/Students-Manager/StudentViewModal.vue'
import BulkActions from '@/components/Students-Manager/BulkActions.vue'
import ImportModal from '@/components/Students-Manager/ImportModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

// State
const students = ref([])
const selectedStudents = ref([])
const filters = ref({})
const currentPage = ref(1)
const pageSize = ref(25)
const sortField = ref('')
const sortOrder = ref('asc')

const showStudentModal = ref(false)
const showViewModal = ref(false)
const showImportModal = ref(false)
const deleteStudentModalVisible = ref(false)
const studentToDelete = ref(null)
const updateStudentModalVisible = ref(false)
const studentToUpdate = ref(null)
const selectedStudent = ref(null)

// Mock data - Replace with API calls
const mockStudents = [
  {
    id: 1,
    studentCode: '2251052001',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@student.edu.vn',
    phoneNumber: '0123456789',
    dateOfBirth: '2004-01-15',
    gender: 'male',
    identityCard: '001234567890',
    address: 'TP. Hồ Chí Minh',
    birthPlace: 'TP. HCM',
    major: 'IT',
    course: '2022',
    officialClass: '22IT1',
    status: 'studying',
    gpa: 3.5,
    credits: 108,
    completedSubjects: 27,
    retakeSubjects: 0,
    advisorId: 1,
    advisorName: 'TS. Nguyễn Văn A',
    enrollmentDate: '2022-09-01',
    expectedGraduationYear: '2026',
    parentName: 'Nguyễn Văn B',
    parentPhone: '0987654321',
    avatar: null
  },
  {
    id: 2,
    studentCode: '2251052002',
    fullName: 'Trần Thị B',
    email: 'tranthib@student.edu.vn',
    phoneNumber: '0987654321',
    dateOfBirth: '2004-05-20',
    gender: 'female',
    identityCard: '001234567891',
    address: 'Hà Nội',
    birthPlace: 'Hà Nội',
    major: 'IT',
    course: '2022',
    officialClass: '22IT1',
    status: 'studying',
    gpa: 3.8,
    credits: 112,
    completedSubjects: 28,
    retakeSubjects: 0,
    advisorId: 1,
    advisorName: 'TS. Nguyễn Văn A',
    enrollmentDate: '2022-09-01',
    expectedGraduationYear: '2026',
    parentName: 'Trần Văn C',
    parentPhone: '0912345678',
    avatar: null
  },
  {
    id: 3,
    studentCode: '2351052001',
    fullName: 'Lê Văn C',
    email: 'levanc@student.edu.vn',
    phoneNumber: '0369852147',
    dateOfBirth: '2005-03-10',
    gender: 'male',
    identityCard: '001234567892',
    address: 'Đà Nẵng',
    birthPlace: 'Đà Nẵng',
    major: 'CS',
    course: '2023',
    officialClass: '23IT1',
    status: 'studying',
    gpa: 3.2,
    credits: 70,
    completedSubjects: 18,
    retakeSubjects: 1,
    advisorId: 2,
    advisorName: 'ThS. Trần Thị B',
    enrollmentDate: '2023-09-01',
    expectedGraduationYear: '2027',
    parentName: 'Lê Văn D',
    parentPhone: '0978456123',
    avatar: null
  },
  {
    id: 4,
    studentCode: '2251052003',
    fullName: 'Phạm Thị D',
    email: 'phamthid@student.edu.vn',
    phoneNumber: '0147258369',
    dateOfBirth: '2004-07-25',
    gender: 'female',
    identityCard: '001234567893',
    address: 'Cần Thơ',
    birthPlace: 'Cần Thơ',
    major: 'IT',
    course: '2022',
    officialClass: '22IT2',
    status: 'reserved',
    gpa: 2.8,
    credits: 90,
    completedSubjects: 22,
    retakeSubjects: 2,
    advisorId: 3,
    advisorName: 'TS. Lê Văn C',
    enrollmentDate: '2022-09-01',
    expectedGraduationYear: '2027',
    parentName: 'Phạm Văn E',
    parentPhone: '0935678912',
    avatar: null
  },
  {
    id: 5,
    studentCode: '2451052001',
    fullName: 'Hoàng Văn E',
    email: 'hoangvane@student.edu.vn',
    phoneNumber: '0258147369',
    dateOfBirth: '2006-11-05',
    gender: 'male',
    identityCard: '001234567894',
    address: 'Hải Phòng',
    birthPlace: 'Hải Phòng',
    major: 'DS',
    course: '2024',
    officialClass: '24IT1',
    status: 'studying',
    gpa: 3.9,
    credits: 22,
    completedSubjects: 5,
    retakeSubjects: 0,
    advisorId: 4,
    advisorName: 'PGS.TS. Phạm Thị D',
    enrollmentDate: '2024-09-01',
    expectedGraduationYear: '2028',
    parentName: 'Hoàng Văn F',
    parentPhone: '0923456789',
    avatar: null
  }
]

// Computed
const statistics = computed(() => {
  const total = students.value.length
  const studying = students.value.filter((s) => s.status === 'studying').length
  const reserved = students.value.filter((s) => s.status === 'reserved').length
  const graduated = students.value.filter((s) => s.status === 'graduated').length
  const suspended = students.value.filter((s) => s.status === 'suspended').length
  const warning = students.value.filter((s) => s.gpa < 2.0 || s.retakeSubjects > 2).length
  const avgGPA = total > 0
    ? students.value.reduce((sum, s) => sum + (s.gpa || 0), 0) / total
    : 0

  return {
    total,
    studying,
    reserved,
    graduated,
    suspended,
    warning,
    avgGPA
  }
})

const filteredStudents = computed(() => {
  let result = [...students.value]

  // Apply filters
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(
      (s) =>
        s.studentCode.toLowerCase().includes(search) ||
        s.fullName.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
    )
  }

  if (filters.value.major) {
    result = result.filter((s) => s.major === filters.value.major)
  }

  if (filters.value.course) {
    result = result.filter((s) => s.course === filters.value.course)
  }

  if (filters.value.officialClass) {
    result = result.filter((s) => s.officialClass === filters.value.officialClass)
  }

  if (filters.value.status) {
    result = result.filter((s) => s.status === filters.value.status)
  }

  if (filters.value.advisor) {
    result = result.filter((s) => s.advisorId === filters.value.advisor)
  }

  if (filters.value.minGPA !== null && filters.value.minGPA !== undefined) {
    result = result.filter((s) => s.gpa >= filters.value.minGPA)
  }

  if (filters.value.minCredits !== null && filters.value.minCredits !== undefined) {
    result = result.filter((s) => s.credits >= filters.value.minCredits)
  }

  if (filters.value.gender) {
    result = result.filter((s) => s.gender === filters.value.gender)
  }

  if (filters.value.warning) {
    switch (filters.value.warning) {
      case 'low_gpa':
        result = result.filter((s) => s.gpa < 2.0)
        break
      case 'insufficient_credits':
        result = result.filter((s) => s.credits < 50)
        break
      case 'retake':
        result = result.filter((s) => s.retakeSubjects > 0)
        break
    }
  }

  // Apply sorting
  if (sortField.value) {
    result.sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]
      const modifier = sortOrder.value === 'asc' ? 1 : -1
      return aVal > bVal ? modifier : aVal < bVal ? -modifier : 0
    })
  }

  return result
})

const totalItems = computed(() => filteredStudents.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredStudents.value.slice(start, end)
})

// Methods
const loadStudents = () => {
  students.value = mockStudents
}

const handleFilterChange = (newFilters) => {
  filters.value = newFilters
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleSort = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

const openAddModal = () => {
  selectedStudent.value = null
  showStudentModal.value = true
}

const openEditModal = (student) => {
  selectedStudent.value = { ...student }
  showStudentModal.value = true
}

const openViewModal = (student) => {
  selectedStudent.value = student
  showViewModal.value = true
}

const openEditFromView = (student) => {
  closeViewModal()
  openEditModal(student)
}

const closeStudentModal = () => {
  showStudentModal.value = false
  selectedStudent.value = null
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedStudent.value = null
}

const handleSubmitStudent = (data) => {
  if (data.id) {
    // Show update confirmation modal
    studentToUpdate.value = data
    updateStudentModalVisible.value = true
  } else {
    // Add new
    const newStudent = {
      ...data,
      id: Date.now(),
      gpa: 0,
      credits: 0,
      completedSubjects: 0,
      retakeSubjects: 0
    }
    students.value.push(newStudent)
    closeStudentModal()
  }
}

const closeUpdateStudentModal = () => {
  updateStudentModalVisible.value = false
  studentToUpdate.value = null
}

const confirmUpdateStudent = () => {
  if (!studentToUpdate.value) return
  
  const index = students.value.findIndex((s) => s.id === studentToUpdate.value.id)
  if (index !== -1) {
    students.value[index] = studentToUpdate.value
  }
  closeUpdateStudentModal()
  closeStudentModal()
  alert('Đã cập nhật thông tin sinh viên thành công')
}

const handleDelete = (student) => {
  studentToDelete.value = student
  deleteStudentModalVisible.value = true
}

const closeDeleteStudentModal = () => {
  deleteStudentModalVisible.value = false
  studentToDelete.value = null
}

const confirmDeleteStudent = () => {
  if (!studentToDelete.value) return
  
  const index = students.value.findIndex((s) => s.id === studentToDelete.value.id)
  if (index !== -1) {
    students.value.splice(index, 1)
  }
  alert(`Đã xóa sinh viên "${studentToDelete.value.fullName}" thành công`)
  closeDeleteStudentModal()
}

const clearSelection = () => {
  selectedStudents.value = []
}

const handleBulkChangeClass = (data) => {
  console.log('Bulk change class:', data)
  clearSelection()
}

const handleBulkChangeStatus = (data) => {
  console.log('Bulk change status:', data)
  clearSelection()
}

const handleBulkAssignAdvisor = (data) => {
  console.log('Bulk assign advisor:', data)
  clearSelection()
}

const handleBulkExport = () => {
  console.log('Bulk export')
}

const handleBulkNotification = () => {
  console.log('Bulk notification')
}

const handleBulkDelete = () => {
  if (confirm(`Bạn có chắc chắn muốn xóa ${selectedStudents.value.length} sinh viên?`)) {
    students.value = students.value.filter(
      (s) => !selectedStudents.value.includes(s.id)
    )
    clearSelection()
  }
}

const openImportModal = () => {
  showImportModal.value = true
}

const closeImportModal = () => {
  showImportModal.value = false
}

const handleImportData = (data) => {
  console.log('Import data:', data)
  closeImportModal()
}

const handleExport = () => {
  // Export logic
  const csvContent = [
    ['Mã SV', 'Họ tên', 'Email', 'Lớp', 'Ngành', 'Khóa', 'GPA', 'Tín chỉ', 'Trạng thái'],
    ...filteredStudents.value.map((s) => [
      s.studentCode,
      s.fullName,
      s.email,
      s.officialClass,
      s.major,
      s.course,
      s.gpa,
      s.credits,
      s.status
    ])
  ]
    .map((row) => row.join(','))
    .join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `danh_sach_sinh_vien_${new Date().getTime()}.csv`
  link.click()
}

// Lifecycle
onMounted(() => {
  loadStudents()
})
</script>

<style scoped>
.students-manager-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px 0;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-content h1 {
  margin: 0 0 8px;
  font-size: 2rem;
  font-weight: 700;
}

.header-content h1 i {
  margin-right: 12px;
}

.header-content p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 24px;
}

@media (max-width: 768px) {
  .header-content h1 {
    font-size: 1.5rem;
  }

  .header-content p {
    font-size: 1rem;
  }
}

/* Modal Styles - Delete & Update Popups */
.modal-overlay-delete {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100001;
  padding: 20px;
}

.delete-modal-popup,
.update-modal-popup {
  background: white;
  border-radius: 24px;
  max-width: 550px;
  width: 100%;
  padding: 40px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  position: relative;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.close-modal-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 18px;
}

.close-modal-btn:hover {
  background: rgba(107, 114, 128, 0.2);
  color: #374151;
  transform: rotate(90deg);
}

.delete-icon-wrapper,
.update-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.delete-icon-animated {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(220, 38, 38, 0);
  }
}

.update-icon-animated {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
  }
  50% {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
  }
}

.delete-title,
.update-title {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
}

.delete-content,
.update-content {
  margin-bottom: 32px;
}

.subject-info-delete,
.subject-info-update {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.subject-code-delete,
.subject-code-update {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 700;
  font-size: 16px;
  color: #3b82f6;
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.subject-name-delete,
.subject-name-update {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  margin-bottom: 12px;
}

.schedule-meta-delete,
.schedule-meta-update {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  margin-top: 12px;
}

.schedule-meta-delete span,
.schedule-meta-update span {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.schedule-meta-delete i,
.schedule-meta-update i {
  color: #3b82f6;
  font-size: 14px;
}

.warning-box {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #92400e;
  font-size: 14px;
  line-height: 1.6;
}

.warning-box i {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  color: #d97706;
}

.info-box {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border: 2px solid #60a5fa;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #1e40af;
  font-size: 14px;
  line-height: 1.6;
}

.info-box i {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  color: #2563eb;
}

.delete-actions,
.update-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel-delete,
.btn-confirm-delete,
.btn-cancel-update,
.btn-confirm-update {
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
}

.btn-cancel-delete,
.btn-cancel-update {
  background: white;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.btn-cancel-delete:hover,
.btn-cancel-update:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #9ca3af;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-confirm-delete {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  border: 2px solid #dc2626;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-confirm-delete:hover {
  background: linear-gradient(135deg, #b91c1c, #991b1b);
  border-color: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
}

.btn-confirm-update {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: 2px solid #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-confirm-update:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

/* Modal Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .delete-modal-popup,
.modal-fade-enter-active .update-modal-popup {
  animation: slideUp 0.3s ease-out;
}

.modal-fade-leave-active .delete-modal-popup,
.modal-fade-leave-active .update-modal-popup {
  animation: slideDown 0.3s ease-in;
}

@keyframes slideDown {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
}
</style>
