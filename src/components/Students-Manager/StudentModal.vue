                
<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2>
          <i class="fas fa-user-graduate"></i>
          {{ isEdit ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới' }}
        </h2>
        <button @click="close" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Thông tin cơ bản -->
          <div class="form-section">
            <h3><i class="fas fa-id-card"></i> Thông tin cơ bản</h3>
            <div class="avatar-row form-grid">
              <div class="form-group avatar-preview-col">
                <div class="avatar-preview-small">
                  <img v-if="formData.avatarPreview" :src="formData.avatarPreview" :alt="formData.fullName || formData.studentCode || 'avatar'" @error="e => onPreviewError(e, formData.avatarPreview)" />
                  <img v-else :src="'/default-avatar.png'" :alt="formData.fullName || formData.studentCode || 'avatar'" />
                </div>
              </div>
              <div class="form-group avatar-actions-col">
                <label class="btn-upload">
                  <input type="file" accept="image/png,image/jpeg,image/webp" @change="onFileChange" />
                  <i class="fas fa-upload"></i>
                  Chọn ảnh
                </label>
                <button v-if="formData.avatarPreview || formData.avatarFile" type="button" @click="removeAvatar" class="btn-remove-avatar">Xóa</button>
                <small class="muted">Hỗ trợ: .jpg .png .webp — tối đa 5MB</small>
                <div v-if="props.uploading" class="upload-progress">
                  <div class="progress-line" role="progressbar" :aria-valuenow="props.uploadProgress || 0" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-bar" :style="{ width: (props.uploadProgress || 0) + '%' }"></div>
                  </div>
                  <div class="progress-label">Đang upload: {{ props.uploadProgress || 0 }}%</div>
                </div>
              </div>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label>Mã sinh viên <span class="required">*</span></label>
                <input
                  v-model="formData.studentCode"
                  type="text"
                  placeholder="VD: 2251052001"
                  required
                  :disabled="isEdit"
                />
              </div>

              <div class="form-group">
                <label>Họ và tên <span class="required">*</span></label>
                <input
                  v-model="formData.fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div class="form-group">
                <label>Ngày sinh <span class="required">*</span></label>
                <input v-model="formData.dateOfBirth" type="date" required />
              </div>

              <div class="form-group">
                <label>Giới tính <span class="required">*</span></label>
                <select v-model="formData.gender" required>
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label>Email <span class="required">*</span></label>
                <input
                  v-model="formData.email"
                  type="email"
                  placeholder="student@example.com"
                  required
                />
              </div>

              <!-- Password (only when creating account) -->
              <div v-if="!isEdit" class="form-group">
                <label>Mật khẩu <span class="required">*</span></label>
                <input v-model="formData.password" type="password" placeholder="Mật khẩu" required />
              </div>

              <div v-if="!isEdit" class="form-group">
                <label>Xác nhận mật khẩu <span class="required">*</span></label>
                <input v-model="formData.confirmPassword" type="password" placeholder="Xác nhận mật khẩu" required />
              </div>

              <div class="form-group">
                <label>Số điện thoại</label>
                <input
                  v-model="formData.phoneNumber"
                  type="tel"
                  placeholder="0123456789"
                />
              </div>

              <div class="form-group">
                <label>CCCD/CMND</label>
                <input
                  v-model="formData.identityCard"
                  type="text"
                  placeholder="001234567890"
                />
              </div>

              <div class="form-group full-width">
                <label>Địa chỉ thường trú</label>
                <textarea
                  v-model="formData.address"
                  rows="2"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Thông tin học vụ -->
          <div class="form-section">
            <h3><i class="fas fa-graduation-cap"></i> Thông tin học vụ</h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label>Ngành học <span class="required">*</span></label>
                <select v-model="formData.major" :disabled="majorsLoading" required>
                  <option value="">Chọn ngành</option>
                  <option v-for="m in majorsList" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Khóa <span class="required">*</span></label>
                <select v-model="formData.course" :disabled="yearsLoading" required>
                  <option value="">Chọn khóa</option>
                  <option v-for="y in yearsList" :key="y.id" :value="y.id">{{ y.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Lớp hành chính <span class="required">*</span></label>
                <select v-model="formData.officialClass" :disabled="classesLoading" required>
                  <option value="">{{ classesLoading ? 'Đang tải danh sách lớp...' : 'Chọn lớp' }}</option>
                  <option v-for="cls in filteredClassList" :key="cls.id" :value="cls.id">{{ cls.code || cls.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Ngày nhập học <span class="required">*</span></label>
                <input v-model="formData.enrollmentDate" type="date" required />
              </div>

              <div class="form-group">
                <label>Năm tốt nghiệp dự kiến</label>
                <input v-model="formData.expectedGraduationYear" type="date" />
              </div>
            </div>
          </div>

          <!-- Thông tin phụ huynh -->
          <div class="form-section">
            <h3><i class="fas fa-users"></i> Thông tin phụ huynh</h3>

            <div class="form-grid">
              <div class="parents-list full-width">
                <div v-for="(p, idx) in formData.parents" :key="idx" class="parent-row">
                  <div class="parent-row-grid">
                    <div class="form-group">
                      <label>Họ tên phụ huynh</label>
                      <input v-model="p.parent_name" type="text" placeholder="Họ tên bố/mẹ" />
                    </div>
                    <div class="form-group">
                      <label>Quan hệ</label>
                      <input v-model="p.parent_relationship" type="text" placeholder="Ví dụ: cha/mẹ" />
                    </div>
                    <div class="form-group">
                      <label>SĐT phụ huynh</label>
                      <input v-model="p.parent_contact" type="tel" placeholder="0123456789" />
                    </div>
                    <div class="form-group remove-parent-col">
                      <label>&nbsp;</label>
                      <button type="button" @click="removeParent(idx)" class="btn-remove-parent">Xóa</button>
                    </div>
                  </div>
                </div>

                <div class="add-parent">
                  <button type="button" class="btn-add" @click="addParent">Thêm phụ huynh</button>
                </div>
              </div>

              <div class="form-group full-width">
                <label>Ghi chú</label>
                <textarea v-model="formData.notes" rows="3" placeholder="Ghi chú về sinh viên (nếu có)"></textarea>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button type="button" @click="close" class="btn-cancel">
              <i class="fas fa-times"></i> Hủy
            </button>
            <button type="submit" class="btn-submit" :disabled="props.uploading">
              <i class="fas fa-save"></i>
              {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onBeforeUnmount } from 'vue'
import { toInputDate } from '@/utils/formatters'
import { fetchImageAsBlobUrl, revokeBlobUrl } from '@/composables/useAvatarLoader'
import { useMajors } from '@/hooks/useMajors'
import { useOfficeClasses } from '@/hooks/useOfficeClasses'
import { useAcademicYears } from '@/hooks/useAcademicYears'
import { useTeachers } from '@/hooks/useTeachers'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const props = defineProps({
  isOpen: Boolean,
  student: Object,
  uploading: { type: Boolean, default: false },
  uploadProgress: { type: Number, default: 0 }
})

const emit = defineEmits(['close', 'submit'])
const isEdit = ref(false)
const formData = reactive({
  id: '',
  studentCode: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  phoneNumber: '',
  identityCard: '',
  address: '',
  major: '',
  course: '',
  officialClass: '',
  status: 'studying',
  advisorId: '',
  enrollmentDate: '',
  expectedGraduationYear: '',
  parents: [],
  notes: ''
  ,
  avatarFile: null,
  avatarPreview: null
})

// Use hooks to load options from backend
const { majors, fetchMajors, loading: majorsLoading } = useMajors()
const { officeClasses, fetchOfficeClasses, loading: classesLoading } = useOfficeClasses()
const { academicYears, fetchAcademicYears, loading: yearsLoading } = useAcademicYears()
const { teachers, fetchTeachers, loading: teachersLoading } = useTeachers()
// Local computed lists to use in selects
const classList = computed(() => (officeClasses.value || []).map(c => ({ id: c.id, code: c.code, name: c.name, major_id: c.major_id, major: c.major || c.majorName || c.majorName || (c.Major && (c.Major.major_name || c.Major.major_id || c.Major.id)), academic_year_id: c.academic_year_id || c.course || null, course: c.course || c.academic_year_id || null, advisorId: c.advisorId || c.advisor_id || c.teacher_id || null })))
const lookupsLoading = computed(() => majorsLoading || classesLoading || yearsLoading || teachersLoading)

const filteredClassList = computed(() => {
  const list = classList.value.slice() // copy so we can safely append
  const m = formData.major
  const y = formData.course
  let result = list
  if (m || y) {
    result = list.filter(c => {
    // Major comparison: support numeric id or string code
    let majorMatch = true
    if (m) {
      const mNum = Number(m)
      if (!isNaN(mNum) && mNum !== 0) {
        majorMatch = (c.major_id !== undefined && c.major_id !== null && Number(c.major_id) === mNum) || (c.Major && (Number(c.Major.major_id) === mNum || Number(c.Major.id) === mNum))
      } else {
        majorMatch = String(c.major || c.majorName || c.code || '').toLowerCase() === String(m).toLowerCase()
      }
      // If the filtered list doesn't include the currently selected class value, try to include it
      const selectedClassId = formData.officialClass
      if (selectedClassId) {
        const has = list.find(c => Number(c.id) === Number(selectedClassId))
        if (!has) {
          // Try to add a fallback option if the selected class exists in full class list
          const fullMatch = (officeClasses.value || []).find(c => Number(c.id) === Number(selectedClassId) || Number(c.office_class_id) === Number(selectedClassId))
          if (fullMatch) {
            list.push({ id: fullMatch.id, code: fullMatch.code, name: fullMatch.name, major_id: fullMatch.major_id, academic_year_id: fullMatch.academic_year_id })
          } else {
            // Add minimal placeholder so select displays the id
            list.push({ id: selectedClassId, code: String(selectedClassId), name: `Lớp ${selectedClassId}`, major_id: null, academic_year_id: null })
          }
        }
      }
    }
    // Year/course comparison: support numeric id or string code
    let yearMatch = true
    if (y) {
      const yNum = Number(y)
      if (!isNaN(yNum) && yNum !== 0) {
        yearMatch = (c.academic_year_id !== undefined && c.academic_year_id !== null && Number(c.academic_year_id) === yNum) || (c.course && Number(c.course) === yNum)
      } else {
        yearMatch = String(c.course || c.academic_year_id || '').toLowerCase() === String(y).toLowerCase()
      }
    }
      return majorMatch && yearMatch
    })
  }
  // Add selected class to the options list if it's not included
  const selectedClassId = formData.officialClass
  if (selectedClassId) {
    const has = result.find(c => Number(c.id) === Number(selectedClassId))
    if (!has) {
      const fullMatch = (officeClasses.value || []).find(c => Number(c.id) === Number(selectedClassId) || Number(c.office_class_id) === Number(selectedClassId))
      if (fullMatch) {
        result.push({ id: fullMatch.id, code: fullMatch.code, name: fullMatch.name, major_id: fullMatch.major_id, academic_year_id: fullMatch.academic_year_id })
      } else {
        result.push({ id: selectedClassId, code: String(selectedClassId), name: `Lớp ${selectedClassId}`, major_id: null, academic_year_id: null })
      }
    }
  }
  return result
})
// advisor lock: when selected class has an advisor, lock advisor select and set advisorId
const advisorLocked = computed(() => {
  const cls = filteredClassList.value.find(c => Number(c.id) === Number(formData.officialClass))
  return !!(cls && (cls.advisorId || cls.advisor_id || cls.teacher_id))
})

const selectedClassAdvisor = computed(() => {
  const cls = filteredClassList.value.find(c => Number(c.id) === Number(formData.officialClass))
  return cls ? (cls.advisorId || cls.advisor_id || cls.teacher_id || null) : null
})

const selectedClassAdvisorName = computed(() => {
  const id = selectedClassAdvisor.value
  if (!id) return null
  const adv = advisorList.value.find(a => Number(a.id) === Number(id))
  return adv ? adv.name : null
})
const advisorList = computed(() => (teachers.value || []).map(t => ({ id: t.id || t.teacherId, name: t.name || t.teacher_name })))
const majorsList = computed(() => (majors.value || []).map(m => ({ id: m.major_id || m.id, name: m.major_name || m.name })))
const yearsList = computed(() => (academicYears.value || []).map(y => ({ id: y.academic_year_id || y.id, name: y.academic_year_name || y.name, code: y.code || null })))

const resetForm = () => {
  formData.id = ''
  Object.keys(formData).forEach((key) => {
    if (key === 'status') {
      formData[key] = 'studying'
    } else if (key !== 'id') {
      formData[key] = ''
    }
  })
  // Ensure parents is always an array after reset
  formData.parents = []
  formData.avatarFile = null
  formData.avatarPreview = null
}

// helper: use `toInputDate` from utils to normalize date strings for type=date inputs

const addParent = () => {
  formData.parents.push({ parent_name: '', parent_relationship: '', parent_contact: '' })
}

const onFileChange = (e) => {
  const f = e.target.files && e.target.files[0]
  if (!f) return
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(f.type)) {
    alert('Chỉ chấp nhận định dạng: jpg, png, webp')
    return
  }
  const maxBytes = 5 * 1024 * 1024
  if (f.size > maxBytes) {
    alert('File quá lớn (tối đa 5MB)')
    return
  }
  // revoke previous preview blob if present
  if (formData.avatarPreview && typeof formData.avatarPreview === 'string' && formData.avatarPreview.startsWith('blob:')) {
    try { URL.revokeObjectURL(formData.avatarPreview) } catch (e) {}
  }
  formData.avatarFile = f
  formData.avatarPreview = URL.createObjectURL(f)
}

const removeAvatar = () => {
  formData.avatarFile = null
  if (formData.avatarPreview && typeof formData.avatarPreview === 'string' && formData.avatarPreview.startsWith('blob:')) {
    try { URL.revokeObjectURL(formData.avatarPreview) } catch (e) {}
  }
  formData.avatarPreview = null
}

const onPreviewError = async (ev, url) => {
  if (!url) return
  try {
    const b = await fetchImageAsBlobUrl(url)
    if (b) ev.target.src = b
  } catch (e) {
    try { ev.target.style.display = 'none' } catch (err) {}
  }
}

onBeforeUnmount(() => {
  if (formData.avatarPreview && typeof formData.avatarPreview === 'string' && formData.avatarPreview.startsWith('blob:')) {
    try { URL.revokeObjectURL(formData.avatarPreview) } catch (e) {}
  }
})

const removeParent = (idx) => {
  if (!Number.isFinite(idx)) return
  formData.parents.splice(idx, 1)
}

watch(
  () => props.student,
  (newStudent) => {
    if (newStudent) {
      isEdit.value = true
      formData.id = newStudent.id || newStudent.student_id || newStudent.raw?.id || null
      // Normalize incoming shape to our formData - prefer numeric IDs
      formData.studentCode = newStudent.studentCode || newStudent.userCode || newStudent.student_code || newStudent.user_code || ''
      formData.fullName = newStudent.fullName || newStudent.student_name || newStudent.user_fullname || ''
      formData.dateOfBirth = toInputDate(newStudent.dateOfBirth || newStudent.student_birthdate || '')
      formData.gender = newStudent.gender || newStudent.student_gender || ''
      formData.email = newStudent.email || newStudent.user_email || ''
      formData.phoneNumber = newStudent.phoneNumber || newStudent.user_phone || ''
      formData.identityCard = newStudent.identityCard || newStudent.student_CCCD || ''
      formData.address = newStudent.address || newStudent.student_address || ''
      // major: prefer incoming numeric id fields (majorId, major_id, Major.major_id) - fallback to name
      formData.major = newStudent.majorId || newStudent.major || newStudent.major_id || (newStudent.Major && (newStudent.Major.major_id || newStudent.Major.id)) || (newStudent.major && (newStudent.major.major_id || newStudent.major.id)) || ''
      formData.major = formData.major === '' ? '' : Number(formData.major)
      // course / academic year
      formData.course = newStudent.courseId || newStudent.course || newStudent.academic_year_id || (newStudent.AcademicYear && (newStudent.AcademicYear.academic_year_id || newStudent.AcademicYear.id)) || ''
      formData.course = formData.course === '' ? '' : Number(formData.course)
      // officialClass: try numeric id first
      formData.officialClass = newStudent.officialClassId || newStudent.office_class_id || newStudent.officialClass || newStudent.officeClassId || ''
      formData.officialClass = formData.officialClass === '' ? '' : Number(formData.officialClass)
      // If we received a class name/code instead of ID, try to resolve it to ID using officeClasses
      if (!formData.officialClass && newStudent.officialClass && officeClasses.value && officeClasses.value.length) {
        const found = officeClasses.value.find(c => String(c.code || c.name || c.id).toLowerCase() === String(newStudent.officialClass).toLowerCase())
        if (found) formData.officialClass = Number(found.id)
      }
      formData.status = newStudent.status || (newStudent.student_active ? 'studying' : newStudent.status) || 'studying'
      formData.advisorId = newStudent.advisorId || newStudent.advisor_id || (newStudent.advisor && (newStudent.advisor.id || newStudent.advisor.teacher_id || newStudent.advisor.user_id)) || ''
      formData.advisorId = formData.advisorId === '' ? '' : Number(formData.advisorId)
      formData.enrollmentDate = toInputDate(newStudent.enrollmentDate || newStudent.student_day_joined || '')
      formData.expectedGraduationYear = toInputDate(newStudent.expectedGraduationYear || newStudent.student_year_expected || '')
      // If backend provides parents as array, pick the first one for single-parent UI
      // Map array of parents into formData.parents; harmonize various server shapes
      const parentsRaw = newStudent.parents || newStudent.ParentStudents || newStudent.parent_students || []
      if (Array.isArray(parentsRaw) && parentsRaw.length) {
        formData.parents = parentsRaw.map(p => ({
          parent_name: p.parent_name || p.name || p.parentName || '',
          parent_relationship: p.parent_relationship || p.relationship || p.parent_relationship || '',
          parent_contact: p.parent_contact || p.contact || p.parent_phone || p.phone || ''
        }))
      } else {
        // If only single parent fields exist, keep backward compatibility
        const firstParent = (newStudent.parentName || newStudent.parent_name || newStudent.parent_contact || newStudent.parentPhone || null)
        if (newStudent.parentName || newStudent.parent_name || newStudent.parent_contact || newStudent.parentPhone) {
          formData.parents = [{ parent_name: newStudent.parentName || newStudent.parent_name || '', parent_contact: newStudent.parentPhone || newStudent.parent_contact || '', parent_relationship: '' }]
        } else {
          formData.parents = []
        }
      }
      formData.notes = newStudent.notes || ''
      formData.avatarPreview = newStudent.user_avatar || newStudent.avatar || newStudent.user_avatar || (newStudent.user && newStudent.user.user_avatar) || (newStudent.raw && (newStudent.raw.user_avatar || newStudent.raw.avatar)) || null
    } else {
      isEdit.value = false
      resetForm()
    }
  },
  { immediate: true }
)

// When modal opens, fetch lookup data - use allSettled so one failure doesn't prevent the others
watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      try {
        const results = await Promise.allSettled([
          fetchMajors(),
          fetchOfficeClasses({ page: 1, limit: 200 }),
          fetchAcademicYears({ page: 1, limit: 100 }),
          fetchTeachers({ page: 1, limit: 500 })
        ])
        // Log results for debugging
        console.debug('[StudentModal] fetch lookup results:', results.map(r => ({ status: r.status, value: r.status === 'fulfilled' ? (r.value && r.value.length ? r.value.length : r.value) : (r.reason && r.reason.message) })))
        // If office classes result is rejected, still try fetching office classes alone
        const officeClassesResult = results[1]
        if (officeClassesResult && officeClassesResult.status === 'rejected') {
          try {
            await fetchOfficeClasses({ page: 1, limit: 200 })
          } catch (err) {
            console.error('[StudentModal] retry fetchOfficeClasses failed:', err)
          }
        }
      } catch (err) {
        // General catch - not expected because we use allSettled
        console.error('[StudentModal] fetch lookup error:', err)
      }
    }
  },
  { immediate: true }
)

// Auto-fill email when student code entered (only if email is empty)
watch(
  () => formData.studentCode,
  (newCode, oldCode) => {
    if (!newCode) return

    // 1. Nếu email đang trống, điền luôn
    if (!formData.email) {
      formData.email = `${newCode}@gmail.com`
      return
    }

    // 2. Nếu email hiện tại đang giống với format tự sinh từ mã cũ, thì cập nhật theo mã mới
    // Ví dụ: mã cũ là "S", email là "S@gmail.com" -> Cập nhật thành "SV001@gmail.com"
    // Nếu người dùng đã sửa tay thành "myemail@yahoo.com", dòng này sẽ bỏ qua không ghi đè.
    const oldAutoEmail = `${oldCode || ''}@gmail.com`
    if (formData.email === oldAutoEmail) {
      formData.email = `${newCode}@gmail.com`
    }
  }
)

// If official class has an advisor, auto-assign and lock advisor select
watch(
  () => formData.officialClass,
  (clsId) => {
    if (!clsId) return
    const adv = selectedClassAdvisor.value
    if (adv) {
      formData.advisorId = Number(adv)
    } else {
      // If selected class has no advisor, clear previous advisor selection
      formData.advisorId = ''
    }
  }
)

// If major or course changes and selected officialClass no longer in filtered list, clear it
watch([
  () => formData.major,
  () => formData.course
], ([newMajor, newCourse]) => {
  const cls = filteredClassList.value.find(c => Number(c.id) === Number(formData.officialClass))
  if (!cls) {
    formData.officialClass = ''
    // Remove advisor assignment only if it was set by class
    if (advisorLocked.value) formData.advisorId = ''
  }
})

// Debug: log when officeClasses changes so we can see if fetch returned data
watch(officeClasses, (val) => {
  console.debug('[StudentModal] officeClasses updated:', (val || []).length ? (val.length + ' items') : '0 items')
})

watch(filteredClassList, (val) => {
  console.debug('[StudentModal] filteredClassList:', (val || []).length, 'major=', formData.major, 'course=', formData.course)
})

const handleSubmit = () => {
  // Validate password match
  if (!isEdit.value && formData.password) {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!') // Dùng toast thay alert
      return
    }
  }
  
  // Validate parents
  if (formData.parents && Array.isArray(formData.parents)) {
    for (const p of formData.parents) {
      if (!p.parent_name || !p.parent_relationship) {
        toast.warning('Vui lòng cung cấp họ tên và quan hệ cho tất cả phụ huynh') // Dùng toast thay alert
        return
      }
    }
  }
  
  emit('submit', { 
    ...formData, 
    parents: formData.parents && formData.parents.length 
      ? formData.parents.map(p => ({ 
          parent_name: p.parent_name, 
          parent_relationship: p.parent_relationship, 
          parent_contact: p.parent_contact 
        })) 
      : undefined, 
    avatarFile: formData.avatarFile 
  })
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
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
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
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
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

.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ecf0f1;
  font-size: 1.1rem;
}

.form-section h3 i {
  color: #667eea;
  margin-right: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
/* Avatar preview small */
.avatar-row { margin-bottom: 12px; align-items: center; }
.avatar-preview-small img { width: 96px; height: 96px; object-fit: cover; border-radius: 8px; border: 1px solid #e6eef8 }
.avatar-placeholder-lg { width: 96px; height: 96px; display:flex; align-items:center; justify-content:center; color:#9aa4b2; background: linear-gradient(180deg,#f3f6fb,#f9fbff); border-radius:8px; border:1px dashed #e6eef8 }
.avatar-actions-col .btn-upload { display:inline-flex; align-items:center; gap:8px; background:#eef2ff; color:#3730a3; padding:8px 14px; border-radius:8px; cursor:pointer; font-weight:600; border:1px solid rgba(99,102,241,0.12) }
.avatar-actions-col .btn-upload input { display:none }
.btn-remove-avatar{background:#fff;border:1px solid #f3f4f6;padding:6px 10px;border-radius:6px;cursor:pointer;margin-left:8px}

.form-group {
  display: flex;
  flex-direction: column;
}

.class-advisor-note {
  font-size: 0.9rem;
  color: #374151;
  margin-top: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #34495e;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.required {
  color: #e74c3c;
  margin-left: 4px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 2px solid #f0f0f0;
  margin-top: 20px;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-cancel {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-cancel:hover {
  background: #bdc3c7;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}
</style>
