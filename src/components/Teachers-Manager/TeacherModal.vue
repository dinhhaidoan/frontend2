<template>
  <div class="modal-overlay" v-if="isOpen" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-user-tie"></i>
          {{ isEdit ? 'Cập nhật' : 'Thêm' }} Giảng viên
        </h3>
        <button @click="handleClose" class="btn-close"><i class="fas fa-times"></i></button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="modal-content">
            <div class="modal-side">
              <div class="avatar-card">
                <div v-if="preview" class="avatar-preview-lg"><img :src="preview" :alt="form.profile.teacher_name || form.user.user_code || 'avatar'" @error="e => onPreviewError(e, preview)" /></div>
                <div v-else class="avatar-placeholder-lg"><i class="fas fa-user-tie fa-2x"></i></div>

                <div class="uploader-actions">
                  <div class="avatar-input-row">
                    <label class="btn-upload">
                      <input type="file" accept="image/png,image/jpeg,image/webp" @change="onFileChange" />
                      <i class="fas fa-upload"></i>
                      Chọn ảnh
                    </label>
                    <button v-if="preview || file" @click="confirmRemove.show = true" class="btn-remove-avatar" :disabled="uploading || saving"><i class="fas fa-trash-alt"></i> Xóa ảnh</button>
                  </div>
                  <small class="muted">Hỗ trợ: .jpg .png .webp — tối đa 5MB</small>
                  <div v-if="uploading" class="upload-progress">
                    <div class="progress-line" role="progressbar" :aria-valuenow="uploadProgress" aria-valuemin="0" aria-valuemax="100">
                      <div class="progress-bar" :style="{ width: (uploadProgress || 0) + '%' }"></div>
                    </div>
                    <div class="progress-label">Đang upload: {{ uploadProgress || 0 }}%</div>
                  </div>
                </div>
                <div class="avatar-note">Ảnh sẽ hiển thị sau khi lưu hoặc khi preview đã có.</div>
              </div>
            </div>

            <div class="modal-form">
              <div class="form-grid">

            <div class="form-group">
              <label>Email</label>
              <input v-model="form.user.user_email" type="email" />
            </div>

            <div class="form-group" v-if="!isEdit">
              <label>Mật khẩu (để trống sẽ dùng mật khẩu mặc định)</label>
              <input v-model="form.user.user_password" type="password" placeholder="Mật khẩu (mặc định: 123456789 nếu để trống)" />
              <div v-if="errors.user && errors.user.user_password" class="field-error">{{ errors.user.user_password }}</div>
            </div>

            <div class="form-group">
              <label>Số điện thoại</label>
              <input v-model="form.user.user_phone" />
            </div>

            <!-- User code / teacher code input: allow typing when creating, read-only when editing -->
            <div v-if="!isEdit" class="form-group">
              <label>Mã giảng viên (teacher_code)</label>
              <input v-model="form.user.user_code" required />
            </div>

            <div class="form-group">
              <label>Họ và tên (teacher_name)</label>
              <input v-model="form.profile.teacher_name" required />
            </div>

            <!-- teacher_code is same as user_code — show readonly/disabled when editing so user sees it -->
            <div v-if="isEdit" class="form-group">
              <label>Mã giảng viên (teacher_code)</label>
              <!-- Display user_code when editing as well (read-only) -->
              <input v-model="form.user.user_code" disabled class="disabled-highlight" />
            </div>

              <div class="form-group">
              <label>Học hàm / Học vị</label>
              <select v-model.number="form.profile.academic_degree_id" required>
                <option value="" disabled>Chọn học vị</option>
                <option v-for="d in degrees" :key="d.academic_degree_id" :value="d.academic_degree_id">
                  {{ d.academic_degree_name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Chức vụ</label>
              <select v-model.number="form.profile.position_id" :disabled="isEdit" :class="{ 'disabled-highlight': isEdit }" required>
                <option value="" disabled>Chọn chức vụ</option>
                <option v-for="p in positions" :key="p.position_id" :value="p.position_id">
                  {{ p.position_name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Ngày sinh</label>
              <input v-model="form.profile.teacher_birthdate" type="date" />
            </div>

            <div class="form-group">
              <label>Ngày vào làm</label>
              <input v-model="form.profile.teacher_days_of_joining" type="date" :disabled="isEdit" :class="{ 'disabled-highlight': isEdit }" />
            </div>


            <div class="form-group">
              <label>Giới tính</label>
              <select v-model="form.profile.teacher_gender">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div class="form-group">
              <label>Trạng thái</label>
              <select v-model="form.profile.teacher_active">
                <option :value="true">Hoạt động</option>
                <option :value="false">Tạm dừng</option>
              </select>
            </div>

            <!-- Avatar input moved to the left side avatar-card (preview + uploader) -->

            <div class="form-group" style="grid-column: span 2;">
              <label>Ghi chú nội bộ</label>
              <textarea v-model="form.profile.teacher_notes" rows="3" placeholder="Ghi chú, lưu ý nội bộ"></textarea>
            </div>
              </div> <!-- .form-grid -->
            </div> <!-- .modal-form -->
          </div> <!-- .modal-content -->
        </form>
      </div>

      <div class="modal-footer">
        <button @click="handleClose" class="btn-cancel" :disabled="uploading || saving">Hủy</button>
        <button @click="handleSubmit" class="btn-save" :disabled="uploading || saving">{{ uploading ? 'Đang upload...' : (isEdit ? 'Cập nhật' : 'Tạo') }}</button>
      </div>

      <!-- Confirm dialog for saving -->
      <ConfirmDialog
        :show="confirmSave.show"
        type="warning"
        title="Xác nhận lưu"
        :message="confirmSave.message"
        confirmText="Xác nhận"
        cancelText="Hủy"
        :loading="saving"
        @confirm="performSave"
        @cancel="() => { confirmSave.show = false }"
      />

      <!-- Confirm dialog for removing avatar -->
      <ConfirmDialog
        :show="confirmRemove.show"
        type="danger"
        title="Xóa ảnh đại diện"
        message="Bạn có chắc chắn muốn xóa ảnh đại diện? Hành động này sẽ loại bỏ ảnh hiện tại (chỉ thay đổi khi lưu)."
        confirmText="Xóa"
        cancelText="Hủy"
        :loading="saving"
        @confirm="() => { confirmRemove.show = false; removeAvatar() }"
        @cancel="() => { confirmRemove.show = false }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import { fetchImageAsBlobUrl, revokeBlobUrl } from '@/composables/useAvatarLoader'
import { useTeachers } from '@/hooks/useTeachers'
import teacherService from '@/services/teacherService'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  teacher: { type: Object, default: null },
  isEdit: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'save'])

const toast = useToast()
const { createTeacher, updateTeacher } = useTeachers()

const form = ref({ user: {}, profile: {} })
const saving = ref(false)
const errors = ref({})
const preview = ref(null)
// blob map to store fetched fallback blob URLs -> original URL
const _blobMap = new Map()
const file = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const degrees = ref([])
const positions = ref([])

const loadLookups = async () => {
  try {
    const d = await teacherService.listAcademicDegrees()
    degrees.value = Array.isArray(d) ? d : (d.items || [])
  } catch (e) { console.warn(e) }
  try {
    const p = await teacherService.listPositions()
    positions.value = Array.isArray(p) ? p : (p.items || [])
  } catch (e) { console.warn(e) }
}

// Confirmation states
const confirmSave = ref({ show: false, message: '' })
const confirmRemove = ref({ show: false })

function formatToDateInput(value) {
  if (!value) return ''
  // Already in yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  // ISO full datetime -> yyyy-mm-dd
  const iso = value && value.split && value.split('T') && value.split('T')[0]
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  // dd/mm/yyyy or dd-mm-yyyy -> convert
  const m = String(value).trim().match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
  if (m) {
    const dd = m[1].padStart(2, '0')
    const mm = m[2].padStart(2, '0')
    const yyyy = m[3]
    return `${yyyy}-${mm}-${dd}`
  }
  // unix timestamp in seconds or ms
  const num = Number(value)
  if (!Number.isNaN(num)) {
    const ts = (String(value).length === 10) ? num * 1000 : num
    const d = new Date(ts)
    if (!isNaN(d)) {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    }
  }
  return ''
}

const resetForm = () => {
  form.value = { user: { user_code: '', user_email: '', user_password: '', user_phone: '' }, profile: { teacher_name: '', teacher_code: '', academic_degree_id: '', position_id: '', teacher_birthdate: '', teacher_days_of_joining: '', teacher_gender: '', teacher_notes: '', teacher_active: true } }
  preview.value = null
  file.value = null
}

watch(() => props.teacher, (t) => {
  if (t) {
    // Backend may provide different shapes here. Support both mapped objects used by pages
    // and the raw API payload shapes. Try multiple fallbacks so fields always show when editing.
    form.value.user = {
      user_code: t.user_code || t.userId || t.code || t.userId || (t.raw && (t.raw.user_code || t.raw.userId)) || '',
      user_email: t.user_email || t.email || t.user?.user_email || (t.raw && (t.raw.user_email || t.raw.email)) || '',
      user_phone: t.user_phone || t.phone || t.user?.user_phone || (t.raw && (t.raw.user_phone || t.raw.phone)) || ''
    }

    // Map nested teacher values into the profile form fields (support many shapes)
    const teacherProfile = Object.assign({}, t.profile || t.teacher || t.Teacher || t.raw?.Teacher || t.raw || {})
    // Normalize keys (backend may use teacher_name, teacher_code, academic_degree_id, position_id)
    form.value.profile = {
      teacher_name: teacherProfile.teacher_name || teacherProfile.name || teacherProfile.teacher_fullname || '',
      teacher_code: t.user_code || teacherProfile.teacher_code || t.user_code || '',
      academic_degree_id: teacherProfile.academic_degree_id || teacherProfile.academic_degree_id || '',
      position_id: teacherProfile.position_id || teacherProfile.position_id || '',
      // Normalize dates to yyyy-mm-dd (input[type=date] expects this format)
      teacher_birthdate: formatToDateInput(teacherProfile.teacher_birthdate || teacherProfile.birthdate || t.raw?.teacher_birthdate || t.raw?.birthdate || ''),
      teacher_days_of_joining: formatToDateInput(teacherProfile.teacher_days_of_joining || teacherProfile.join_date || t.raw?.teacher_days_of_joining || t.raw?.join_date || ''),
      teacher_gender: teacherProfile.teacher_gender || teacherProfile.gender || '',
      // Resolve boolean active flag from many possible shapes
      teacher_active: (typeof teacherProfile.teacher_active !== 'undefined') ? !!teacherProfile.teacher_active
        : (typeof teacherProfile.is_active !== 'undefined') ? !!teacherProfile.is_active
        : (typeof teacherProfile.active !== 'undefined') ? !!teacherProfile.active
        : (t.status ? (String(t.status).toLowerCase() === 'active') : true),
      // department has been removed: we don't store department in DB
      teacher_notes: teacherProfile.teacher_notes || teacherProfile.notes || ''
    }
    // avatar might be on top-level (avatar), user_avatar, or nested raw response
    preview.value = t.user_avatar || t.avatar || t.user_avatar || t.user?.user_avatar || t.raw?.user_avatar || t.raw?.avatar || null
  } else {
    resetForm()
  }
}, { immediate: true })

onMounted(loadLookups)

const onFileChange = (e) => {
  const f = e.target.files && e.target.files[0]
  if (!f) return

  // validate
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(f.type)) {
    toast.error('Chỉ chấp nhận định dạng: jpg, png, webp')
    return
  }
  const maxBytes = 5 * 1024 * 1024
  if (f.size > maxBytes) {
    toast.error('File quá lớn (tối đa 5MB)')
    return
  }

  // revoke previous blob URL if we created one
  if (file.value && preview.value && preview.value.startsWith('blob:')) {
    try { URL.revokeObjectURL(preview.value) } catch (e) {}
  }

  file.value = f
  preview.value = URL.createObjectURL(f)
}

const removeAvatar = () => {
  file.value = null
  preview.value = null
}

const handleClose = () => emit('close')

const handleOverlayClick = () => {
  // prevent closing while uploading or saving
  if (uploading.value || saving.value) return
  handleClose()
}

const handleSubmit = async () => {
  errors.value = {}
  // basic validation before showing confirmation
  if (!form.value.user.user_code || !form.value.profile.teacher_name || !form.value.profile.academic_degree_id || !form.value.profile.position_id) {
    toast.warning('Vui lòng điền đủ các trường bắt buộc')
    return
  }

  // Show confirm dialog with contextual message
  confirmSave.value.message = props.isEdit ? `Bạn có chắc chắn muốn cập nhật giảng viên "${form.value.profile.teacher_name}" (${form.value.user.user_code})?` : `Bạn có chắc chắn muốn tạo giảng viên "${form.value.profile.teacher_name}" (${form.value.user.user_code})?`
  confirmSave.value.show = true
}

const performSave = async () => {
  confirmSave.value.show = false
  saving.value = true
  try {
    // basic validation
    if (!form.value.user.user_code || !form.value.profile.teacher_name || !form.value.profile.academic_degree_id || !form.value.profile.position_id) {
      toast.warning('Vui lòng điền đủ các trường bắt buộc')
      return
    }

    const payload = {
      user: {
        user_code: form.value.user.user_code,
        user_email: form.value.user.user_email,
        user_password: form.value.user.user_password || undefined,
        user_phone: form.value.user.user_phone || undefined
      },
      role_name: 'Giảng viên',
      profile: {
        teacher_name: form.value.profile.teacher_name,
        // teacher_code should always match user_code per spec — set explicitly from user input
        teacher_code: form.value.user.user_code || form.value.profile.teacher_code,
        academic_degree_id: form.value.profile.academic_degree_id,
        position_id: form.value.profile.position_id,
        // Send dates as-is (ISO yyyy-mm-dd) or undefined
        teacher_birthdate: form.value.profile.teacher_birthdate ? String(form.value.profile.teacher_birthdate) : undefined,
        teacher_days_of_joining: form.value.profile.teacher_days_of_joining ? String(form.value.profile.teacher_days_of_joining) : undefined,
        teacher_gender: form.value.profile.teacher_gender || undefined,
        teacher_active: form.value.profile.teacher_active === undefined ? undefined : !!form.value.profile.teacher_active,
        teacher_notes: form.value.profile.teacher_notes || undefined
      }
    }

    if (!props.isEdit) {
      // default password if not provided
      if (!payload.user.user_password) payload.user.user_password = '123456789'

      const res = await createTeacher(payload)
      if (file.value) {
        try {
          uploading.value = true
          uploadProgress.value = 0
          await teacherService.uploadAvatar(payload.user.user_code, file.value, (p) => { uploadProgress.value = p })
        } catch (e) { console.warn('avatar upload failed', e) }
        finally { uploading.value = false }
      }
      emit('save', res)
      handleClose()
    } else {
      const userCode = form.value.user.user_code
      const up = { user: {}, profile: {} }
      if (form.value.user.user_email) up.user.user_email = form.value.user.user_email
      if (form.value.user.user_phone) up.user.user_phone = form.value.user.user_phone
      up.profile = payload.profile
      const res = await updateTeacher(userCode, up)
      if (file.value) {
        try {
          uploading.value = true
          uploadProgress.value = 0
          await teacherService.uploadAvatar(userCode, file.value, (p) => { uploadProgress.value = p })
        } catch (e) { console.warn('avatar upload failed', e) }
        finally { uploading.value = false }
      }
      emit('save', res)
      handleClose()
    }
  } catch (err) {
    console.error(err)
    // if server returns field errors try to attach
    try {
      if (err && err.errors) errors.value = err.errors
    } catch (e) {}
    toast.error(err.message || 'Lưu thất bại')
  } finally {
    saving.value = false
  }
}

// Keep user_code and teacher_code in sync for create flow - user types only once
watch(() => form.value.user.user_code, (val) => {
  // Always keep teacher_code in sync with user_code — user only types once
  if (!form.value) return
  form.value.profile.teacher_code = val || ''
})

const onPreviewError = async (ev, url) => {
  if (!url) return
  // avoid repeated attempts
  if (_blobMap.has(url)) {
    ev.target.src = _blobMap.get(url)
    return
  }
  try {
    const b = await fetchImageAsBlobUrl(url)
    if (b) {
      _blobMap.set(url, b)
      ev.target.src = b
    }
  } catch (e) {
    // hide image if fallback failed
    try { ev.target.style.display = 'none' } catch (er) {}
  }
}

onBeforeUnmount(() => {
  // cleanup created blob urls
  for (const v of _blobMap.values()) revokeBlobUrl(v)
  _blobMap.clear()
})
</script>

<style scoped>
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
  z-index: 100000 !important;
  padding: 20px;
}

.modal-container {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
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

.btn-close { background: none; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280; transition: all .2s }
.btn-close:hover { background: #f3f4f6; color: #374151 }

.modal-body { padding: 24px }
.modal-content { display: grid; grid-template-columns: 300px 1fr; gap: 28px }
.modal-side { display: flex; align-items: flex-start; justify-content: center }

.avatar-card { width: 100%; background: linear-gradient(180deg,#ffffff,#f8fafc); padding: 18px; border-radius: 10px; border: 1px solid rgba(99,102,241,0.06); display:flex; flex-direction:column; align-items:center; gap:10px }
.avatar-preview-lg img { width:160px; height:160px; object-fit:cover; border-radius:12px; border:1px solid #e6eef8; box-shadow: 0 6px 14px rgba(20,60,120,0.08) }
.avatar-placeholder-lg { width:160px; height:160px; display:flex; align-items:center; justify-content:center; color:#9aa4b2; background: linear-gradient(180deg,#f3f6fb,#f9fbff); border-radius:12px; border:1px dashed #e6eef8 }
.uploader-actions { display:flex; flex-direction:column; align-items:center; gap:6px }
.btn-upload { display:inline-flex; align-items:center; gap:8px; background:#eef2ff; color:#3730a3; padding:8px 14px; border-radius:8px; cursor:pointer; font-weight:600; border:1px solid rgba(99,102,241,0.12) }
.btn-upload input { display:none }
.muted { color: #6b7280; font-size: 12px }
.avatar-note { color: #9ca3af; font-size: 12px; text-align: center; margin-top: 4px }

.upload-progress { width: 100%; margin-top: 8px; display:flex; flex-direction:column; align-items:center; gap:6px }
.progress-line { width:100%; height:8px; background:#e5e7eb; border-radius:999px; overflow:hidden }
.progress-bar { height:100%; background: linear-gradient(90deg,#60a5fa,#06b6d4); width:0% }
.progress-label { font-size: 12px; color: #374151 }

.modal-form { min-width: 0 }
.form-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px }
.form-group label { font-weight:600; margin-bottom:6px; display:block }
.form-group input, .form-group select, .form-group textarea { width:100%; padding:8px; border:1px solid #e5e7eb; border-radius:6px }
.field-error { color: #dc2626; margin-top:6px; font-size:13px }

/* visually emphasize disabled fields so users clearly know important values are locked */
.disabled-highlight[disabled], .disabled-highlight[aria-disabled="true"], .disabled-highlight[disabled].disabled-highlight {
  background: linear-gradient(90deg, rgba(229,231,235,0.5), rgba(255,255,255,0.5));
  border-color: #cbd5e1;
  color: #374151;
  box-shadow: inset 0 0 0 1px rgba(99,102,241,0.04);
}

.modal-footer { display:flex; justify-content:flex-end; gap:8px; padding:16px 24px; border-top:1px solid #f3f4f6 }
.btn-cancel { background:#fff; border:1px solid #d1d5db; padding:8px 12px; border-radius:8px }
.btn-save { background:#3b82f6; color:#fff; padding:8px 12px; border-radius:8px; border:none }
.btn-save[disabled] { opacity:0.65; cursor:not-allowed }

.avatar-input-row{display:flex;gap:8px;align-items:center}
.btn-remove-avatar{background:#fff;border:1px solid #f3f4f6;padding:6px 10px;border-radius:6px;cursor:pointer}
</style>