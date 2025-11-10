<template>
  <div class="bulk-actions">
    <transition name="slide-down">
      <div v-if="selectedAccounts.length > 0" class="bulk-toolbar">
        <div class="selection-info">
          <i class="fas fa-check-circle"></i>
          <span>Đã chọn {{ selectedAccounts.length }} tài khoản</span>
          <button @click="$emit('clear-selection')" class="clear-selection">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="bulk-buttons">
          <button 
            @click="$emit('bulk-activate', selectedAccounts)"
            class="bulk-btn activate-btn"
            :disabled="!canActivate"
          >
            <i class="fas fa-check"></i>
            Kích hoạt
          </button>
          
          <button 
            @click="$emit('bulk-deactivate', selectedAccounts)"
            class="bulk-btn deactivate-btn"
            :disabled="!canDeactivate"
          >
            <i class="fas fa-ban"></i>
            Vô hiệu hóa
          </button>
          
          <div class="dropdown" ref="roleDropdown">
            <button 
              @click="toggleRoleDropdown"
              class="bulk-btn role-btn"
              :class="{ active: showRoleDropdown }"
            >
              <i class="fas fa-user-tag"></i>
              Đổi vai trò
              <i class="fas fa-chevron-down"></i>
            </button>
            
            <div v-if="showRoleDropdown" class="dropdown-menu">
              <button 
                v-for="role in roleOptions"
                :key="role.value"
                @click="handleRoleChange(role.value)"
                class="dropdown-item"
              >
                <i :class="role.icon"></i>
                {{ role.label }}
              </button>
            </div>
          </div>
          
          <div class="dropdown" ref="departmentDropdown">
            <button 
              @click="toggleDepartmentDropdown"
              class="bulk-btn department-btn"
              :class="{ active: showDepartmentDropdown }"
            >
              <i class="fas fa-building"></i>
              Đổi khoa
              <i class="fas fa-chevron-down"></i>
            </button>
            
            <div v-if="showDepartmentDropdown" class="dropdown-menu">
              <button 
                v-for="dept in departmentOptions"
                :key="dept.value"
                @click="handleDepartmentChange(dept.value)"
                class="dropdown-item"
              >
                {{ dept.label }}
              </button>
            </div>
          </div>
          
          <button 
            @click="showDeleteConfirm = true"
            class="bulk-btn delete-btn"
          >
            <i class="fas fa-trash"></i>
            Xóa
          </button>
          
          <button 
            @click="$emit('bulk-export', selectedAccounts)"
            class="bulk-btn export-btn"
          >
            <i class="fas fa-download"></i>
            Xuất Excel
          </button>
        </div>
      </div>
    </transition>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="confirm-modal" @click.stop>
        <div class="confirm-header">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Xác nhận xóa</h3>
        </div>
        <p>Bạn có chắc chắn muốn xóa {{ selectedAccounts.length }} tài khoản đã chọn?</p>
        <p class="warning">Thao tác này không thể hoàn tác!</p>
        <div class="confirm-actions">
          <button @click="showDeleteConfirm = false" class="btn-cancel">Hủy</button>
          <button @click="handleDelete" class="btn-delete">Xóa</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  selectedAccounts: {
    type: Array,
    default: () => []
  },
  accounts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'clear-selection',
  'bulk-activate',
  'bulk-deactivate', 
  'bulk-role-change',
  'bulk-department-change',
  'bulk-delete',
  'bulk-export'
])

const showRoleDropdown = ref(false)
const showDepartmentDropdown = ref(false)
const showDeleteConfirm = ref(false)
const roleDropdown = ref(null)
const departmentDropdown = ref(null)

const roleOptions = [
  { value: 'student', label: 'Sinh viên', icon: 'fas fa-user-graduate' },
  { value: 'teacher', label: 'Giảng viên', icon: 'fas fa-chalkboard-teacher' },
  { value: 'staff', label: 'Giáo vụ', icon: 'fas fa-user-tie' },
  { value: 'admin', label: 'Quản trị viên', icon: 'fas fa-user-shield' }
]

const departmentOptions = [
  { value: 'cntt', label: 'Công nghệ thông tin' },
  { value: 'dtvt', label: 'Điện tử viễn thông' },
  { value: 'co-khi', label: 'Cơ khí' },
  { value: 'kinh-te', label: 'Kinh tế' }
]

// Computed properties to check if actions are available
const canActivate = computed(() => {
  return props.selectedAccounts.some(id => {
    const account = props.accounts.find(acc => acc.id === id)
    return account && account.status !== 'active'
  })
})

const canDeactivate = computed(() => {
  return props.selectedAccounts.some(id => {
    const account = props.accounts.find(acc => acc.id === id)
    return account && account.status === 'active'
  })
})

const toggleRoleDropdown = () => {
  showRoleDropdown.value = !showRoleDropdown.value
  showDepartmentDropdown.value = false
}

const toggleDepartmentDropdown = () => {
  showDepartmentDropdown.value = !showDepartmentDropdown.value
  showRoleDropdown.value = false
}

const handleRoleChange = (role) => {
  emit('bulk-role-change', { accounts: props.selectedAccounts, role })
  showRoleDropdown.value = false
}

const handleDepartmentChange = (department) => {
  emit('bulk-department-change', { accounts: props.selectedAccounts, department })
  showDepartmentDropdown.value = false
}

const handleDelete = () => {
  emit('bulk-delete', props.selectedAccounts)
  showDeleteConfirm.value = false
}

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  if (roleDropdown.value && !roleDropdown.value.contains(event.target)) {
    showRoleDropdown.value = false
  }
  if (departmentDropdown.value && !departmentDropdown.value.contains(event.target)) {
    showDepartmentDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.bulk-actions {
  position: relative;
}

.bulk-toolbar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 16px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 24px;
  z-index: 1000;
  max-width: 90vw;
  overflow-x: auto;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #3b82f6;
  white-space: nowrap;
}

.selection-info i {
  color: #10b981;
}

.clear-selection {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
}

.clear-selection:hover {
  background: rgba(107, 114, 128, 0.2);
}

.bulk-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.bulk-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.bulk-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.activate-btn {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.activate-btn:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.2);
  transform: translateY(-1px);
}

.deactivate-btn {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.deactivate-btn:hover:not(:disabled) {
  background: rgba(249, 115, 22, 0.2);
  transform: translateY(-1px);
}

.role-btn, .department-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.role-btn:hover, .department-btn:hover,
.role-btn.active, .department-btn.active {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

.export-btn {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.export-btn:hover {
  background: rgba(107, 114, 128, 0.2);
  transform: translateY(-1px);
}

/* Dropdown */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  margin-bottom: 8px;
  z-index: 1001;
  min-width: 160px;
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-item:hover {
  background: rgba(59, 130, 246, 0.1);
}

.dropdown-item:first-child {
  border-radius: 8px 8px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 8px 8px;
}

/* Confirmation Modal */
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
}

.confirm-modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.confirm-header i {
  color: #f59e0b;
  font-size: 24px;
}

.confirm-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.confirm-modal p {
  margin: 8px 0;
  color: #6b7280;
}

.warning {
  color: #ef4444 !important;
  font-weight: 600;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel, .btn-delete {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
}

.btn-cancel:hover {
  background: rgba(107, 114, 128, 0.2);
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateX(-50%) translateY(100px);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateX(-50%) translateY(100px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .bulk-toolbar {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
  
  .bulk-buttons {
    justify-content: center;
  }
  
  .bulk-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>