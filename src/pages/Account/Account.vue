<template>
  <div class="account-management">
    <!-- Page Header with Actions -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>Quản lý tài khoản</h1>
          <p>Quản lý người dùng, phân quyền và trạng thái tài khoản</p>
        </div>
      </div>
    </div>

    <!-- Statistics Section -->
    <AccountStats :stats="stats" />

    <!-- Filters -->
    <AccountFilters
      v-model="filters"
      @reset="resetFilters"
    />



    <!-- Account Table -->
    <AccountTable 
      :accounts="filteredAccounts"
      :selectedAccounts="selectedAccounts"
      :currentPage="currentPage"
      :itemsPerPage="itemsPerPage"
      :sortField="sortField"
      :sortDirection="sortDirection"
      :totalItems="filteredAccounts.length"
      @update:selectedAccounts="selectedAccounts = $event"
      @update:itemsPerPage="itemsPerPage = $event"
      @update:currentPage="currentPage = $event"
      @sort="handleSort"
      @view="viewAccount"
      @edit="editAccount"
      @toggle-status="toggleAccountStatus"
      @delete="deleteAccount"
    />

    <!-- Bulk Actions -->
    <BulkActions 
      :selectedAccounts="selectedAccounts"
      :accounts="accounts"
      @clear-selection="selectedAccounts = []"
      @bulk-activate="handleBulkActivate"
      @bulk-deactivate="handleBulkDeactivate"
      @bulk-role-change="handleBulkRoleChange"
      @bulk-department-change="handleBulkDepartmentChange"
      @bulk-delete="handleBulkDelete"
      @bulk-export="exportFilteredData"
    />

    <!-- Create/Edit Account Modal -->
    <AccountModal 
      :show="showCreateModal || showEditModal"
      :account="editingAccount"
      :saving="usersUpdating"
      @close="closeModals"
      @save="saveAccount"
    />

    <!-- View Account Details Modal -->
    <AccountViewModal 
      :show="showViewModal"
      :account="viewingAccount"
      @close="closeViewModal"
      @edit="editFromView"
    />

    <!-- Import Modal -->
    <div v-if="showImportModal" class="modal-overlay" @click="closeImportModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-upload"></i>
            Import danh sách tài khoản
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
              Bỏ qua tài khoản trùng lặp (theo email)
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="importOptions.sendWelcomeEmail" />
              Gửi email chào mừng cho tài khoản mới
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="importOptions.autoGeneratePassword" />
              Tự động tạo mật khẩu cho tài khoản mới
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="importOptions.setDefaultStatus" />
              Đặt trạng thái mặc định là "Hoạt động"
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

    <!-- Delete Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="deleteAccountModalVisible" class="modal-overlay" @click="closeDeleteModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3><i class="fas fa-user-times"></i> Xác nhận xóa tài khoản</h3>
            <button @click="closeDeleteModal" class="modal-close"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <p v-if="accountToDelete"><strong>{{ accountToDelete.name }}</strong> — {{ accountToDelete.email }}</p>
            <div style="margin-top:12px; background:#fff7ed; border:1px solid #fcd34d; padding:12px; border-radius:8px; color:#92400e;">
              <i class="fas fa-exclamation-triangle"></i>
              Hành động này không thể hoàn tác. Việc xóa tài khoản sẽ loại bỏ quyền truy cập của người dùng.
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeDeleteModal" class="btn-cancel">Hủy</button>
            <button @click="confirmDeleteAccount" class="btn-import-process" style="background:#dc2626;border-color:#dc2626;">Xóa</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Update Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="updateAccountModalVisible" class="modal-overlay" @click="closeUpdateModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3><i class="fas fa-user-check"></i> Xác nhận cập nhật tài khoản</h3>
            <button @click="closeUpdateModal" class="modal-close"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <p v-if="accountToUpdate"><strong>{{ accountToUpdate.name }}</strong> — {{ accountToUpdate.email }}</p>
            <div style="margin-top:12px; background:#eff6ff; border:1px solid #93c5fd; padding:12px; border-radius:8px; color:#1e3a8a;">
              Kiểm tra kỹ thông tin trước khi xác nhận cập nhật.
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeUpdateModal" class="btn-cancel">Hủy</button>
            <button @click="confirmUpdateAccount" class="btn-import-process">Xác nhận</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>

  <!-- Loading overlay when fetching users -->
  <div v-if="usersLoading" class="page-loading-overlay">
    <div class="loader">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
      <p>Đang tải danh sách người dùng...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx'
import AccountStats from '@/components/Account/AccountStats.vue'
import AccountFilters from '@/components/Account/AccountFilters.vue'
import AccountTable from '@/components/Account/AccountTable.vue'
import BulkActions from '@/components/Account/BulkActions.vue'
import AccountModal from '@/components/Account/AccountModal.vue'
import AccountViewModal from '@/components/Account/AccountViewModal.vue'
import { useUsers } from '@/hooks/useUsers'
import { useToast } from '@/composables/useToast'

// Reactive data: only role + status
const filters = ref({
  role: '',
  status: ''
})
const sortField = ref('name')
const sortDirection = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(25)
const selectedAccounts = ref([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showImportModal = ref(false)
const editingAccount = ref(null)
const viewingAccount = ref(null)

// Import state
const selectedFile = ref(null)
const isDragOver = ref(false)
const importOptions = ref({
  skipDuplicates: true,
  sendWelcomeEmail: true,
  autoGeneratePassword: true,
  setDefaultStatus: true
})

// Confirmation modal state
const deleteAccountModalVisible = ref(false)
const accountToDelete = ref(null)
const updateAccountModalVisible = ref(false)
const accountToUpdate = ref(null)

// Accounts loaded from backend
const accounts = ref([])
// Stats
const stats = computed(() => ({
  students: accounts.value.filter(a => a.role === 'student').length,
  teachers: accounts.value.filter(a => a.role === 'teacher').length,
  staff: accounts.value.filter(a => a.role === 'staff').length,
  active: accounts.value.filter(a => a.status === 'active').length
}))

// Filter statistics (role + status only)
const hasActiveFilters = computed(() => {
  return !!(filters.value.role || filters.value.status)
})

// Filtered and sorted accounts (role + status only)
const filteredAccounts = computed(() => {
  let filtered = accounts.value

  // Role filter
  if (filters.value.role) {
    filtered = filtered.filter(account => account.role === filters.value.role)
  }

  // Status filter
  if (filters.value.status) {
    filtered = filtered.filter(account => account.status === filters.value.status)
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]
    
    if (sortField.value === 'lastLogin' || sortField.value === 'createdAt') {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    }
    
    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })

  return filtered
})


const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// Methods
const resetFilters = () => {
  filters.value = { role: '', status: '' }
  currentPage.value = 1
}

const handleSort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const viewAccount = (account) => {
  viewingAccount.value = account
  showViewModal.value = true
}

const editAccount = (account) => {
  editingAccount.value = account
  showEditModal.value = true
}

const toggleAccountStatus = async (account) => {
  // Toggle active/inactive by calling backend and refreshing list
  const accountIndex = accounts.value.findIndex(a => a.id === account.id)
  if (accountIndex === -1) return

  const currentStatus = accounts.value[accountIndex].status === 'active'
  const desiredStatus = !currentStatus

  const token = localStorage.getItem('auth_token')

  try {
    // Backend expects is_active inside a user object
    const result = await updateUser(accounts.value[accountIndex].userId, { 
      user: { is_active: desiredStatus ? 1 : 0 } 
    }, token)

    // Refresh from backend
    await loadAccounts(false)

    // Find updated record from fresh data
    const updated = accounts.value.find(a => a.userId === accounts.value[accountIndex].userId)

    if (updated) {
      const nowActive = updated.status === 'active'
      if (nowActive === desiredStatus) {
        success(
          `Tài khoản ${updated.name} đã được ${desiredStatus ? 'kích hoạt' : 'tạm khóa'}`,
          desiredStatus ? 'Kích hoạt' : 'Tạm khóa'
        )
        return
      }
    }

    // If we reach here, backend did not persist the desired change
    warning('Backend đã nhận request nhưng trạng thái chưa thay đổi. Vui lòng kiểm tra lại.', 'Cảnh báo')
  } catch (err) {
    error(err.message || 'Không thể cập nhật trạng thái tài khoản', 'Lỗi')
  }
}

const deleteAccount = (account) => {
  accountToDelete.value = account
  deleteAccountModalVisible.value = true
}

const confirmDeleteAccount = async () => {
  if (accountToDelete.value) {
    const token = localStorage.getItem('auth_token')
    
    try {
      // Call backend to delete user
      await deleteUser(accountToDelete.value.userId, token)
      
      // Refresh from backend to get updated list
      await loadAccounts(false)
      
      // Remove from selection if present
      selectedAccounts.value = selectedAccounts.value.filter(id => id !== accountToDelete.value.id)
      
      success(
        `Tài khoản ${accountToDelete.value.name} đã được xóa thành công`,
        'Xóa thành công'
      )
    } catch (err) {
      error(
        err.message || 'Không thể xóa tài khoản. Vui lòng thử lại.',
        'Lỗi xóa tài khoản'
      )
    }
  }
  closeDeleteModal()
}

const closeDeleteModal = () => {
  deleteAccountModalVisible.value = false
  accountToDelete.value = null
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingAccount.value = null
}

const closeViewModal = () => {
  showViewModal.value = false
  viewingAccount.value = null
}

const editFromView = (account) => {
  // Close view modal and open edit modal
  closeViewModal()
  editAccount(account)
}

const saveAccount = (accountData) => {
  if (editingAccount.value) {
    // Defer actual update until user confirms
    accountToUpdate.value = { ...editingAccount.value, ...accountData }
    updateAccountModalVisible.value = true
  } else {
    // Create new account
    const newAccount = {
      id: Date.now(),
      ...accountData,
      status: 'active',
      lastLogin: new Date(),
      avatar: null
    }
    accounts.value.push(newAccount)
    closeModals()
    alert('Đã tạo tài khoản mới thành công')
  }
}

const confirmUpdateAccount = async () => {
  if (accountToUpdate.value) {
    const index = accounts.value.findIndex(a => a.id === accountToUpdate.value.id)
    
  if (index > -1) {
      // Prepare payload for backend - match the format that works in Postman
      const payload = {
        // Update User table fields  
        user_email: accountToUpdate.value.email,
        user_phone: accountToUpdate.value.phone,
        // Update profile table in nested format
        profile: {}
      }

      // Also include a nested `user` object in case backend expects it
      payload.user = {
        user_email: accountToUpdate.value.email,
        user_phone: accountToUpdate.value.phone
      }

      // Add role-specific profile data
      if (accountToUpdate.value.role === 'student') {
        payload.profile.student_name = accountToUpdate.value.name
      } else if (accountToUpdate.value.role === 'teacher') {
        payload.profile.teacher_name = accountToUpdate.value.name
      } else if (accountToUpdate.value.role === 'staff') {
        payload.profile.staff_name = accountToUpdate.value.name
      } else if (accountToUpdate.value.role === 'admin') {
        payload.profile.admin_name = accountToUpdate.value.name
      }

      

      const token = localStorage.getItem('auth_token')
      
      // Call backend to update user - use user_code as identifier
      try {
        const result = await updateUser(accountToUpdate.value.userId, payload, token)
        
        // Force refresh from backend to see if data was actually saved
        await loadAccounts(false)
        
        // Check if the update actually worked by comparing fresh data
        const updatedAccount = accounts.value.find(a => a.userId === accountToUpdate.value.userId)
        
        if (updatedAccount && updatedAccount.email === payload.user_email) {
          success(
            `Tài khoản ${accountToUpdate.value.name} đã được cập nhật thành công`,
            'Cập nhật thành công'
          )
        } else {
          warning(
            'Backend đã nhận request nhưng có thể chưa lưu vào database. Vui lòng kiểm tra lại.',
            'Cảnh báo'
          )
        }
      } catch (err) {
        error(
          err.message || 'Đã có lỗi xảy ra khi cập nhật thông tin tài khoản',
          'Cập nhật thất bại'
        )
      }
    } else {
      warning('Không tìm thấy tài khoản để cập nhật', 'Lỗi')
    }
  } else {
    warning('Thông tin tài khoản không hợp lệ', 'Lỗi')
  }
  closeModals()
  closeUpdateModal()
}

const closeUpdateModal = () => {
  updateAccountModalVisible.value = false
  accountToUpdate.value = null
}

// Bulk Actions
const handleBulkActivate = (accountIds) => {
  accountIds.forEach(id => {
    const account = accounts.value.find(a => a.id === id)
    if (account) account.status = 'active'
  })
  selectedAccounts.value = []
}

const handleBulkDeactivate = (accountIds) => {
  accountIds.forEach(id => {
    const account = accounts.value.find(a => a.id === id)
    if (account) account.status = 'inactive'
  })
  selectedAccounts.value = []
}

const handleBulkRoleChange = ({ accounts: accountIds, role }) => {
  accountIds.forEach(id => {
    const account = accounts.value.find(a => a.id === id)
    if (account) account.role = role
  })
  selectedAccounts.value = []
}

const handleBulkDepartmentChange = ({ accounts: accountIds, department }) => {
  accountIds.forEach(id => {
    const account = accounts.value.find(a => a.id === id)
    if (account) account.department = department
  })
  selectedAccounts.value = []
}

const handleBulkDelete = (accountIds) => {
  accounts.value = accounts.value.filter(a => !accountIds.includes(a.id))
  selectedAccounts.value = []
}

// Saved filters feature removed (only role + status supported)

const exportFilteredData = () => {
  // Export only filtered data instead of all data
  const exportData = filteredAccounts.value.map(account => ({
    'Họ và tên': account.name,
    'Mã người dùng': account.userId,
    'Email': account.email,
    'Vai trò': account.role,
    'Khoa/Bộ môn': account.department,
    'Số điện thoại': account.phone || '',
    'Trạng thái': account.status,
    'Ngày tạo': account.createdAt || '',
    'Đăng nhập cuối': account.lastLogin ? new Date(account.lastLogin).toLocaleDateString('vi-VN') : ''
  }))
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // Họ và tên
    { wch: 15 }, // Mã người dùng
    { wch: 25 }, // Email
    { wch: 10 }, // Vai trò
    { wch: 15 }, // Khoa/Bộ môn
    { wch: 15 }, // Số điện thoại
    { wch: 12 }, // Trạng thái
    { wch: 12 }, // Ngày tạo
    { wch: 15 }  // Đăng nhập cuối
  ]
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách tài khoản (đã lọc)')
  
  // Download file with filter info in name
  const filterInfo = []
  if (filters.value.role) filterInfo.push(filters.value.role)
  if (filters.value.status) filterInfo.push(filters.value.status)

  const filterSuffix = filterInfo.length > 0 ? `_${filterInfo.join('-')}` : ''
  const fileName = `danh_sach_tai_khoan${filterSuffix}_${new Date().toISOString().split('T')[0]}.xlsx`
  
  XLSX.writeFile(workbook, fileName)
  
  success(
    `Đã xuất ${exportData.length} tài khoản với bộ lọc hiện tại`,
    'Xuất dữ liệu thành công'
  )
}

// Import functions
const { accounts: hookAccounts, fetchUsers, updateUser, deleteUser, usersLoading, usersUpdating } = useUsers()
const { success, error, warning } = useToast()

const loadAccounts = async (showSuccessToast = true) => {
  try {
    const token = localStorage.getItem('auth_token')
    await fetchUsers(token)
    // hydrate local mapped accounts from hook
    accounts.value = hookAccounts.value
    
    if (showSuccessToast && accounts.value.length > 0) {
      success(
        `Đã tải thành công ${accounts.value.length} tài khoản`,
        'Tải dữ liệu thành công'
      )
    }
  } catch (err) {
    console.error('Error loading accounts via hook:', err)
    error(
      'Không thể tải danh sách tài khoản. Vui lòng thử lại.',
      'Lỗi tải dữ liệu'
    )
  }
}

onMounted(() => {
  loadAccounts()
})
  
// Keep local accounts in sync with hookAccounts (live-sync)
watch(hookAccounts, (val) => {
  accounts.value = val
}, { immediate: true })

// Watch for filter changes and reset pagination
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })
 

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

const processImport = async () => {
  if (!selectedFile.value) return
  
  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      
      // Assume first sheet
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      // Skip header row and process data
      const importedAccounts = []
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i]
        if (row.length >= 5) { // Ensure minimum required fields
          const accountData = {
            name: row[0] || '',
            userId: row[1] || '',
            email: row[2] || '',
            role: row[3] || 'student',
            department: row[4] || '',
            phone: row[5] || '',
            status: importOptions.value.setDefaultStatus ? 'active' : 'inactive'
          }
          
          // Skip duplicates if option is enabled
          if (importOptions.value.skipDuplicates) {
            const existingAccount = accounts.value.find(acc => acc.email === accountData.email)
            if (existingAccount) continue
          }
          
          // Generate password if option is enabled
          if (importOptions.value.autoGeneratePassword) {
            accountData.password = Math.random().toString(36).slice(-8)
          }
          
          importedAccounts.push({
            id: Date.now() + i,
            ...accountData,
            lastLogin: new Date(),
            avatar: null
          })
        }
      }
      
      // Add imported accounts to the list
      accounts.value.push(...importedAccounts)
      
      alert(`Đã import thành công ${importedAccounts.length} tài khoản!`)
      closeImportModal()
    }
    
    reader.readAsArrayBuffer(selectedFile.value)
  } catch (error) {
    console.error('Import error:', error)
    alert('Có lỗi xảy ra khi import file. Vui lòng kiểm tra định dạng file.')
  }
}


</script>

<style scoped>
.account-management {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 32px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.title-section h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #1f2937, #3b82f6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-section p {
  color: #6b7280;
  margin: 0;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Buttons */
.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

.btn-secondary:hover {
  background: rgba(107, 114, 128, 0.15);
  transform: translateY(-1px);
}

/* Filter Section */
.filter-section {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.search-container {
  margin-bottom: 16px;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  min-width: 140px;
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  background: rgba(239, 68, 68, 0.15);
}

/* Filter Statistics */
.filter-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.filter-results {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1f2937;
  font-size: 14px;
}

.filter-results i {
  color: #3b82f6;
  font-size: 16px;
}

.filter-results strong {
  color: #3b82f6;
  font-weight: 700;
}

.filter-reduction {
  color: #6b7280;
  font-size: 13px;
  font-style: italic;
}

.filter-performance {
  color: #9ca3af;
  font-size: 12px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stat-icon.student { background: linear-gradient(135deg, #10b981, #34d399); }
.stat-icon.teacher { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.stat-icon.staff { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
.stat-icon.active { background: linear-gradient(135deg, #f59e0b, #fbbf24); }

.stat-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.stat-content p {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0 0;
}

/* Table Container */
.table-container {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.table-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.entries-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.entries-per-page select {
  padding: 4px 8px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  border-radius: 6px;
  background: white;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
}

.account-table {
  width: 100%;
  border-collapse: collapse;
}

.account-table th,
.account-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.account-table th {
  background: rgba(249, 250, 251, 0.8);
  font-weight: 600;
  color: #374151;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.account-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.account-table th.sortable:hover {
  background: rgba(243, 244, 246, 0.8);
}

.account-table tbody tr:hover {
  background: rgba(59, 130, 246, 0.02);
}

.account-table tbody tr.selected {
  background: rgba(59, 130, 246, 0.05);
}

/* Table Cells */
.avatar-cell {
  width: 60px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-info .name {
  font-weight: 600;
  color: #1f2937;
}

.user-info .user-id {
  font-size: 12px;
  color: #6b7280;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.student { background: rgba(16, 185, 129, 0.1); color: #059669; }
.role-badge.teacher { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
.role-badge.staff { background: rgba(139, 92, 246, 0.1); color: #7c3aed; }
.role-badge.admin { background: rgba(239, 68, 68, 0.1); color: #dc2626; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active { background: rgba(16, 185, 129, 0.1); color: #059669; }
.status-badge.inactive { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
.status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #d97706; }

.date {
  font-size: 14px;
  color: #6b7280;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.btn-action.view { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
.btn-action.edit { background: rgba(245, 158, 11, 0.1); color: #d97706; }
.btn-action.activate { background: rgba(16, 185, 129, 0.1); color: #059669; }
.btn-action.deactivate { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
.btn-action.delete { background: rgba(239, 68, 68, 0.1); color: #dc2626; }

.btn-action:hover {
  transform: scale(1.1);
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #374151;
}

.page-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.05);
  border-color: #3b82f6;
}

.page-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: 0 8px;
  color: #9ca3af;
}

/* Bulk Actions Bar */
.bulk-actions-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateX(-50%) translateY(100%); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

.selected-info {
  color: white;
  font-weight: 600;
}

.bulk-actions {
  display: flex;
  gap: 8px;
}

.btn-bulk {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 600;
}

.btn-bulk.activate { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.btn-bulk.deactivate { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.btn-bulk.role { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }
.btn-bulk.delete { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.btn-bulk:hover {
  transform: scale(1.05);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  from { transform: scale(0.8) translateY(-20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(107, 114, 128, 0.2);
}

/* Form */
.account-form {
  padding: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.password-input {
  position: relative;
  display: flex;
  gap: 8px;
}

.password-input input {
  flex: 1;
}

.password-toggle,
.generate-password {
  padding: 12px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.password-toggle {
  width: 44px;
  justify-content: center;
}

.password-toggle:hover,
.generate-password:hover {
  background: rgba(249, 250, 251, 1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Responsive */
@media (max-width: 768px) {
  .account-management {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-wrapper {
    overflow-x: scroll;
  }
  
  .account-table {
    min-width: 800px;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .bulk-actions-bar {
    flex-direction: column;
    gap: 12px;
    left: 16px;
    right: 16px;
    transform: none;
  }
  
  .bulk-actions {
    flex-wrap: wrap;
  }
  
  .modal-content {
    margin: 16px;
    max-height: calc(100vh - 32px);
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Import Modal Styles */
.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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

/* Import Button (compact style) */
.btn-import {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  height: 36px;
  border-radius: 8px;
  background: #f3f4f6; /* subtle light gray */
  color: #374151;
  border: 1px solid #e6e9ed;
  font-weight: 600;
  font-size: 14px;
  line-height: 1;
  box-shadow: 0 1px 2px rgba(16,24,40,0.04);
  transition: all 0.15s ease;
}

.btn-import i {
  font-size: 16px;
  color: #374151;
}

.btn-import:hover {
  background: #e9eef5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16,24,40,0.06);
}

/* Make sure import button stays compact on small screens */
@media (max-width: 480px) {
  .btn-import {
    padding: 6px 8px;
    gap: 6px;
    height: 34px;
    font-size: 13px;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .account-management {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-wrapper {
    overflow-x: scroll;
  }
  
  .account-table {
    min-width: 800px;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .bulk-actions-bar {
    flex-direction: column;
    gap: 12px;
    left: 16px;
    right: 16px;
    transform: none;
  }
  
  .bulk-actions {
    flex-wrap: wrap;
  }
  
  .modal-content {
    margin: 16px;
    max-height: calc(100vh - 32px);
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .account-management {
    color: #f9fafb;
  }
  
  .title-section h1 {
    color: #f9fafb;
  }
  
  .header-content,
  .filter-section,
  .table-container {
    background: rgba(17, 24, 39, 0.9);
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .account-table th {
    background: rgba(31, 41, 55, 0.8);
    color: #d1d5db;
  }
  
  .account-table tbody tr:hover {
    background: rgba(59, 130, 246, 0.1);
  }
}

/* Loading overlay styles */
.page-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loader {
  text-align: center;
  color: #3b82f6;
}

.loader p {
  margin-top: 12px;
  font-size: 16px;
  color: #374151;
}
</style>
