<template>
  <div class="framework-subject-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <i class="fas fa-home"></i>
        <span>Dashboard</span>
        <i class="fas fa-angle-right"></i>
        <span class="current">Chương trình đào tạo</span>
      </div>
      
      <!-- Semester Management Section -->
      <div class="semester-management">
        <div class="semester-header">
          <h3>
            <i class="fas fa-calendar-alt"></i>
            Quản lý học kỳ
          </h3>
          <button @click="openSemesterModal" class="btn-add-semester">
            <i class="fas fa-plus"></i>
            Tạo học kỳ
          </button>
        </div>
        
        <div class="semester-list">
          <div 
            v-for="semester in semesters" 
            :key="semester.id"
            class="semester-card"
          >
            <div class="semester-info">
              <div class="semester-name">{{ semester.name }}</div>
              <div class="semester-meta">
                <span class="semester-period">{{ semester.startDate }} - {{ semester.endDate }}</span>
                <span class="semester-status" :class="semester.status">{{ getStatusLabel(semester.status) }}</span>
              </div>
            </div>
            <div class="semester-stats">
              <div class="stat-item">
                <span class="stat-value">{{ semester.subjectCount || 0 }}</span>
                <span class="stat-label">môn</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ semester.maxCredits }}</span>
                <span class="stat-label">TC</span>
              </div>
            </div>
            <div class="semester-actions">
              <button @click="viewSemesterDetail(semester)" class="action-btn view">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editSemester(semester)" class="action-btn edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteSemester(semester)" class="action-btn delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <!-- Empty state -->
          <div v-if="semesters.length === 0" class="empty-semesters">
            <i class="fas fa-calendar-plus"></i>
            <p>Chưa có học kỳ nào</p>
            <button @click="openSemesterModal" class="btn-create-first">
              Tạo học kỳ đầu tiên
            </button>
          </div>
        </div>
      </div>
      
      <div class="header-main">
        <div class="title-section">
          <h1>
            <i class="fas fa-sitemap"></i>
            Quản lý Chương trình khung
          </h1>
          <p>Thiết kế và quản lý chương trình đào tạo cho các chuyên ngành CNTT</p>
        </div>
        
        <div class="header-actions">
          <button @click="exportData" class="btn-export">
            <i class="fas fa-download"></i>
            <span>Xuất Excel</span>
          </button>
          <button @click="importData" class="btn-import">
            <i class="fas fa-upload"></i>
            <span>Nhập Excel</span>
          </button>
          <button @click="openAddModal" class="btn-primary">
            <i class="fas fa-plus"></i>
            <span>Thêm môn học</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <SubjectStats :stats="statistics" />

    <!-- Filters -->
    <SubjectFilters 
      :filters="filters"
      @update:filters="updateFilters"
    />

    <!-- Main Content -->
    <div class="main-content">
      <!-- View Toggle & Actions -->
      <div class="content-header">
        <div class="view-info">
          <h3>
            <i class="fas fa-list"></i>
            Danh sách môn học
            <span class="count">({{ filteredSubjectsCount }})</span>
          </h3>
          <p>Quản lý môn học trong chương trình đào tạo</p>
        </div>
        
        <div class="view-controls">
          <div class="view-toggle">
            <button 
              :class="['view-btn', { active: viewMode === 'table' }]"
              @click="setViewMode('table')"
            >
              <i class="fas fa-table"></i>
              <span>Bảng</span>
            </button>
            <button 
              :class="['view-btn', { active: viewMode === 'grid' }]"
              @click="setViewMode('grid')"
            >
              <i class="fas fa-th"></i>
              <span>Lưới</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <SubjectTable
        v-if="viewMode === 'table'"
        :subjects="subjects"
        :filters="filters"
        :view-mode="viewMode"
        @add-subject="openAddModal"
        @view-subject="viewSubject"
        @edit-subject="editSubject"
        @duplicate-subject="duplicateSubject"
        @delete-subject="deleteSubject"
        @update:viewMode="setViewMode"
      />

      <!-- Grid View -->
      <div v-else class="subjects-grid">
        <div
          v-for="subject in filteredSubjects"
          :key="subject.id"
          class="subject-card"
          @click="viewSubject(subject)"
        >
          <div class="card-header">
            <div class="subject-code">{{ subject.code }}</div>
            <div class="card-actions">
              <button 
                @click.stop="editSubject(subject)"
                class="action-btn edit"
                title="Chỉnh sửa"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                @click.stop="duplicateSubject(subject)"
                class="action-btn duplicate"
                title="Nhân bản"
              >
                <i class="fas fa-copy"></i>
              </button>
              <button 
                @click.stop="deleteSubject(subject)"
                class="action-btn delete"
                title="Xóa"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="card-body">
            <h4 class="subject-name">{{ subject.name }}</h4>
            <p v-if="subject.englishName" class="english-name">{{ subject.englishName }}</p>
            
            <div class="subject-meta">
              <div class="meta-item">
                <i class="fas fa-calculator"></i>
                <span>{{ subject.credits }} tín chỉ</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-calendar"></i>
                <span>HK {{ subject.semester }}</span>
              </div>
            </div>
            
            <div class="subject-tags">
              <span :class="['type-tag', subject.type]">
                <i :class="getTypeIcon(subject.type)"></i>
                {{ getTypeLabel(subject.type) }}
              </span>
              <span :class="['status-tag', subject.status]">
                {{ getStatusLabel(subject.status) }}
              </span>
            </div>
            
            <div v-if="subject.majors && subject.majors.length > 0" class="major-tags">
              <span
                v-for="major in subject.majors.slice(0, 3)"
                :key="major"
                class="major-tag"
              >
                {{ getMajorName(major) }}
              </span>
              <span v-if="subject.majors.length > 3" class="more-majors">
                +{{ subject.majors.length - 3 }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="filteredSubjects.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-search"></i>
          </div>
          <h3>Không tìm thấy môn học</h3>
          <p>Thử thay đổi bộ lọc hoặc thêm môn học mới</p>
          <button @click="openAddModal" class="btn-primary">
            <i class="fas fa-plus"></i>
            Thêm môn học đầu tiên
          </button>
        </div>
      </div>
    </div>

    <!-- Subject Modal -->
    <SubjectModal
      :is-visible="modalVisible"
      :mode="modalMode"
      :subject="selectedSubject"
      @close="closeModal"
      @save="saveSubject"
      @duplicate="handleDuplicate"
      @edit-subject="handleEditFromView"
    />

    <!-- Delete Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="deleteModalVisible" class="modal-overlay-delete" @click="closeDeleteModal">
        <div class="delete-modal-popup" @click.stop>
          <button @click="closeDeleteModal" class="close-modal-btn">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="delete-icon-wrapper">
            <div class="delete-icon-animated">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
          </div>
          
          <h3 class="delete-title">Xác nhận xóa môn học</h3>
          
          <div class="delete-content">
            <div class="subject-info-delete">
              <div class="subject-code-delete">{{ subjectToDelete?.code }}</div>
              <div class="subject-name-delete">{{ subjectToDelete?.name }}</div>
            </div>
            
            <div class="warning-box">
              <i class="fas fa-info-circle"></i>
              <span>Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.</span>
            </div>
          </div>
          
          <div class="delete-actions">
            <button @click="closeDeleteModal" class="btn-cancel-delete">
              <i class="fas fa-times"></i>
              Hủy bỏ
            </button>
            <button @click="confirmDelete" class="btn-confirm-delete">
              <i class="fas fa-trash-alt"></i>
              Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Semester Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="deleteSemesterModalVisible" class="modal-overlay-delete" @click="closeDeleteSemesterModal">
        <div class="delete-modal-popup" @click.stop>
          <button @click="closeDeleteSemesterModal" class="close-modal-btn">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="delete-icon-wrapper">
            <div class="delete-icon-animated">
              <i class="fas fa-calendar-times"></i>
            </div>
          </div>
          
          <h3 class="delete-title">Xác nhận xóa học kỳ</h3>
          
          <div class="delete-content">
            <div class="subject-info-delete">
              <div class="semester-name-delete">{{ semesterToDelete?.name }}</div>
              <div class="semester-meta-delete">
                <span><i class="fas fa-calendar-alt"></i> {{ semesterToDelete?.startDate }} - {{ semesterToDelete?.endDate }}</span>
                <span><i class="fas fa-book"></i> {{ semesterToDelete?.subjectCount || 0 }} môn học</span>
              </div>
            </div>
            
            <div class="warning-box">
              <i class="fas fa-info-circle"></i>
              <span>Hành động này không thể hoàn tác. Tất cả dữ liệu học kỳ và môn học liên quan sẽ bị xóa vĩnh viễn.</span>
            </div>
          </div>
          
          <div class="delete-actions">
            <button @click="closeDeleteSemesterModal" class="btn-cancel-delete">
              <i class="fas fa-times"></i>
              Hủy bỏ
            </button>
            <button @click="confirmDeleteSemester" class="btn-confirm-delete">
              <i class="fas fa-trash-alt"></i>
              Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Update Subject Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="updateSubjectModalVisible" class="modal-overlay-delete" @click="closeUpdateSubjectModal">
        <div class="update-modal-popup" @click.stop>
          <button @click="closeUpdateSubjectModal" class="close-modal-btn">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="update-icon-wrapper">
            <div class="update-icon-animated">
              <i class="fas fa-edit"></i>
            </div>
          </div>
          
          <h3 class="update-title">Xác nhận cập nhật môn học</h3>
          
          <div class="update-content">
            <div class="subject-info-update">
              <div class="subject-code-update">{{ subjectToUpdate?.code }}</div>
              <div class="subject-name-update">{{ subjectToUpdate?.name }}</div>
            </div>
            
            <div class="info-box">
              <i class="fas fa-info-circle"></i>
              <span>Bạn có chắc chắn muốn lưu các thay đổi cho môn học này?</span>
            </div>
          </div>
          
          <div class="update-actions">
            <button @click="closeUpdateSubjectModal" class="btn-cancel-update">
              <i class="fas fa-times"></i>
              Hủy bỏ
            </button>
            <button @click="confirmUpdateSubject" class="btn-confirm-update">
              <i class="fas fa-check"></i>
              Xác nhận cập nhật
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Update Semester Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="updateSemesterModalVisible" class="modal-overlay-delete" @click="closeUpdateSemesterModal">
        <div class="update-modal-popup" @click.stop>
          <button @click="closeUpdateSemesterModal" class="close-modal-btn">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="update-icon-wrapper">
            <div class="update-icon-animated">
              <i class="fas fa-calendar-check"></i>
            </div>
          </div>
          
          <h3 class="update-title">Xác nhận cập nhật học kỳ</h3>
          
          <div class="update-content">
            <div class="subject-info-update">
              <div class="semester-name-update">{{ semesterToUpdate?.name }}</div>
              <div class="semester-meta-update">
                <span><i class="fas fa-calendar-alt"></i> {{ semesterToUpdate?.startDate }} - {{ semesterToUpdate?.endDate }}</span>
                <span><i class="fas fa-graduation-cap"></i> Tối đa {{ semesterToUpdate?.maxCredits }} tín chỉ</span>
              </div>
            </div>
            
            <div class="info-box">
              <i class="fas fa-info-circle"></i>
              <span>Bạn có chắc chắn muốn lưu các thay đổi cho học kỳ này?</span>
            </div>
          </div>
          
          <div class="update-actions">
            <button @click="closeUpdateSemesterModal" class="btn-cancel-update">
              <i class="fas fa-times"></i>
              Hủy bỏ
            </button>
            <button @click="confirmUpdateSemester" class="btn-confirm-update">
              <i class="fas fa-check"></i>
              Xác nhận cập nhật
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Old semester modal removed - now using SemesterModal component -->

    <!-- Semester Modals -->
    <SemesterModal 
      :is-visible="semesterModalVisible"
      :mode="semesterModalMode"
      :semester="selectedSemester"
      @close="closeSemesterModal"
      @save="handleSemesterSave"
    />

    <SemesterDetailModal 
      :is-visible="semesterDetailModalVisible"
      :semester="selectedSemesterDetail"
      @close="closeSemesterDetailModal"
      @edit="handleEditFromDetail"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import SubjectStats from '../../components/FrameworkSubject-Staff/SubjectStats.vue'
import SubjectFilters from '../../components/FrameworkSubject-Staff/SubjectFilters.vue'
import SubjectTable from '../../components/FrameworkSubject-Staff/SubjectTable.vue'
import SubjectModal from '../../components/FrameworkSubject-Staff/SubjectModal.vue'
import SemesterModal from '../../components/FrameworkSubject-Staff/SemesterModal.vue'
import SemesterDetailModal from '../../components/FrameworkSubject-Staff/SemesterDetailModal.vue'

// State
const viewMode = ref('table')
const modalVisible = ref(false)
const modalMode = ref('add')
const selectedSubject = ref(null)
const deleteModalVisible = ref(false)
const subjectToDelete = ref(null)
const updateSubjectModalVisible = ref(false)
const subjectToUpdate = ref(null)
const deleteSemesterModalVisible = ref(false)
const semesterToDelete = ref(null)
const updateSemesterModalVisible = ref(false)
const semesterToUpdate = ref(null)
const semesterModalVisible = ref(false)
const semesterDetailModalVisible = ref(false)
const selectedSemester = ref(null)
const selectedSemesterDetail = ref(null)
const semesterModalMode = ref('create') // 'create' or 'edit'

// Semester form
const semesterForm = reactive({
  name: '',
  academicYear: '',
  semester: '',
  startDate: '',
  endDate: '',
  maxCredits: 20,
  description: ''
})

// Semesters data
const semesters = ref([
  {
    id: 1,
    name: 'Học kỳ 1 - Năm 1',
    academicYear: 1,
    semester: 1,
    startDate: '2024-09-01',
    endDate: '2025-01-15',
    maxCredits: 22,
    status: 'active',
    subjectCount: 5,
    subjects: [
      { id: 1, code: 'IT101', name: 'Nhập môn Công nghệ thông tin', credits: 3, type: 'required' },
      { id: 2, code: 'MATH101', name: 'Toán cao cấp A1', credits: 3, type: 'required' },
      { id: 3, code: 'ENG101', name: 'Tiếng Anh 1', credits: 3, type: 'required' },
      { id: 4, code: 'PHY101', name: 'Vật lý đại cương', credits: 3, type: 'required' },
      { id: 5, code: 'PE101', name: 'Giáo dục thể chất', credits: 2, type: 'required' }
    ]
  },
  {
    id: 2,
    name: 'Học kỳ 2 - Năm 1',
    academicYear: 1,
    semester: 2,
    startDate: '2025-02-01',
    endDate: '2025-06-15',
    maxCredits: 20,
    status: 'upcoming',
    subjectCount: 0,
    subjects: []
  }
])

// Filters
const filters = reactive({
  search: '',
  type: 'all',
  major: '',
  semester: '',
  credits: '',
  status: ''
})

// Mock data
const subjects = ref([
  {
    id: 1,
    code: 'IT101',
    name: 'Nhập môn Công nghệ thông tin',
    englishName: 'Introduction to Information Technology',
    credits: 3,
    type: 'required',
    majors: ['cntt', 'ktpm'],
    semester: 1,
    prerequisites: [],
    status: 'active',
    description: 'Môn học giới thiệu tổng quan về lĩnh vực CNTT',
    content: 'Các khái niệm cơ bản, lịch sử phát triển, ứng dụng của CNTT...'
  },
  {
    id: 2,
    code: 'IT102',
    name: 'Toán rời rạc',
    englishName: 'Discrete Mathematics',
    credits: 3,
    type: 'required',
    majors: ['cntt', 'ktpm', 'httt'],
    semester: 1,
    prerequisites: [],
    status: 'active',
    description: 'Nền tảng toán học cho khoa học máy tính',
    content: 'Logic, tập hợp, quan hệ, đồ thị, tổ hợp...'
  },
  {
    id: 3,
    code: 'IT201',
    name: 'Cấu trúc dữ liệu và Giải thuật',
    englishName: 'Data Structures and Algorithms',
    credits: 4,
    type: 'required',
    majors: ['cntt', 'ktpm'],
    semester: 2,
    prerequisites: ['IT101'],
    status: 'active',
    description: 'Các cấu trúc dữ liệu và giải thuật cơ bản',
    content: 'Mảng, danh sách, ngăn xếp, hàng đợi, cây, đồ thị...'
  },
  {
    id: 4,
    code: 'IT301',
    name: 'Trí tuệ nhân tạo',
    englishName: 'Artificial Intelligence',
    credits: 3,
    type: 'elective',
    majors: ['ai'],
    semester: 5,
    prerequisites: ['IT201', 'IT202'],
    status: 'active',
    description: 'Các khái niệm và kỹ thuật cơ bản trong AI',
    content: 'Tìm kiếm, logic, học máy, mạng neural...'
  },
  {
    id: 5,
    code: 'IT401',
    name: 'Thực tập doanh nghiệp',
    englishName: 'Industry Internship',
    credits: 2,
    type: 'required',
    majors: ['cntt', 'ktpm', 'httt'],
    semester: 8,
    prerequisites: ['IT301', 'IT302'],
    status: 'draft',
    description: 'Thực tập tại doanh nghiệp',
    content: 'Áp dụng kiến thức đã học vào thực tế...'
  }
])

// Computed
const statistics = computed(() => {
  const total = subjects.value.length
  const required = subjects.value.filter(s => s.type === 'required').length
  const elective = subjects.value.filter(s => s.type === 'elective').length
  const totalCredits = subjects.value.reduce((sum, s) => sum + s.credits, 0)
  const requiredCredits = subjects.value.filter(s => s.type === 'required').reduce((sum, s) => sum + s.credits, 0)
  const electiveCredits = totalCredits - requiredCredits
  
  return {
    totalSubjects: total,
    requiredSubjects: required,
    electiveSubjects: elective,
    electiveGroups: 12,
    totalCredits,
    requiredCredits,
    electiveCredits,
    majors: 6,
    activeMajors: 5,
    semesters: 8
  }
})

const filteredSubjects = computed(() => {
  let filtered = [...subjects.value]
  
  // Apply filters (similar to SubjectTable logic)
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(subject =>
      subject.code.toLowerCase().includes(search) ||
      subject.name.toLowerCase().includes(search) ||
      (subject.englishName && subject.englishName.toLowerCase().includes(search))
    )
  }
  
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(subject => subject.type === filters.type)
  }
  
  if (filters.major) {
    filtered = filtered.filter(subject => subject.majors.includes(filters.major))
  }
  
  if (filters.semester) {
    filtered = filtered.filter(subject => subject.semester === parseInt(filters.semester))
  }
  
  if (filters.credits) {
    if (filters.credits === '5+') {
      filtered = filtered.filter(subject => subject.credits >= 5)
    } else {
      filtered = filtered.filter(subject => subject.credits === parseInt(filters.credits))
    }
  }
  
  if (filters.status) {
    filtered = filtered.filter(subject => subject.status === filters.status)
  }
  
  return filtered
})

const filteredSubjectsCount = computed(() => filteredSubjects.value.length)

// Methods
const updateFilters = (newFilters) => {
  Object.assign(filters, newFilters)
}

const setViewMode = (mode) => {
  viewMode.value = mode
}

const openAddModal = () => {
  modalMode.value = 'add'
  selectedSubject.value = null
  modalVisible.value = true
}

const viewSubject = (subject) => {
  modalMode.value = 'view'
  selectedSubject.value = subject
  modalVisible.value = true
}

const editSubject = (subject) => {
  modalMode.value = 'edit'
  selectedSubject.value = subject
  modalVisible.value = true
}

const duplicateSubject = (subject) => {
  const duplicate = {
    ...subject,
    id: Date.now(),
    code: subject.code + '_COPY',
    name: subject.name + ' (Bản sao)',
    status: 'draft'
  }
  subjects.value.push(duplicate)
  showNotification('Đã nhân bản môn học thành công', 'success')
}

const deleteSubject = (subject) => {
  subjectToDelete.value = subject
  deleteModalVisible.value = true
}

const confirmDelete = () => {
  if (!subjectToDelete.value) return
  
  const index = subjects.value.findIndex(s => s.id === subjectToDelete.value.id)
  if (index > -1) {
    subjects.value.splice(index, 1)
    showNotification(`Đã xóa môn học "${subjectToDelete.value.name}" thành công`, 'success')
  }
  closeDeleteModal()
}

const closeModal = () => {
  modalVisible.value = false
  selectedSubject.value = null
}

const handleEditFromView = (subject) => {
  modalMode.value = 'edit'
  selectedSubject.value = subject
  modalVisible.value = true
}

const closeDeleteModal = () => {
  deleteModalVisible.value = false
  subjectToDelete.value = null
}

const saveSubject = (subjectData) => {
  if (modalMode.value === 'add') {
    subjects.value.push(subjectData)
    showNotification('Đã thêm môn học thành công', 'success')
    closeModal()
  } else if (modalMode.value === 'edit') {
    // Show update confirmation modal
    subjectToUpdate.value = subjectData
    updateSubjectModalVisible.value = true
  }
}

const closeUpdateSubjectModal = () => {
  updateSubjectModalVisible.value = false
  subjectToUpdate.value = null
}

const confirmUpdateSubject = () => {
  if (!subjectToUpdate.value) return
  
  const index = subjects.value.findIndex(s => s.id === subjectToUpdate.value.id)
  if (index > -1) {
    subjects.value[index] = subjectToUpdate.value
    showNotification('Đã cập nhật môn học thành công', 'success')
  }
  closeUpdateSubjectModal()
  closeModal()
}

const handleDuplicate = (duplicateData) => {
  subjects.value.push(duplicateData)
  showNotification('Đã nhân bản môn học thành công', 'success')
  closeModal()
}

const exportData = () => {
  showNotification('Đang xuất dữ liệu...', 'info')
  // Implement export logic
}

const importData = () => {
  showNotification('Chức năng nhập dữ liệu đang được phát triển', 'info')
  // Implement import logic
}

// Semester Modal Methods
const openSemesterModal = () => {
  semesterModalMode.value = 'create'
  selectedSemester.value = null
  semesterModalVisible.value = true
}

const closeSemesterModal = () => {
  semesterModalVisible.value = false
  selectedSemester.value = null
}

const handleSemesterSave = (formData) => {
  if (semesterModalMode.value === 'create') {
    // Create new semester
    const newSemester = {
      id: Date.now(),
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      maxCredits: parseInt(formData.maxCredits),
      status: 'upcoming',
      subjectCount: 0,
      subjects: []
    }
    semesters.value.push(newSemester)
    showNotification(`Học kỳ "${newSemester.name}" đã được tạo thành công!`, 'success')
    closeSemesterModal()
  } else {
    // Show update confirmation modal
    semesterToUpdate.value = {
      ...formData,
      maxCredits: parseInt(formData.maxCredits)
    }
    updateSemesterModalVisible.value = true
  }
}

const closeUpdateSemesterModal = () => {
  updateSemesterModalVisible.value = false
  semesterToUpdate.value = null
}

const confirmUpdateSemester = () => {
  if (!semesterToUpdate.value) return
  
  const index = semesters.value.findIndex(s => s.id === semesterToUpdate.value.id)
  if (index > -1) {
    Object.assign(semesters.value[index], {
      name: semesterToUpdate.value.name,
      startDate: semesterToUpdate.value.startDate,
      endDate: semesterToUpdate.value.endDate,
      maxCredits: semesterToUpdate.value.maxCredits
    })
    showNotification(`Học kỳ "${semesterToUpdate.value.name}" đã được cập nhật thành công!`, 'success')
  }
  closeUpdateSemesterModal()
  closeSemesterModal()
}

const editSemester = (semester) => {
  semesterModalMode.value = 'edit'
  selectedSemester.value = semester
  semesterModalVisible.value = true
}

// Semester Detail Modal Methods
const viewSemesterDetail = (semester) => {
  selectedSemesterDetail.value = semester
  semesterDetailModalVisible.value = true
}

const closeSemesterDetailModal = () => {
  semesterDetailModalVisible.value = false
  selectedSemesterDetail.value = null
}

const handleEditFromDetail = (semester) => {
  closeSemesterDetailModal()
  editSemester(semester)
}

const deleteSemester = (semester) => {
  semesterToDelete.value = semester
  deleteSemesterModalVisible.value = true
}

const closeDeleteSemesterModal = () => {
  deleteSemesterModalVisible.value = false
  semesterToDelete.value = null
}

const confirmDeleteSemester = () => {
  if (!semesterToDelete.value) return
  
  const index = semesters.value.findIndex(s => s.id === semesterToDelete.value.id)
  if (index > -1) {
    semesters.value.splice(index, 1)
    showNotification(`Đã xóa học kỳ "${semesterToDelete.value.name}" thành công`, 'success')
  }
  closeDeleteSemesterModal()
}

const getStatusLabel = (status) => {
  const labels = {
    'active': 'Đang diễn ra',
    'upcoming': 'Sắp tới',
    'completed': 'Đã kết thúc'
  }
  return labels[status] || status
}

const showNotification = (message, type = 'info') => {
  // Simple notification implementation
  console.log(`${type.toUpperCase()}: ${message}`)
}

// Helper methods
const getTypeIcon = (type) => {
  const icons = {
    'required': 'fas fa-star',
    'elective': 'fas fa-list-ul',
    'specialization': 'fas fa-graduation-cap'
  }
  return icons[type] || 'fas fa-book'
}

const getTypeLabel = (type) => {
  const labels = {
    'required': 'Bắt buộc',
    'elective': 'Tự chọn',
    'specialization': 'Chuyên ngành'
  }
  return labels[type] || type
}

const getMajorName = (majorId) => {
  const majors = {
    'cntt': 'CNTT',
    'ktpm': 'KTPM',
    'httt': 'HTTT',
    'mmt': 'MMT',
    'ai': 'AI',
    'ds': 'DS'
  }
  return majors[majorId] || majorId
}

// Lifecycle
onMounted(() => {
  // Load data or perform initial setup
})
</script>

<style scoped>
.framework-subject-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
}

.page-header {
  margin-bottom: 32px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #6b7280;
}

.breadcrumb i {
  font-size: 12px;
}

.breadcrumb .current {
  color: #3b82f6;
  font-weight: 600;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.title-section h1 {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.title-section p {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.btn-export,
.btn-import,
.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  white-space: nowrap;
}

.btn-export {
  background: white;
  color: #059669;
  border: 2px solid #059669;
}

.btn-export:hover {
  background: #059669;
  color: white;
  transform: translateY(-1px);
}

.btn-import {
  background: white;
  color: #7c3aed;
  border: 2px solid #7c3aed;
}

.btn-import:hover {
  background: #7c3aed;
  color: white;
  transform: translateY(-1px);
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: 2px solid #3b82f6;
}

.btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
}

.main-content {
  margin-top: 32px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.view-info h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.count {
  color: #6b7280;
  font-weight: 500;
}

.view-info p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-toggle {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  background: white;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.view-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.view-btn.active {
  background: #3b82f6;
  color: white;
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.subject-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.subject-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.subject-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.subject-code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 700;
  font-size: 14px;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 6px 12px;
  border-radius: 8px;
}

.card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.subject-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.action-btn.edit {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.action-btn.duplicate {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.action-btn:hover {
  transform: scale(1.1);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subject-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.english-name {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
  line-height: 1.4;
}

.subject-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.meta-item i {
  color: #9ca3af;
}

.subject-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.type-tag,
.status-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.type-tag.required {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.type-tag.elective {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.type-tag.specialization {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
}

.status-tag.active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-tag.inactive {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-tag.draft {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}

.major-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.major-tag,
.more-majors {
  padding: 2px 6px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
}

.more-majors {
  background: #e5e7eb;
  color: #9ca3af;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  border: 2px dashed #e5e7eb;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(107, 114, 128, 0.1);
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 24px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1f2937;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #6b7280;
}

/* Delete Modal - Modern Popup Style */
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

.delete-modal-popup {
  background: white;
  border-radius: 24px;
  max-width: 500px;
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

.delete-icon-wrapper {
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
  box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(220, 38, 38, 0);
  }
}

.delete-title {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
}

.delete-content {
  margin-bottom: 32px;
}

.subject-info-delete {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.subject-code-delete {
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

.subject-name-delete {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

/* Semester specific delete styles */
.semester-name-delete {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
  line-height: 1.4;
}

.semester-meta-delete {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}

.semester-meta-delete span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.semester-meta-delete i {
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
}

.delete-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel-delete,
.btn-confirm-delete {
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

.btn-cancel-delete {
  background: white;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.btn-cancel-delete:hover {
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

/* Update Modal Styles */
.update-modal-popup {
  background: white;
  border-radius: 24px;
  max-width: 500px;
  width: 100%;
  padding: 40px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  position: relative;
  animation: slideUp 0.3s ease-out;
}

.update-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
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
  box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
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

.update-title {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
}

.update-content {
  margin-bottom: 32px;
}

.subject-info-update {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

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

.subject-name-update {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.semester-name-update {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
  line-height: 1.4;
}

.semester-meta-update {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}

.semester-meta-update span {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.semester-meta-update i {
  color: #3b82f6;
  font-size: 14px;
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

.update-actions {
  display: flex;
  gap: 12px;
}

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

.btn-cancel-update {
  background: white;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.btn-cancel-update:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #9ca3af;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

/* Semester Management Styles */
.semester-management {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.semester-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.semester-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.semester-header h3 i {
  color: #3b82f6;
}

.btn-add-semester {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-semester:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.semester-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.semester-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.semester-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.semester-info {
  margin-bottom: 12px;
}

.semester-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.semester-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.semester-period {
  font-size: 13px;
  color: #6b7280;
}

.semester-status {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 12px;
  width: fit-content;
}

.semester-status.active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.semester-status.upcoming {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.semester-status.completed {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}

.semester-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #3b82f6;
}

.stat-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
}

.semester-actions {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.semester-card:hover .semester-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.edit {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.action-btn.edit:hover {
  background: rgba(16, 185, 129, 0.2);
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.2);
}

.action-btn.view {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.action-btn.view:hover {
  background: rgba(59, 130, 246, 0.2);
}

.empty-semesters {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}

.empty-semesters i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #d1d5db;
}

.empty-semesters p {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.btn-create-first {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-create-first:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Semester Modal Styles */
.semester-modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.semester-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
}

.semester-modal .modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.semester-modal .close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.semester-modal .close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.semester-modal .modal-body {
  padding: 32px 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.semester-modal .form-group {
  margin-bottom: 20px;
}

.semester-modal .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.semester-modal .form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.semester-modal .form-group input,
.semester-modal .form-group select,
.semester-modal .form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.semester-modal .form-group input:focus,
.semester-modal .form-group select:focus,
.semester-modal .form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.semester-modal .form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.semester-modal .modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.semester-modal .btn-cancel,
.semester-modal .btn-primary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.semester-modal .btn-cancel {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.semester-modal .btn-cancel:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

.semester-modal .btn-primary {
  background: #3b82f6;
  color: white;
  border: 2px solid #3b82f6;
}

.semester-modal .btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .header-main {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .view-controls {
    justify-content: center;
  }
  
  .subjects-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .framework-subject-page {
    padding: 16px;
  }
  
  .title-section h1 {
    font-size: 24px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .subjects-grid {
    grid-template-columns: 1fr;
  }
  
  .subject-card {
    padding: 20px;
  }
  
  /* Delete Modal Mobile */
  .delete-modal-popup,
  .update-modal-popup {
    padding: 32px 24px;
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
  
  .delete-icon-animated,
  .update-icon-animated {
    width: 70px;
    height: 70px;
    font-size: 32px;
  }
  
  .delete-title,
  .update-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .subject-code-delete,
  .subject-code-update {
    font-size: 14px;
    padding: 6px 12px;
  }
  
  .subject-name-delete,
  .subject-name-update,
  .semester-name-update {
    font-size: 16px;
  }
  
  .warning-box,
  .info-box {
    padding: 14px;
    font-size: 13px;
  }
  
  .delete-actions,
  .update-actions {
    flex-direction: column;
  }
  
  .btn-cancel-delete,
  .btn-confirm-delete,
  .btn-cancel-update,
  .btn-confirm-update {
    width: 100%;
    padding: 14px;
  }
  
  .semester-modal {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
  
  .semester-modal .form-row {
    grid-template-columns: 1fr;
  }
  
  .semester-modal .modal-footer {
    flex-direction: column;
  }
  
  .semester-modal .btn-cancel,
  .semester-modal .btn-primary {
    width: 100%;
    justify-content: center;
  }
  
  .semester-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .semester-list {
    grid-template-columns: 1fr;
  }
  
  .semester-actions {
    position: static;
    opacity: 1;
    justify-content: flex-end;
    margin-top: 12px;
  }
}
</style>