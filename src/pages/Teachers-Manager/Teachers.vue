<template>
  <div class="teachers-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <span>Quản lý</span>
        <i class="fas fa-chevron-right"></i>
        <span class="current">Giảng viên</span>
      </div>
      
      <div class="header-content">
        <div class="page-title">
          <h1>
            <i class="fas fa-chalkboard-teacher"></i>
            Quản lý giảng viên
          </h1>
          <p>Quản lý danh sách giảng viên, thông tin cá nhân và phân công giảng dạy</p>
        </div>
        
        <div class="header-actions">
          <button @click="importTeachers" class="btn-import">
            <i class="fas fa-upload"></i>
            Import Excel
          </button>
          <button @click="openAddTeacherModal" class="btn-primary">
            <i class="fas fa-plus"></i>
            Thêm giảng viên
          </button>
        </div>
      </div>
    </div>
    
    <!-- Statistics -->
    <TeacherStats :statistics="statistics" />
    
    <!-- Filters -->
    <TeacherFilters 
      :filters="filters"
      @update:filters="updateFilters"
      @reset="resetFilters"
    />
    
    <!-- Table -->
    <TeacherTable 
      :teachers="teachers"
      :filtered-teachers="filteredTeachers"
      :selected-teachers="selectedTeachers"
      :current-page="currentPage"
      :page-size="pageSize"
      @selection-change="handleTeacherSelection"
      @page-change="handlePageChange"
      @view="viewTeacher"
      @edit="editTeacher"
      @delete="deleteTeacher"
      @suspend="suspendTeacher"
      @activate="activateTeacher"
      @export="exportData"
    />
    
    <!-- Bulk Actions -->
    <TeacherBulkActions 
      :selected-teachers="selectedTeachers"
      @clear-selection="clearSelection"
      @export-selected="exportSelected"
      @change-status="bulkChangeStatus"
      @change-department="bulkChangeDepartment"
      @send-notification="bulkSendNotification"
      @delete-selected="bulkDeleteTeachers"
    />
    
    <!-- Modals -->
    <TeacherModal 
      :is-open="showTeacherModal"
      :teacher="editingTeacher"
      :is-edit="isEditMode"
      @close="closeTeacherModal"
      @save="saveTeacher"
    />
    
    <TeacherViewModal 
      :is-open="showViewModal"
      :teacher="viewingTeacher"
      @close="closeViewModal"
      @edit="editTeacherFromView"
    />
    
    <!-- Delete Teacher Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="deleteTeacherModalVisible" class="modal-overlay-delete" @click="closeDeleteTeacherModal">
        <div class="delete-modal-popup" @click.stop>
          <button @click="closeDeleteTeacherModal" class="close-modal-btn">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="delete-icon-wrapper">
            <div class="delete-icon-animated">
              <i class="fas fa-user-times"></i>
            </div>
          </div>
          
          <h2 class="delete-title">Xác nhận xóa giảng viên</h2>
          
          <div class="delete-content">
            <div class="subject-info-delete" v-if="teacherToDelete">
              <div class="subject-code-delete">{{ teacherToDelete.code }}</div>
              <div class="subject-name-delete">{{ teacherToDelete.name }}</div>
              <div class="schedule-meta-delete">
                <span><i class="fas fa-building"></i> {{ getDepartmentName(teacherToDelete.department) }}</span>
                <span><i class="fas fa-graduation-cap"></i> {{ getAcademicRankName(teacherToDelete.academicRank) }}</span>
                <span><i class="fas fa-envelope"></i> {{ teacherToDelete.email }}</span>
                <span v-if="teacherToDelete.phone"><i class="fas fa-phone"></i> {{ teacherToDelete.phone }}</span>
              </div>
            </div>
            
            <div class="warning-box">
              <i class="fas fa-exclamation-triangle"></i>
              <div>
                <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Việc xóa giảng viên sẽ ảnh hưởng đến các lớp học và môn học được phân công.
              </div>
            </div>
          </div>
          
          <div class="delete-actions">
            <button @click="closeDeleteTeacherModal" class="btn-cancel-delete">
              <i class="fas fa-times"></i>
              Hủy bỏ
            </button>
            <button @click="confirmDeleteTeacher" class="btn-confirm-delete">
              <i class="fas fa-trash-alt"></i>
              Xóa giảng viên
            </button>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Update Teacher Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="updateTeacherModalVisible" class="modal-overlay-delete" @click="closeUpdateTeacherModal">
        <div class="update-modal-popup" @click.stop>
          <button @click="closeUpdateTeacherModal" class="close-modal-btn">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="update-icon-wrapper">
            <div class="update-icon-animated">
              <i class="fas fa-user-check"></i>
            </div>
          </div>
          
          <h2 class="update-title">Xác nhận cập nhật giảng viên</h2>
          
          <div class="update-content">
            <div class="subject-info-update" v-if="teacherToUpdate">
              <div class="subject-code-update">{{ teacherToUpdate.code }}</div>
              <div class="subject-name-update">{{ teacherToUpdate.name }}</div>
              <div class="schedule-meta-update">
                <span><i class="fas fa-building"></i> {{ getDepartmentName(teacherToUpdate.department) }}</span>
                <span><i class="fas fa-graduation-cap"></i> {{ getAcademicRankName(teacherToUpdate.academicRank) }}</span>
                <span><i class="fas fa-envelope"></i> {{ teacherToUpdate.email }}</span>
                <span v-if="teacherToUpdate.phone"><i class="fas fa-phone"></i> {{ teacherToUpdate.phone }}</span>
              </div>
            </div>
            
            <div class="info-box">
              <i class="fas fa-info-circle"></i>
              <div>
                Bạn có chắc chắn muốn cập nhật thông tin giảng viên này không? Vui lòng kiểm tra lại các thông tin trước khi xác nhận.
              </div>
            </div>
          </div>
          
          <div class="update-actions">
            <button @click="closeUpdateTeacherModal" class="btn-cancel-update">
              <i class="fas fa-times"></i>
              Hủy bỏ
            </button>
            <button @click="confirmUpdateTeacher" class="btn-confirm-update">
              <i class="fas fa-check"></i>
              Xác nhận cập nhật
            </button>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Import Modal -->
    <div v-if="showImportModal" class="modal-overlay" @click="closeImportModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-upload"></i>
            Import danh sách giảng viên
          </h3>
          <button @click="closeImportModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="import-section">
            <h4>Tải file mẫu</h4>
            <p>Tải file Excel mẫu để xem định dạng dữ liệu cần thiết</p>
            <button @click="downloadTemplate" class="btn-download">
              <i class="fas fa-download"></i>
              Tải file mẫu Excel
            </button>
          </div>
          
          <div class="import-section">
            <h4>Chọn file import</h4>
            <div 
              class="file-drop-zone"
              :class="{ 'drag-over': isDragOver }"
              @drop="handleFileDrop"
              @dragover.prevent
              @dragenter="isDragOver = true"
              @dragleave="isDragOver = false"
            >
              <div v-if="!selectedFile" class="drop-content">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Kéo thả file Excel vào đây hoặc</p>
                <button @click="$refs.fileInput.click()" class="btn-select-file">
                  Chọn file
                </button>
              </div>
              
              <div v-else class="file-selected">
                <i class="fas fa-file-excel"></i>
                <div class="file-info">
                  <h5>{{ selectedFile.name }}</h5>
                  <p>{{ formatFileSize(selectedFile.size) }}</p>
                </div>
                <button @click="clearFile" class="btn-remove">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <input 
              ref="fileInput"
              type="file" 
              accept=".xlsx,.xls,.csv"
              @change="handleFileSelect"
              style="display: none"
            />
          </div>
          
          <div class="import-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="importOptions.skipDuplicates" />
              Bỏ qua giảng viên trùng lặp (theo email)
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="importOptions.sendWelcomeEmail" />
              Gửi email chào mừng cho giảng viên mới
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="importOptions.autoGeneratePassword" />
              Tự động tạo mật khẩu cho tài khoản mới
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeImportModal" class="btn-cancel">
            <i class="fas fa-times"></i>
            Hủy bỏ
          </button>
          <button 
            @click="processImport" 
            class="btn-import-process"
            :disabled="!selectedFile"
          >
            <i class="fas fa-upload"></i>
            Import dữ liệu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import TeacherStats from '@/components/Teachers-Manager/TeacherStats.vue'
import TeacherFilters from '@/components/Teachers-Manager/TeacherFilters.vue'
import TeacherTable from '@/components/Teachers-Manager/TeacherTable.vue'
import TeacherBulkActions from '@/components/Teachers-Manager/TeacherBulkActions.vue'
import TeacherModal from '@/components/Teachers-Manager/TeacherModal.vue'
import TeacherViewModal from '@/components/Teachers-Manager/TeacherViewModal.vue'

export default {
  name: 'Teachers',
  components: {
    TeacherStats,
    TeacherFilters,
    TeacherTable,
    TeacherBulkActions,
    TeacherModal,
    TeacherViewModal
  },
  setup() {
    // State
    const loading = ref(false)
    const teachers = ref([])
    const selectedTeachers = ref([])
    
    // Modals
    const showTeacherModal = ref(false)
    const showViewModal = ref(false)
    const showImportModal = ref(false)
    const editingTeacher = ref(null)
    const viewingTeacher = ref(null)
    const isEditMode = ref(false)
    
    // Confirmation Modals
    const deleteTeacherModalVisible = ref(false)
    const teacherToDelete = ref(null)
    const updateTeacherModalVisible = ref(false)
    const teacherToUpdate = ref(null)
    
    // Pagination
    const currentPage = ref(1)
    const pageSize = ref(10)
    
    // Filters
    const filters = ref({
      search: '',
      department: '',
      status: '',
      academicRank: '',
      subjectCountMin: '',
      subjectCountMax: '',
      sortBy: 'name',
      sortOrder: 'asc'
    })
    
    // Import
    const selectedFile = ref(null)
    const isDragOver = ref(false)
    const importOptions = ref({
      skipDuplicates: true,
      sendWelcomeEmail: true,
      autoGeneratePassword: true
    })
    
    // Computed
    const statistics = computed(() => {
      const total = teachers.value.length
      const active = teachers.value.filter(t => t.status === 'active').length
      const onBreak = teachers.value.filter(t => t.status === 'on-break').length
      const resigned = teachers.value.filter(t => t.status === 'resigned').length
      const totalSubjects = teachers.value.reduce((sum, t) => sum + (t.subjectCount || 0), 0)
      const totalClasses = teachers.value.reduce((sum, t) => sum + (t.classCount || 0), 0)
      
      return {
        total,
        active,
        onBreak,
        resigned,
        totalSubjects,
        totalClasses
      }
    })
    
    const filteredTeachers = computed(() => {
      let result = [...teachers.value]
      
      // Apply search filter
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        result = result.filter(teacher => 
          teacher.name.toLowerCase().includes(search) ||
          teacher.code.toLowerCase().includes(search) ||
          teacher.email.toLowerCase().includes(search)
        )
      }
      
      // Apply department filter
      if (filters.value.department) {
        result = result.filter(teacher => teacher.department === filters.value.department)
      }
      
      // Apply status filter
      if (filters.value.status) {
        result = result.filter(teacher => teacher.status === filters.value.status)
      }
      
      // Apply academic rank filter
      if (filters.value.academicRank) {
        result = result.filter(teacher => teacher.academicRank === filters.value.academicRank)
      }
      
      // Apply subject count range filter
      if (filters.value.subjectCountMin !== '') {
        result = result.filter(teacher => 
          (teacher.subjectCount || 0) >= parseInt(filters.value.subjectCountMin)
        )
      }
      
      if (filters.value.subjectCountMax !== '') {
        result = result.filter(teacher => 
          (teacher.subjectCount || 0) <= parseInt(filters.value.subjectCountMax)
        )
      }
      
      // Apply sorting
      result.sort((a, b) => {
        let aVal = a[filters.value.sortBy]
        let bVal = b[filters.value.sortBy]
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }
        
        if (filters.value.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1
        } else {
          return aVal > bVal ? 1 : -1
        }
      })
      
      return result
    })
    
    // Methods
    const loadData = async () => {
      loading.value = true
      
      try {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        teachers.value = [
          {
            id: 1,
            code: 'GV001',
            name: 'Nguyễn Văn An',
            email: 'nva@university.edu.vn',
            phone: '0123456789',
            dateOfBirth: '1980-05-15',
            gender: 'male',
            department: 'cntt',
            academicRank: 'ts',
            position: 'Trưởng bộ môn',
            status: 'active',
            subjectCount: 3,
            classCount: 2,
            studentCount: 85,
            teachingHours: 12,
            createdAt: '2020-09-01',
            notes: 'Chuyên gia về AI và Machine Learning'
          },
          {
            id: 2,
            code: 'GV002',
            name: 'Trần Thị Bình',
            email: 'ttb@university.edu.vn',
            phone: '0987654321',
            dateOfBirth: '1975-12-20',
            gender: 'female',
            department: 'cntt',
            academicRank: 'pgs',
            position: 'Phó khoa',
            status: 'active',
            subjectCount: 2,
            classCount: 1,
            studentCount: 45,
            teachingHours: 8,
            createdAt: '2018-03-15'
          },
          {
            id: 3,
            code: 'GV003',
            name: 'Lê Quang Cường',
            email: 'lqc@university.edu.vn',
            phone: '0912345678',
            dateOfBirth: '1985-07-10',
            gender: 'male',
            department: 'dtvt',
            academicRank: 'ths',
            position: '',
            status: 'on-break',
            subjectCount: 1,
            classCount: 0,
            studentCount: 0,
            teachingHours: 0,
            createdAt: '2021-08-01',
            notes: 'Đang nghỉ thai sản'
          }
        ]
      } catch (error) {
        console.error('Error loading teachers:', error)
      } finally {
        loading.value = false
      }
    }
    
    const updateFilters = (newFilters) => {
      filters.value = newFilters
      currentPage.value = 1 // Reset to first page when filtering
    }
    
    const resetFilters = () => {
      filters.value = {
        search: '',
        department: '',
        status: '',
        academicRank: '',
        subjectCountMin: '',
        subjectCountMax: '',
        sortBy: 'name',
        sortOrder: 'asc'
      }
      currentPage.value = 1
    }
    
    const handlePageChange = (page) => {
      currentPage.value = page
    }
    
    // Teacher Management
    const openAddTeacherModal = () => {
      editingTeacher.value = null
      isEditMode.value = false
      showTeacherModal.value = true
    }
    
    const editTeacher = (teacher) => {
      editingTeacher.value = teacher
      isEditMode.value = true
      showTeacherModal.value = true
    }
    
    const editTeacherFromView = (teacher) => {
      closeViewModal()
      editTeacher(teacher)
    }
    
    const viewTeacher = (teacher) => {
      viewingTeacher.value = teacher
      showViewModal.value = true
    }
    
    const deleteTeacher = (teacher) => {
      teacherToDelete.value = teacher
      deleteTeacherModalVisible.value = true
    }
    
    const confirmDeleteTeacher = () => {
      if (teacherToDelete.value) {
        teachers.value = teachers.value.filter(t => t.id !== teacherToDelete.value.id)
        selectedTeachers.value = selectedTeachers.value.filter(id => id !== teacherToDelete.value.id)
        alert(`Đã xóa giảng viên ${teacherToDelete.value.name}`)
      }
      closeDeleteTeacherModal()
    }
    
    const closeDeleteTeacherModal = () => {
      deleteTeacherModalVisible.value = false
      teacherToDelete.value = null
    }
    
    const suspendTeacher = (teacher) => {
      const index = teachers.value.findIndex(t => t.id === teacher.id)
      if (index > -1) {
        teachers.value[index].status = 'on-break'
      }
    }
    
    const activateTeacher = (teacher) => {
      const index = teachers.value.findIndex(t => t.id === teacher.id)
      if (index > -1) {
        teachers.value[index].status = 'active'
      }
    }
    
    const saveTeacher = (teacherData) => {
      if (isEditMode.value) {
        // Show update confirmation
        teacherToUpdate.value = teacherData
        updateTeacherModalVisible.value = true
      } else {
        // Add new teacher directly
        const newTeacher = {
          ...teacherData,
          id: Date.now(),
          subjectCount: 0,
          classCount: 0,
          studentCount: 0,
          teachingHours: 0,
          createdAt: new Date().toISOString().split('T')[0]
        }
        teachers.value.push(newTeacher)
        closeTeacherModal()
        alert('Đã thêm giảng viên mới thành công!')
      }
    }
    
    const confirmUpdateTeacher = () => {
      if (teacherToUpdate.value && editingTeacher.value) {
        const index = teachers.value.findIndex(t => t.id === editingTeacher.value.id)
        if (index > -1) {
          teachers.value[index] = { ...teacherToUpdate.value }
          alert(`Đã cập nhật thông tin giảng viên ${teacherToUpdate.value.name}`)
        }
      }
      closeTeacherModal()
      closeUpdateTeacherModal()
    }
    
    const closeUpdateTeacherModal = () => {
      updateTeacherModalVisible.value = false
      teacherToUpdate.value = null
    }
    
    const closeTeacherModal = () => {
      showTeacherModal.value = false
      editingTeacher.value = null
      isEditMode.value = false
    }
    
    const closeViewModal = () => {
      showViewModal.value = false
      viewingTeacher.value = null
    }
    
    // Selection methods
    const handleTeacherSelection = (selectedIds) => {
      selectedTeachers.value = selectedIds
    }
    
    const clearSelection = () => {
      selectedTeachers.value = []
    }
    
    // Bulk operations
    const exportSelected = (teacherIds) => {
      const selectedData = teachers.value.filter(t => teacherIds.includes(t.id))
      console.log('Export selected teachers:', selectedData)
      // Implement export logic here
    }
    
    const bulkChangeStatus = ({ teacherIds, newStatus }) => {
      teacherIds.forEach(id => {
        const index = teachers.value.findIndex(t => t.id === id)
        if (index > -1) {
          teachers.value[index].status = newStatus
        }
      })
      clearSelection()
    }
    
    const bulkChangeDepartment = ({ teacherIds, newDepartment }) => {
      teacherIds.forEach(id => {
        const index = teachers.value.findIndex(t => t.id === id)
        if (index > -1) {
          teachers.value[index].department = newDepartment
        }
      })
      clearSelection()
    }
    
    const bulkSendNotification = ({ teacherIds, title, content, sendEmail }) => {
      console.log('Send notification:', { teacherIds, title, content, sendEmail })
      // Implement notification sending logic here
      clearSelection()
    }
    
    const bulkDeleteTeachers = (teacherIds) => {
      teachers.value = teachers.value.filter(t => !teacherIds.includes(t.id))
      clearSelection()
    }
    
    // Import/Export
    const importTeachers = () => {
      showImportModal.value = true
    }
    
    const closeImportModal = () => {
      showImportModal.value = false
      selectedFile.value = null
      isDragOver.value = false
    }
    
    const downloadTemplate = () => {
      // Create and download Excel template
      console.log('Download Excel template')
    }
    
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        selectedFile.value = file
      }
    }
    
    const handleFileDrop = (event) => {
      event.preventDefault()
      isDragOver.value = false
      
      const file = event.dataTransfer.files[0]
      if (file && (file.type.includes('excel') || file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
        selectedFile.value = file
      }
    }
    
    const clearFile = () => {
      selectedFile.value = null
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const processImport = () => {
      console.log('Process import:', {
        file: selectedFile.value,
        options: importOptions.value
      })
      // Implement import processing logic here
      closeImportModal()
    }
    
    const exportData = () => {
      console.log('Export all teachers data')
      // Implement export logic here
    }
    
    // Helper Functions
    const getDepartmentName = (code) => {
      const departments = {
        'cntt': 'Công nghệ thông tin',
        'dtvt': 'Điện tử viễn thông',
        'ktpm': 'Kỹ thuật phần mềm',
        'ktmt': 'Kỹ thuật máy tính',
        'httt': 'Hệ thống thông tin',
        'khmt': 'Khoa học máy tính'
      }
      return departments[code] || code
    }
    
    const getAcademicRankName = (code) => {
      const ranks = {
        'ts': 'Tiến sĩ',
        'pgs': 'Phó giáo sư',
        'gs': 'Giáo sư',
        'ths': 'Thạc sĩ',
        'cn': 'Cử nhân'
      }
      return ranks[code] || code
    }
    
    // Initialize
    onMounted(() => {
      loadData()
    })
    
    return {
      // State
      loading,
      teachers,
      selectedTeachers,
      
      // Modals
      showTeacherModal,
      showViewModal,
      showImportModal,
      editingTeacher,
      viewingTeacher,
      isEditMode,
      
      // Confirmation Modals
      deleteTeacherModalVisible,
      teacherToDelete,
      updateTeacherModalVisible,
      teacherToUpdate,
      
      // Pagination
      currentPage,
      pageSize,
      
      // Filters
      filters,
      
      // Import
      selectedFile,
      isDragOver,
      importOptions,
      
      // Computed
      statistics,
      filteredTeachers,
      
      // Methods
      updateFilters,
      resetFilters,
      handlePageChange,
      openAddTeacherModal,
      editTeacher,
      editTeacherFromView,
      viewTeacher,
      deleteTeacher,
      suspendTeacher,
      activateTeacher,
      saveTeacher,
      closeTeacherModal,
      closeViewModal,
      handleTeacherSelection,
      clearSelection,
      exportSelected,
      bulkChangeStatus,
      bulkChangeDepartment,
      bulkSendNotification,
      bulkDeleteTeachers,
      importTeachers,
      closeImportModal,
      downloadTemplate,
      handleFileSelect,
      handleFileDrop,
      clearFile,
      formatFileSize,
      processImport,
      exportData,
      
      // Confirmation Handlers
      confirmDeleteTeacher,
      closeDeleteTeacherModal,
      confirmUpdateTeacher,
      closeUpdateTeacherModal,
      
      // Helper Functions
      getDepartmentName,
      getAcademicRankName
    }
  }
}
</script>

<style scoped>
.teachers-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #6b7280;
}

.breadcrumb .current {
  color: #374151;
  font-weight: 500;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.page-title h1 {
  margin: 0 0 8px 0;
  color: #111827;
  font-size: 32px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-import,
.btn-primary {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-import {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-import:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

/* Import Modal Styles */
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
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
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.import-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.import-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.import-section h4 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
}

.import-section p {
  margin: 0 0 16px 0;
  color: #6b7280;
  font-size: 14px;
}

.btn-download {
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-download:hover {
  background: #047857;
}

.file-drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
}

.file-drop-zone.drag-over {
  border-color: #3b82f6;
  background: #eff6ff;
}

.drop-content i {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.drop-content p {
  margin: 0 0 16px 0;
  color: #6b7280;
}

.btn-select-file {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-select-file:hover {
  background: #2563eb;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-selected i {
  font-size: 32px;
  color: #059669;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-info h5 {
  margin: 0 0 4px 0;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.file-info p {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

.btn-remove {
  background: #fecaca;
  color: #dc2626;
  border: none;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #fca5a5;
}

.import-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox-label input {
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
}

.btn-cancel,
.btn-import-process {
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

.btn-cancel {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-import-process {
  background: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.btn-import-process:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-import-process:disabled {
  background: #94a3b8;
  border-color: #94a3b8;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .btn-import,
  .btn-primary {
    flex: 1;
    justify-content: center;
  }
}

/* Modal Styles - Delete & Update Confirmation Popups */
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
  z-index: 9999;
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