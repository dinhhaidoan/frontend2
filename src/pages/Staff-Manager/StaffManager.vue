<template>
  <div class="staff-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1>
        <i class="fas fa-user-tie"></i>
        Quản lý giáo vụ khoa
      </h1>
      <button @click="openAddModal" class="btn-primary">
        <i class="fas fa-plus"></i>
        Thêm giáo vụ
      </button>
    </div>
    
    <!-- Simple Search -->
    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Tìm kiếm theo tên, mã, email..."
        class="search-input"
      />
      <i class="fas fa-search"></i>
    </div>
    
    <!-- Table -->
    <StaffTable 
      :teachers="filteredStaff"
      :filtered-teachers="filteredStaff"
      :selected-teachers="selectedTeachers"
      :current-page="currentPage"
      :page-size="pageSize"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
      @view="viewStaff"
      @edit="editStaff"
      @delete="confirmDeleteStaff"
      @suspend="() => {}"
      @activate="() => {}"
      @export="exportExcel"
    />
    
    <!-- Modals -->
    <StaffModal 
      :is-open="showModal"
      :staff="editingStaff"
      :is-edit="isEditMode"
      :uploading="uploadInProgress"
      :upload-progress="uploadProgress"
      @close="closeModal"
      @save="saveStaff"
    />
    
    <StaffViewModal 
      :is-open="showViewModal"
      :staff="viewingStaff"
      @close="closeViewModal"
      @edit="editStaffFromView"
    />
    
    <ConfirmDialog
      :show="showConfirmDelete"
      type="danger"
      title="Xác nhận xóa"
      :message="staffToDelete ? `Bạn chắc chắn muốn xóa giáo vụ ${staffToDelete.name}?` : 'Bạn chắc chắn muốn xóa?'"
      confirmText="Xóa"
      cancelText="Hủy"
      :loading="deleting"
      @confirm="deleteStaff"
      @cancel="() => { showConfirmDelete = false; staffToDelete = null }"
      @update:show="val => showConfirmDelete = val"
    />
    <ConfirmDialog
      :show="showConfirmUpdate"
      type="warning"
      title="Xác nhận cập nhật"
      :message="staffToUpdate ? `Bạn chắc chắn muốn cập nhật giáo vụ ${staffToUpdate.name}?` : 'Bạn chắc chắn muốn cập nhật?'"
      confirmText="Cập nhật"
      cancelText="Hủy"
      :loading="updating"
      @confirm="performUpdate"
      @cancel="() => { showConfirmUpdate = false; staffToUpdate = null; pendingUpdatePayload = null }"
      @update:show="val => showConfirmUpdate = val"
    />
  </div>
</template>
 

<script>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import StaffTable from '@/components/Staff-Manager/StaffTable.vue'
import StaffModal from '@/components/Staff-Manager/StaffModal.vue'
import StaffViewModal from '@/components/Staff-Manager/StaffViewModal.vue'
import { useStaffs } from '@/hooks/useStaffs'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'

export default {
  name: 'StaffManager',
  components: {
    StaffTable,
    StaffModal,
    StaffViewModal,
    ConfirmDialog
  },
  setup() {
    // All staff helpers come from the same composable — single call is enough
    const { staffs, staffsLoading, fetchStaffs, deleteUser, updateUser, createUser } = useStaffs()
    // selected rows (ids) for table actions — keep reactive instead of passing a new [] inline
    const selectedTeachers = ref([])
    const searchQuery = ref('')
    const showModal = ref(false)
    const showViewModal = ref(false)
    const editingStaff = ref(null)
    const viewingStaff = ref(null)
    const isEditMode = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const toast = useToast()

    // Confirm dialog state
    const showConfirmDelete = ref(false)
    const deleting = ref(false)
    const staffToDelete = ref(null)
    // Update confirmation state
    const showConfirmUpdate = ref(false)
    const updating = ref(false)
    const staffToUpdate = ref(null)
    const pendingUpdatePayload = ref(null)
    // upload progress state shared with modal
    const uploadInProgress = ref(false)
    const uploadProgress = ref(0)

    onMounted(() => {
      fetchStaffs()
    })

    // Upload helper with progress support (XMLHttpRequest) - returns parsed JSON when possible
    const uploadWithProgress = (url, file, onProgress, opts = {}) => {
      return new Promise((resolve, reject) => {
        try {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', url, true)
          xhr.withCredentials = true

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const ct = xhr.getResponseHeader('content-type') || ''
              try {
                if (ct.includes('application/json')) return resolve(JSON.parse(xhr.responseText))
                if (xhr.responseText) return resolve(JSON.parse(xhr.responseText))
                return resolve({})
              } catch (e) {
                // non-fatal: resolve with empty object
                return resolve({})
              }
            }
            return reject(new Error(`${xhr.status} ${xhr.statusText}: ${xhr.responseText || ''}`))
          }

          xhr.onerror = () => reject(new Error('Network error during upload'))
          if (xhr.upload && typeof xhr.upload.onprogress !== 'undefined') {
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
            }
          }

          const fieldName = opts.fieldName || 'file'
          const fd = new FormData()
          fd.append(fieldName, file)
          // append any extra fields
          if (opts.extra && typeof opts.extra === 'object') {
            for (const k of Object.keys(opts.extra)) fd.append(k, opts.extra[k])
          }

          xhr.send(fd)
        } catch (e) { reject(e) }
      })
    }

    const uploadImageToCloudinary = async (file, onProgress = null) => {
      if (!file) return null
      const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
      const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''
      if (!CLOUD || !PRESET || CLOUD.includes('YOUR_')) {
        throw new Error('Cloudinary không được cấu hình (VITE_CLOUDINARY_CLOUD_NAME / UPLOAD_PRESET)')
      }
      const url = `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`
      const res = await uploadWithProgress(url, file, onProgress, { fieldName: 'file', extra: { upload_preset: PRESET } })
      return res
    }

    const filteredStaff = computed(() => {
      if (!searchQuery.value) return staffs.value
      const q = searchQuery.value.toLowerCase()
      return staffs.value.filter(s => 
        (s.name||'').toLowerCase().includes(q) || 
        (s.code||'').toLowerCase().includes(q) || 
        (s.email||'').toLowerCase().includes(q)
      )
    })

    const handlePageChange = (p) => { currentPage.value = p }
    const handleSelectionChange = (selected) => {
      if (!selected) {
        selectedTeachers.value = []
        return
      }
      if (Array.isArray(selected) && selected.length && typeof selected[0] === 'object') {
        selectedTeachers.value = selected.map(s => s.id || s.code || s.user_id)
      } else {
        selectedTeachers.value = Array.isArray(selected) ? selected : [selected]
      }
    }
    const viewStaff = (s) => { viewingStaff.value = s; showViewModal.value = true }
    const editStaff = (s) => { editingStaff.value = s; isEditMode.value = true; showModal.value = true }
    const confirmDeleteStaff = (s) => {
      staffToDelete.value = s
      showConfirmDelete.value = true
    }

    const deleteStaff = async () => {
      if (!staffToDelete.value) return
      deleting.value = true
      try {
        await deleteUser(staffToDelete.value.code)
        toast.success(`Xóa giáo vụ ${staffToDelete.value.name} thành công`)
        // refresh list
        await fetchStaffs()
      } catch (err) {
        console.error('Delete error', err)
        toast.error(`Xóa thất bại: ${err.message || 'Lỗi server'}`)
      } finally {
        deleting.value = false
        showConfirmDelete.value = false
        staffToDelete.value = null
      }
    }
    const openAddModal = () => { editingStaff.value = null; isEditMode.value = false; showModal.value = true }
    const saveStaff = async (payload) => {
      try {
        if (isEditMode.value && editingStaff.value) {
          // Ask for confirmation before update: store payload and staff reference
          staffToUpdate.value = editingStaff.value
          pendingUpdatePayload.value = payload
          showConfirmUpdate.value = true
          return
        } else {
          // Create new user - build payload
          // determine password: use provided password, otherwise default
          const DEFAULT_PWD = '123456789'
          const chosenPassword = payload.password && payload.password.trim() ? payload.password : DEFAULT_PWD

          // Build payload according to desired register structure
          // Ensure staff_code == user_code (single source: payload.code)
          const code = payload.code || payload.user_code || payload.staff_code
          const createPayload = {
            user: {
              user_code: code,
              user_email: payload.email || null,
              user_password: chosenPassword,
              user_phone: payload.phone || null
            },
            role_name: 'Giáo vụ khoa',
            profile: {
              staff_name: payload.name,
              staff_code: code,
              staff_birthdate: payload.birthDate || null,
              staff_gender: payload.gender || null
            }
          }
          // Use helper to upload to Cloudinary if file present

          // Debug: log the payload so we can check exact body sent
          console.debug('[StaffManager] createPayload ->', JSON.parse(JSON.stringify(createPayload)))

          // upload avatar if provided (try Cloudinary if configured)
          if (payload.avatarFile) {
            try {
              uploadInProgress.value = true
              uploadProgress.value = 0
              const res = await uploadImageToCloudinary(payload.avatarFile, p => (uploadProgress.value = p))
              if (res) {
                createPayload.user.user_avatar = res.secure_url
                createPayload.user.user_avatar_public_id = res.public_id
              }
            } catch (e) {
              // Cloudinary upload failed OR not configured. We don't fail the whole create flow here —
              // backend may accept the file in a separate route or via other means.
              console.warn('Cloudinary upload skipped/failed for create: ', e)
            } finally {
              uploadInProgress.value = false
              uploadProgress.value = 0
            }
          }

          // Client-side validation: ensure staff_code/user_code and user_password present
          if (!createPayload.user || !createPayload.user.user_code) {
            toast.error('Dữ liệu chưa đủ: vui lòng nhập Mã giáo vụ (sẽ dùng làm user_code).')
            return
          }
          // user_password is always set (we default to DEFAULT_PWD when blank) so no-op here

          // create user first
          const created = await createUser(createPayload)
          // After user is created, determine the actual user_code returned by the server (fallback to the one we sent)
          const createdCode = createPayload.user.user_code || (created && (created.user?.user_code || created.user_code || created.code))
          // If an avatar file was provided, attempt to attach it server-side at /share/auth/users/:userCode/avatar
          if (payload.avatarFile) {
            try {
              // if we already uploaded to Cloudinary above and have secure_url, skip server upload
              if (!createPayload.user.user_avatar) {
                uploadInProgress.value = true
                uploadProgress.value = 0
                // Build API base (same normalization used in update flow)
                const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
                let API_BASE = String(_rawBase || '/api')
                if (!API_BASE.includes('/api')) API_BASE = API_BASE.replace(/\/+$/, '') + '/api'
                const uploadUrl = `${API_BASE.replace(/\/+$/,'')}/share/auth/users/${encodeURIComponent(createdCode)}/avatar`

                // use XHR upload to get progress
                await uploadWithProgress(uploadUrl, payload.avatarFile, p => uploadProgress.value = p, { fieldName: 'avatar' })
                // success — server attached avatar
              }
            } catch (e) {
              // check error message and try Cloudinary fallback on 404
              const txt = (e && e.message) ? e.message : ''
              if (txt && txt.startsWith('404')) {
                console.warn('Create: avatar endpoint not found on backend, trying Cloudinary fallback')
                try {
                  uploadInProgress.value = true
                  uploadProgress.value = 0
                  const cloudRes = await uploadImageToCloudinary(payload.avatarFile, p => (uploadProgress.value = p))
                  if (cloudRes) {
                    // best effort: try to patch user to include avatar url
                    const patchPayload = { user: { user_avatar: cloudRes.secure_url, user_avatar_public_id: cloudRes.public_id } }
                    try { if (createdCode) await updateUser(createdCode, patchPayload) } catch (err) { console.warn('Could not attach cloud avatar to created user', err) }
                  }
                } catch (cErr) {
                  console.warn('Cloudinary fallback failed for create avatar', cErr)
                }
              } else {
                console.warn('Create: avatar upload returned non-ok', txt)
              }
            } finally {
              uploadProgress.value = 0
              uploadInProgress.value = false
            }
          }
          // If we used default password, inform the admin so they know the value
          if (!payload.password || !payload.password.trim()) {
            toast.info(`Mật khẩu mặc định được đặt là ${DEFAULT_PWD}. Vui lòng thông báo cho người dùng đổi mật khẩu sau khi đăng nhập.`, 'Mật khẩu mặc định', { duration: 10000 })
          }
          toast.success('Thêm giáo vụ thành công')
        }
        await fetchStaffs()
        showModal.value = false
      } catch (err) {
        console.error('Save error', err)
          // Detect when backend doesn't implement create user and show actionable message
          if (err.message && err.message.startsWith('API_NOT_FOUND')) {
            toast.error('Lưu thất bại: API tạo người dùng chưa có ở backend (POST /api/share/auth/users). Vui lòng thêm endpoint trên server hoặc liên hệ backend team.', 'Lỗi API', { duration: 10000 })
          } else {
            toast.error(`Lưu thất bại: ${err.message || 'Lỗi server'}`)
          }
      }
    }

    const performUpdate = async () => {
      if (!staffToUpdate.value || !pendingUpdatePayload.value) return
      updating.value = true
      try {
        const userCode = staffToUpdate.value.code
        const payload = pendingUpdatePayload.value
        // Build nested update payload according to API spec: send partials under `user` and `profile`
        const updatePayload = {
          user: {
            user_fullname: payload.name,
            user_email: payload.email,
            user_phone: payload.phone
            // do NOT send password here unless admin sets it explicitly
          },
          profile: {
            staff_name: payload.name,
            staff_birthdate: payload.birthDate,
            staff_gender: payload.gender
          }
        }
        // If a new avatar was selected while editing, upload to backend avatar endpoint first
        if (payload.avatarFile) {
          try {
            // send form-data to backend upload endpoint using XHR so we can show progress
            uploadInProgress.value = true
            uploadProgress.value = 0
            const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
            let API_BASE = String(_rawBase || '/api')
            if (!API_BASE.includes('/api')) API_BASE = API_BASE.replace(/\/+$/, '') + '/api'
            const uploadUrl = `${API_BASE.replace(/\/+$/,'')}/share/auth/users/${userCode}/avatar`
            try {
              const rj = await uploadWithProgress(uploadUrl, payload.avatarFile, p => (uploadProgress.value = p), { fieldName: 'avatar' })
              if (rj && rj.user) {
                updatePayload.user = updatePayload.user || {}
                updatePayload.user.user_avatar = rj.user.user_avatar || rj.user_avatar || null
                updatePayload.user.user_avatar_public_id = rj.user.user_avatar_public_id || rj.user_avatar_public_id || null
              }
            } catch (err) {
              const msg = (err && err.message) ? err.message : ''
              if (msg && msg.startsWith('404')) {
                // backend endpoint not present, attempt Cloudinary fallback
                try {
                  const cloudRes = await uploadImageToCloudinary(payload.avatarFile, p => (uploadProgress.value = p))
                  if (cloudRes) {
                    updatePayload.user = updatePayload.user || {}
                    updatePayload.user.user_avatar = cloudRes.secure_url
                    updatePayload.user.user_avatar_public_id = cloudRes.public_id
                  }
                } catch (cloudErr) {
                  console.error('Cloudinary fallback failed', cloudErr)
                  toast.error('Upload avatar thất bại: ' + (cloudErr.message || msg))
                }
              } else {
                throw new Error('Upload avatar thất bại: ' + msg)
              }
            } finally {
              uploadProgress.value = 0
              uploadInProgress.value = false
            }
            // (handled above) backend response JSON already applied when present; nothing more to do here
          } catch (e) {
            console.error('Avatar upload for update failed', e)
            toast.error('Upload avatar thất bại: ' + (e.message || 'Lỗi'))
            // Stop update if avatar upload failed
            updating.value = false
            return
          }
        }

        // Debug: log what we're about to send and capture return value
        console.debug('[StaffManager] performUpdate -> userCode:', userCode, 'payload:', JSON.parse(JSON.stringify(updatePayload)))
        const resp = await updateUser(userCode, updatePayload)
        console.debug('[StaffManager] performUpdate response ->', resp)
        toast.success('Cập nhật giáo vụ thành công')
        await fetchStaffs()
        showModal.value = false
      } catch (err) {
        console.error('Update error', err)
        toast.error(`Cập nhật thất bại: ${err.message || 'Lỗi server'}`)
      } finally {
        updating.value = false
        showConfirmUpdate.value = false
        staffToUpdate.value = null
        pendingUpdatePayload.value = null
      }
    }
    const editStaffFromView = (s) => { editStaff(s); showViewModal.value = false }
    const closeModal = () => { showModal.value = false }
    const closeViewModal = () => { showViewModal.value = false }

    const formatDateForExport = (date) => {
      if (!date) return ''
      try {
        const d = new Date(date)
        if (isNaN(d.getTime())) return ''
        return d.toLocaleDateString('vi-VN')
      } catch (e) { return '' }
    }

    const roleLabel = (role) => {
      const map = { admin: 'Quản trị viên', staff: 'Giáo vụ', teacher: 'Giảng viên', student: 'Sinh viên' }
      return map[role] || (typeof role === 'string' ? role : '')
    }

    const genderLabel = (g) => {
      if (!g) return ''
      const raw = g.toString().toLowerCase()
      if (raw.includes('nam') || raw === 'male') return 'Nam'
      if (raw.includes('nữ') || raw.includes('nu') || raw === 'female') return 'Nữ'
      return 'Khác'
    }

    const exportExcel = () => {
      // decide source rows: selected if any, otherwise all filtered
      let rows = []
      if (selectedTeachers.value && selectedTeachers.value.length) {
        rows = filteredStaff.value.filter(s => selectedTeachers.value.includes(s.id) || selectedTeachers.value.includes(s.code) || selectedTeachers.value.includes(s.user_id))
      } else {
        rows = filteredStaff.value.slice()
      }

      if (!rows.length) {
        toast.info('Không có dữ liệu để xuất')
        return
      }

      const worksheetData = rows.map(s => ({
        'Mã (user_code)': s.code || '',
        'Họ và tên': s.name || '',
        'Email': s.email || '',
        'SĐT': s.phone || '',
        'Vai trò': roleLabel(s.role),
        'Trạng thái tài khoản': (s.accountStatus || ''),
        'Ngày sinh': formatDateForExport(s.birthDate),
        'Giới tính': genderLabel(s.gender),
        'Khoa/Phòng': s.department || ''
      }))

      try {
        const ws = XLSX.utils.json_to_sheet(worksheetData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Giáo vụ')
        // Format filename as requested: danhsachgiaovu_m:h/dd/mm/yyyy
        // Note: filenames cannot contain ':' or '/', so we replace them with '-' and '_' respectively
        const now = new Date()
        const min = String(now.getMinutes()).padStart(2, '0')
        const hour = String(now.getHours()).padStart(2, '0')
        const dd = String(now.getDate()).padStart(2, '0')
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const yyyy = now.getFullYear()
        // original desired visual: m:h/dd/mm/yyyy
        // Filesystems (Windows, macOS) do not allow ':' or '/' in filenames - they are sanitized or rejected.
        // Use a safe-but-readable separator and keep minute first (m then h): e.g. 30h14_25_11_2025
        const timePart = `${min}h${hour}_${dd}_${mm}_${yyyy}`
        const filename = `danhsachgiaovu_${timePart}.xlsx`
        XLSX.writeFile(wb, filename)
        toast.success(`Xuất file thành công: ${filename}`)
      } catch (err) {
        console.error('Export error', err)
        toast.error('Xuất file thất bại: ' + (err.message || 'Lỗi'))
      }
    }

    return {
      staffs,
      staffsLoading,
      searchQuery,
      showModal,
      showViewModal,
      editingStaff,
      viewingStaff,
      isEditMode,
      currentPage,
      pageSize,
      filteredStaff,
      handlePageChange,
      viewStaff,
      editStaff,
      deleteStaff,
      confirmDeleteStaff,
      showConfirmDelete,
      deleting,
      staffToDelete,
      // update confirm
      performUpdate,
      showConfirmUpdate,
      updating,
      staffToUpdate,
      openAddModal,
      saveStaff,
      editStaffFromView,
      closeModal,
      closeViewModal,
      selectedTeachers,
      handleSelectionChange
      ,uploadInProgress, uploadProgress
      ,exportExcel
    }
  }
}
</script>

<style scoped>
.staff-page {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}
.btn-primary {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}
.btn-primary:hover {
  background: #4338ca;
}
.search-bar {
  position: relative;
  margin-bottom: 20px;
}
.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}
.search-bar i {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}
</style>
