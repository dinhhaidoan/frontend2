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
          <h1><i class="fas fa-chalkboard-teacher"></i> Quản lý Giảng viên</h1>
          <p>Quản lý thông tin giảng viên của hệ thống</p>
        </div>

        <div class="header-actions">
          <button class="btn-primary" @click="openAddTeacherModal">
            <i class="fas fa-plus"></i>
            Thêm giảng viên
          </button>
        </div>
      </div>
    </div>

    <!-- Top stats and filters -->
    <!-- TeacherStats removed: component was deleted; stats are available in code if needed. -->

    <div class="top-controls" style="margin-top: 16px; display:flex; gap:16px; align-items:flex-start;">
      <div style="flex:1">
        <TeacherBulkActions
          :selectedIds="selectedTeachers"
          @exportSelected="exportSelected"
          @bulkChangeStatus="bulkChangeStatus"
          @bulkChangeDepartment="bulkChangeDepartment"
          @bulkSendNotification="bulkSendNotification"
          @bulkDelete="bulkDeleteTeachers"
        />
      </div>
    </div>

    <!-- Table -->
    <TeacherTable
      :teachers="teachers"
      :filteredTeachers="filteredTeachers"
      :loading="loading"
      :selected="selectedTeachers"
      @select="handleTeacherSelection"
      @view="viewTeacher"
      @edit="editTeacher"
      @delete="promptDeleteTeacher"
      @suspend="suspendTeacher"
      @activate="activateTeacher"
    />

    <!-- Modals -->
    <TeacherModal
      v-if="showTeacherModal"
      :isOpen="showTeacherModal"
      :teacher="editingTeacher"
      :is-edit="isEditMode"
      @close="closeTeacherModal"
      @save="saveTeacher"
    />

    <TeacherViewModal
      v-if="showViewModal"
      :isOpen="showViewModal"
      :teacher="viewingTeacher"
      @close="closeViewModal"
      @edit="editTeacherFromView"
    />

    <!-- Delete confirmation (ConfirmDialog) -->
    <ConfirmDialog
      :show="deleteTeacherModalVisible"
      type="danger"
      title="Xóa giảng viên"
      :message="teacherToDelete ? `Bạn có chắc muốn xóa giảng viên ${teacherToDelete.name || teacherToDelete.code || teacherToDelete.user_code}? Hành động sẽ không thể hoàn tác.` : 'Bạn có chắc muốn xóa giảng viên này?'
      "
      confirmText="Xóa"
      cancelText="Hủy"
      :loading="deleting"
      @confirm="confirmDeleteTeacher"
      @cancel="closeDeleteTeacherModal"
    />

    <!-- Update confirmation (ConfirmDialog) -->
    <ConfirmDialog
      :show="updateTeacherModalVisible"
      type="warning"
      title="Xác nhận cập nhật giảng viên"
      :message="teacherToUpdate ? `Bạn có chắc chắn muốn cập nhật giảng viên ${teacherToUpdate.name || teacherToUpdate.code}?` : 'Bạn có chắc chắn muốn cập nhật giảng viên này?'
      "
      confirmText="Xác nhận"
      cancelText="Hủy bỏ"
      :loading="updating"
      @confirm="confirmUpdateTeacher"
      @cancel="closeUpdateTeacherModal"
    />

    <!-- Import modal -->
    <!-- Import modal removed per request -->
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import TeacherTable from '@/components/Teachers-Manager/TeacherTable.vue'
import TeacherBulkActions from '@/components/Teachers-Manager/TeacherBulkActions.vue'
import TeacherModal from '@/components/Teachers-Manager/TeacherModal.vue'
import TeacherViewModal from '@/components/Teachers-Manager/TeacherViewModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useTeachers } from '@/hooks/useTeachers'
import { useToast } from '@/composables/useToast'

export default {
  name: 'Teachers',
  components: {
    // TeacherStats removed: component deleted; use inline UI if needed in future
    // TeacherFilters removed - component was deleted; filter UI has been consolidated into the header controls
    TeacherTable,
    TeacherBulkActions,
    TeacherModal,
    TeacherViewModal,
    ConfirmDialog
  },
  setup() {
    // State (use hook to fetch & map teacher data)
    const toast = useToast()
    const { teachers, fetchTeachers, deleteTeacher, updateTeacher, loading } = useTeachers()
    const selectedTeachers = ref([])
    
    // Modals
    const showTeacherModal = ref(false)
    const showViewModal = ref(false)
    const editingTeacher = ref(null)
    const viewingTeacher = ref(null)
    const isEditMode = ref(false)
    
    // Confirmation Modals
    const deleteTeacherModalVisible = ref(false)
    const teacherToDelete = ref(null)
    const updateTeacherModalVisible = ref(false)
    const teacherToUpdate = ref(null)
    const deleting = ref(false)
    const updating = ref(false)
    
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
    
    // Import feature removed: state variables deleted
    
    // Computed
    // statistics computed removed (was used by TeacherStats component which was deleted).
    
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
      try {
        await fetchTeachers({ page: currentPage.value, limit: pageSize.value, q: filters.value.search || '' })
      } catch (err) {
        // show toast and keep UI empty (or fallback can be added)
        console.error('loadData fetchTeachers error', err)
        toast.error(err.message || 'Không thể tải danh sách giảng viên')
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
      // Debug: ensure add button click gets here
      // eslint-disable-next-line no-console
      console.log('[Teachers] openAddTeacherModal')
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
      // debug log to ensure handler fires and data propagated
      // eslint-disable-next-line no-console
      console.log('[Teachers] viewTeacher handler', teacher)
      viewingTeacher.value = teacher
      showViewModal.value = true
    }
    
    const promptDeleteTeacher = (teacher) => {
      teacherToDelete.value = teacher
      deleteTeacherModalVisible.value = true
    }
    
    const confirmDeleteTeacher = async () => {
      if (!teacherToDelete.value) return closeDeleteTeacherModal()
      try {
        deleting.value = true
        const code = teacherToDelete.value.user_code || teacherToDelete.value.userId || teacherToDelete.value.code
        await deleteTeacher(code)
        closeDeleteTeacherModal()
        await loadData()
      } catch (e) {
        console.error('delete teacher failed', e)
      } finally {
        deleting.value = false
      }
    }
    
    const closeDeleteTeacherModal = () => {
      deleteTeacherModalVisible.value = false
      teacherToDelete.value = null
    }
    
    const suspendTeacher = async (teacher) => {
      // Optimistic UI change
      const index = teachers.value.findIndex(t => t.id === teacher.id)
      if (index > -1) teachers.value[index].status = 'on-break'

      // Persist on backend
      try {
        const userCode = teacher.user_code || teacher.code || teacher.userId || teacher.raw?.user_code
        if (!userCode) throw new Error('Không tìm thấy mã người dùng')

        // Backend expects nested user object with is_active: 0/1
        await updateTeacher(userCode, { user: { is_active: 0 } })
        toast.success('Giảng viên đã được tạm khóa')
        await loadData()
      } catch (err) {
        console.error('suspendTeacher failed', err)
        toast.error(err.message || 'Không thể tạm khóa giảng viên')
        // rollback optimistic change
        if (index > -1) teachers.value[index].status = 'active'
      }
    }
    
    const activateTeacher = async (teacher) => {
      // Optimistic UI change
      const index = teachers.value.findIndex(t => t.id === teacher.id)
      if (index > -1) teachers.value[index].status = 'active'

      // Persist on backend
      try {
        const userCode = teacher.user_code || teacher.code || teacher.userId || teacher.raw?.user_code
        if (!userCode) throw new Error('Không tìm thấy mã người dùng')

        await updateTeacher(userCode, { user: { is_active: 1 } })
        toast.success('Giảng viên đã được kích hoạt')
        await loadData()
      } catch (err) {
        console.error('activateTeacher failed', err)
        toast.error(err.message || 'Không thể kích hoạt giảng viên')
        // rollback optimistic change
        if (index > -1) teachers.value[index].status = 'on-break'
      }
    }
    
    // When the modal emits save, the modal already performed the create/update via API.
    // So just reload the list to reflect DB state.
    const saveTeacher = async (resOrData) => {
      try {
        await loadData()
        // close modal if still open
        closeTeacherModal()
      } catch (e) {
        console.error('Error reloading teachers after save', e)
      }
    }
    
    const confirmUpdateTeacher = () => {
      if (teacherToUpdate.value && editingTeacher.value) {
        const index = teachers.value.findIndex(t => t.id === editingTeacher.value.id)
        if (index > -1) {
          teachers.value[index] = { ...teacherToUpdate.value }
          toast.success(`Đã cập nhật thông tin giảng viên ${teacherToUpdate.value.name}`)
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
    
    // processImport removed
    
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
      
      // Import (removed)
      
      // Computed
      // statistics (computed) removed
      filteredTeachers,
      
      // Methods
      updateFilters,
      resetFilters,
      handlePageChange,
      openAddTeacherModal,
      editTeacher,
      editTeacherFromView,
      viewTeacher,
      promptDeleteTeacher,
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
      // import handlers removed
      exportData,
      
      // Confirmation Handlers
      confirmDeleteTeacher,
      closeDeleteTeacherModal,
      confirmUpdateTeacher,
      closeUpdateTeacherModal,
      // Local loading flags
      deleting,
      updating,
      
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
  z-index: 100001;
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

/* Import styles removed */

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
}

.btn-cancel {
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

/* btn-import-process styles removed */

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .btn-primary,
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