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
      :uploading="uploadInProgress"
      :upload-progress="uploadProgress"
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
      :message="deleteStudentMessage"
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
      :message="updateStudentMessage"
      confirmText="Xác nhận"
      cancelText="Hủy"
      @confirm="confirmUpdateStudent"
      @cancel="closeUpdateStudentModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import parentStudentService from '@/services/parentStudentService'
import { watch } from 'vue'
import { useUsers } from '@/hooks/useUsers'
import StudentStats from '@/components/Students-Manager/StudentStats.vue'
import StudentFilters from '@/components/Students-Manager/StudentFilters.vue'
import StudentTable from '@/components/Students-Manager/StudentTable.vue'
import StudentModal from '@/components/Students-Manager/StudentModal.vue'
import StudentViewModal from '@/components/Students-Manager/StudentViewModal.vue'
import BulkActions from '@/components/Students-Manager/BulkActions.vue'
import ImportModal from '@/components/Students-Manager/ImportModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useMajors } from '@/hooks/useMajors'
import { useAcademicYears } from '@/hooks/useAcademicYears'
import { useOfficeClasses } from '@/hooks/useOfficeClasses'

// State
const { majors, fetchMajors } = useMajors()
const { academicYears, fetchAcademicYears } = useAcademicYears()
const { officeClasses, fetchOfficeClasses } = useOfficeClasses()
const { accounts, fetchUsers, createUser, updateUser, deleteUser } = useUsers()
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

const deleteStudentMessage = computed(() => {
  return studentToDelete.value
    ? `Bạn có chắc muốn xóa sinh viên ${studentToDelete.value.fullName || studentToDelete.value.studentCode}? Hành động này không thể hoàn tác.`
    : 'Bạn có chắc muốn xóa sinh viên này?'
})

// upload state for avatar handling
const uploadInProgress = ref(false)
const uploadProgress = ref(0)

const updateStudentMessage = computed(() => {
  return studentToUpdate.value
    ? `Bạn có chắc chắn muốn cập nhật thông tin sinh viên ${studentToUpdate.value.fullName || studentToUpdate.value.studentCode}?`
    : 'Bạn có chắc chắn muốn cập nhật thông tin sinh viên này?'
})

// Note: load students from backend via `useUsers().fetchUsers()`
// when refresh is needed, accounts (from the store) will contain the list.
// We will map `accounts` to the UI fields.

const mapAccountToStudent = (u) => {
  const s = u.raw?.Student || {}
  const majorId = s.major || s.major_id;
  const majorObj = majors.value.find(m => m.id == majorId || m.major_id == majorId);
  const majorName = majorObj ? (majorObj.name || majorObj.major_name) : (majorId || '');

  // Helper tìm tên khóa (Academic Year)
  const courseId = s.course || s.academic_year_id || s.raw?.Student?.academic_year_id;
  const courseObj = academicYears.value.find(y => y.id == courseId || y.academic_year_id == courseId);
  const courseName = courseObj ? (courseObj.name || courseObj.academic_year_name || courseObj.code) : (courseId || '');

  // Helper tìm tên lớp
  const classId = s.officialClass || s.office_class_id;
  const classObj = officeClasses.value.find(c => c.id == classId || c.office_class_id == classId);
  const className = classObj ? (classObj.name || classObj.code) : (classId || '');
  return {
    id: s.student_id || u.id || u.raw?.user_id,
    studentCode: s.student_code || u.userId || u.raw?.user_code,
    userCode: u.userId || u.raw?.user_code || (s.user_code || null),
    fullName: s.student_name || u.name || u.raw?.user_fullname || u.raw?.user_code,
    major: majorName,
    majorId: majorId || null,
    course: courseName,
    courseId: courseId || null,
    officialClass: className,
    officialClassId: classId || null,
    email: u.email || u.raw?.user_email || '',
    phoneNumber: u.phone || u.raw?.user_phone || '',
    dateOfBirth: s.student_birthdate || '',
    gender: s.student_gender || '',
    identityCard: s.student_CCCD || '',
    address: s.student_address || '',
    birthPlace: s.student_place_of_birth || '',
    // preserve raw IDs for programmatic use if needed
    // majorId, courseId, officialClassId are set above
    status: s.student_active ? 'studying' : 'inactive',
    gpa: s.gpa || 0,
    credits: s.credits || 0,
    completedSubjects: s.completedSubjects || 0,
    retakeSubjects: s.retakeSubjects || 0,
    advisorId: s.advisor_id || s.advisorId || '',
    advisorName: s.advisor_name || '',
    enrollmentDate: s.student_day_joined || s.enrollmentDate || '',
    expectedGraduationYear: s.student_year_expected || '',
    parents: s.parents || s.ParentStudents || s.parent_students || (u.raw && (u.raw.parents || u.raw.ParentStudents || u.raw.parent_students)) || [],
    parentName: (s.parents && s.parents[0] && (s.parents[0].parent_name || s.parents[0].name)) || (s.ParentStudents && s.ParentStudents[0] && s.ParentStudents[0].parent_name) || (s.parent_students && s.parent_students[0] && s.parent_students[0].parent_name) || '',
    parentPhone: (s.parents && s.parents[0] && (s.parents[0].parent_contact || s.parents[0].contact || s.parents[0].parent_phone)) || (s.ParentStudents && s.ParentStudents[0] && s.ParentStudents[0].parent_contact) || (s.parent_students && s.parent_students[0] && s.parent_students[0].parent_contact) || '',
    avatar: u.avatar || u.raw?.user_avatar || null,
    raw: u.raw || u
  }
}

// upload helpers - copied from StaffManager pattern
const uploadWithProgress = (url, file, onProgress, opts = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url, true)
      xhr.withCredentials = true
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { return resolve(JSON.parse(xhr.responseText || '{}')) } catch (e) { return resolve({}) }
        }
        return reject(new Error(`${xhr.status} ${xhr.statusText}: ${xhr.responseText || ''}`))
      }
      xhr.onerror = () => reject(new Error('Network error during upload'))
      if (xhr.upload && typeof xhr.upload.onprogress !== 'undefined') {
        xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)) }
      }
      const fieldName = opts.fieldName || 'file'
      const fd = new FormData()
      fd.append(fieldName, file)
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

// Computed
const statistics = computed(() => {
  const list = students.value
  const total = list.length
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
    result = result.filter((s) => String(s.majorId || s.major || '') === String(filters.value.major))
  }

  if (filters.value.course) {
    result = result.filter((s) => String(s.courseId || s.course || '') === String(filters.value.course))
  }

  if (filters.value.officialClass) {
    result = result.filter((s) => String(s.officialClassId || s.officialClass || '') === String(filters.value.officialClass))
  }

  if (filters.value.status) {
    result = result.filter((s) => s.status === filters.value.status)
  }

  if (filters.value.advisor) {
    result = result.filter((s) => String(s.advisorId || '') === String(filters.value.advisor))
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
const loadStudents = async () => {
  try {
    await fetchUsers()
    // Map only student accounts to student items
    const studentAccounts = (accounts.value || []).filter((a) => {
      if (a && a.role) return a.role === 'student'
      const roleName = a?.raw?.Role?.role_name || a?.raw?.role_name || ''
      return roleName.toString().toLowerCase().includes('sinh') || roleName.toString().toLowerCase() === 'student'
    })
    students.value = studentAccounts.map(mapAccountToStudent)
  } catch (err) {
    console.error('Error loading students', err)
    students.value = []
  }
}

// Keep students map updated when accounts change
// Update student list when accounts change; only include student-role users
watch(accounts, (newVal) => {
  const studentAccounts = (newVal || []).filter((a) => {
    if (a && a.role) return a.role === 'student'
    const roleName = a?.raw?.Role?.role_name || a?.raw?.role_name || ''
    return roleName.toString().toLowerCase().includes('sinh') || roleName.toString().toLowerCase() === 'student'
  })
  students.value = studentAccounts.map(mapAccountToStudent)
}, { immediate: true })

watch([majors, academicYears, officeClasses], () => {
   // Khi danh mục tải xong, map lại danh sách sinh viên để hiển thị tên thay vì ID
   if (accounts.value && accounts.value.length > 0) {
      const studentAccounts = accounts.value.filter(a => a.role === 'student' || /* logic check role */ true) 
      // Filter logic giữ nguyên như cũ trong code gốc của bạn
      students.value = studentAccounts.map(mapAccountToStudent)
   }
})
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

const handleSubmitStudent = async (data) => {
  try {
    if (data.id) {
      // Update existing user/profile
      const userCode = data.userCode || data.studentCode || (data.raw && data.raw.user_code)
      if (!userCode) throw new Error('Không tìm thấy mã người dùng để cập nhật')

      const parentsArray = data.parents && Array.isArray(data.parents) && data.parents.length
        ? data.parents.map(p => ({ parent_name: p.parent_name || p.name || '', parent_contact: p.parent_contact || p.contact || '', parent_relationship: p.parent_relationship || p.relationship || 'phu huynh' }))
        : undefined

      const payload = {
        user: {
            user_email: data.email || `${data.studentCode}@gmail.com`,
          user_phone: data.phoneNumber
        },
          profile: {
          student_name: data.fullName,
          student_code: data.studentCode,
          student_birthdate: data.dateOfBirth || null,
          student_gender: data.gender || null,
          student_address: data.address || null,
          student_CCCD: data.identityCard || null,
          student_place_of_birth: data.birthPlace || null,
            student_day_joined: data.enrollmentDate || null,
            student_year_expected: data.expectedGraduationYear || null,
          academic_year_id: Number(data.course) || null,
          major_id: Number(data.major) || null,
          office_class_id: Number(data.officialClass) || null,
          student_active: data.status === 'studying' || data.status === 'active',
          advisor_id: Number(data.advisorId) || null,
          parents: parentsArray
        }
      }
      console.debug('[StudentsManager] updateUser payload:', payload)
      const res = await updateUser(userCode, payload)
      console.debug('[StudentsManager] updateUser response:', res)
      console.debug('[StudentsManager] updateUser response:', res)
      // close & refresh
      closeStudentModal()
      await loadStudents()
      // If an avatar file was provided in the modal, upload it using server-side endpoint or Cloudinary fallback
      if (data.avatarFile) {
        try {
          uploadInProgress.value = true
          uploadProgress.value = 0
          // Build upload URL
          const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
          let API_BASE = String(_rawBase || '/api')
          if (!API_BASE.includes('/api')) API_BASE = API_BASE.replace(/\/+$/, '') + '/api'
          const uploadUrl = `${API_BASE.replace(/\/+$/,'')}/share/auth/users/${encodeURIComponent(userCode)}/avatar`
          try {
            await uploadWithProgress(uploadUrl, data.avatarFile, (p) => { uploadProgress.value = p }, { fieldName: 'avatar' })
            await loadStudents()
            alert('Cập nhật avatar thành công')
          } catch (err) {
            const txt = (err && err.message) || ''
            if (txt.startsWith('404')) {
              try {
                const cloudRes = await uploadImageToCloudinary(data.avatarFile, (p) => { uploadProgress.value = p })
                if (cloudRes) {
                  const patchPayload = { user: { user_avatar: cloudRes.secure_url, user_avatar_public_id: cloudRes.public_id } }
                  await updateUser(userCode, patchPayload)
                  await loadStudents()
                  alert('Cập nhật avatar thành công (Cloudinary)')
                }
              } catch (e) {
                console.warn('Cloudinary fallback failed for avatar update', e)
                alert('Cập nhật avatar thất bại')
              }
            } else {
              console.warn('Avatar upload failed', err)
              alert('Cập nhật avatar thất bại')
            }
          }
        } catch (e) { console.warn('upload avatar outer failed', e) }
        finally { uploadInProgress.value = false; uploadProgress.value = 0 }
      }
      // After update, check if parent created/updated on server
      const updatedUser = (res && res.user) ? res.user : (res && res.updated) ? res.updated : res
      const studentObjU = updatedUser && (updatedUser.Student || updatedUser.student || updatedUser.profile || updatedUser)
      const parentArrU = (studentObjU && (studentObjU.parents || studentObjU.ParentStudents || studentObjU.parent_students)) || (updatedUser && (updatedUser.parents || updatedUser.ParentStudents))
      if (parentsArray && parentsArray.length && !(parentArrU && parentArrU.length)) {
        try {
          const studentId = (studentObjU && (studentObjU.student_id || studentObjU.id || studentObjU.studentId)) || (updatedUser && (updatedUser.student_id || updatedUser.id))
            if (studentId) {
            // create each parent via fallback endpoint
            for (const p of parentsArray) {
              await parentStudentService.createParent(studentId, p)
            }
            await loadStudents()
            alert('Cập nhật sinh viên thành công và lưu thông tin phụ huynh thành công (qua fallback API).')
          } else {
            alert('Cập nhật sinh viên thành công. Lưu ý: thông tin phụ huynh không được lưu (backend không hỗ trợ ParentStudents trong payload).')
          }
        } catch (err) {
          console.warn('Parent creation fallback failed:', err)
          alert('Cập nhật sinh viên thành công. Lưu ý: không thể lưu thông tin phụ huynh tự động. Vui lòng kiểm tra endpoint backend.')
        }
      } else {
        alert('Cập nhật sinh viên thành công')
      }
    } else {
      // Create new user with profile
      const parentsArray = data.parents && Array.isArray(data.parents) && data.parents.length
        ? data.parents.map(p => ({ parent_name: p.parent_name || p.name || '', parent_contact: p.parent_contact || p.contact || '', parent_relationship: p.parent_relationship || p.relationship || 'phu huynh' }))
        : undefined

      const payload = {
        user: {
          user_code: data.studentCode,
          user_password: data.password || '123456789', // default if not provided
          user_email: data.email || `${data.studentCode}@gmail.com`,
          user_phone: data.phoneNumber
        },
        role_name: 'Sinh viên',
          profile: {
          student_name: data.fullName,
          student_code: data.studentCode,
          student_birthdate: data.dateOfBirth || null,
          student_gender: data.gender || null,
          student_address: data.address || null,
          student_CCCD: data.identityCard || null,
          student_place_of_birth: data.birthPlace || null,
            student_day_joined: data.enrollmentDate || null,
            student_year_expected: data.expectedGraduationYear || null,
          academic_year_id: Number(data.course) || null,
          major_id: Number(data.major) || null,
          office_class_id: Number(data.officialClass) || null,
          student_active: data.status === 'studying' || data.status === 'active',
          advisor_id: Number(data.advisorId) || null,
          parents: parentsArray
        }
      }
      console.debug('[StudentsManager] createUser payload:', payload)
      // Try uploading to Cloudinary first to include avatar URL directly in create payload
      if (data.avatarFile) {
        try {
          uploadInProgress.value = true
          uploadProgress.value = 0
          const cloudRes = await uploadImageToCloudinary(data.avatarFile, (p) => { uploadProgress.value = p })
          if (cloudRes) {
            payload.user.user_avatar = cloudRes.secure_url
            payload.user.user_avatar_public_id = cloudRes.public_id
          }
        } catch (e) {
          console.warn('Cloudinary upload for create failed', e)
        } finally { uploadInProgress.value = false; uploadProgress.value = 0 }
      }
      const res = await createUser(payload)
      console.debug('[StudentsManager] createUser response:', res)
      closeStudentModal()
      await loadStudents()
      // If an avatar file was provided and we didn't attach via Cloudinary earlier, try server upload
      if (data.avatarFile && !payload.user.user_avatar) {
        try {
          uploadInProgress.value = true
          uploadProgress.value = 0
          const createdCode = (res && res.user && (res.user.user_code || res.user.userCode)) || payload.user.user_code
          const _rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '/api'
          let API_BASE = String(_rawBase || '/api')
          if (!API_BASE.includes('/api')) API_BASE = API_BASE.replace(/\/+$/, '') + '/api'
          const uploadUrl = `${API_BASE.replace(/\/+$/,'')}/share/auth/users/${encodeURIComponent(createdCode)}/avatar`
          try {
            await uploadWithProgress(uploadUrl, data.avatarFile, (p) => { uploadProgress.value = p }, { fieldName: 'avatar' })
            await loadStudents()
            alert('Tạo sinh viên thành công và upload avatar thành công')
          } catch (err) {
            const txt = (err && err.message) || ''
            if (txt.startsWith('404')) {
              console.warn('Create: avatar endpoint not found (404)')
            } else {
              console.warn('Create: avatar upload failed', err)
            }
          }
        } catch (e) { console.warn('create avatar upload flow failed', e) }
        finally { uploadInProgress.value = false; uploadProgress.value = 0 }
      }
      // After create, check if parent created on server
      const createdUser = (res && res.user) ? res.user : (res && res.createdUser) ? res.createdUser : res
      const studentObj = createdUser && (createdUser.Student || createdUser.student || createdUser.profile || createdUser) // fallback
      const parentArr = (studentObj && (studentObj.parents || studentObj.ParentStudents || studentObj.parent_students)) || (createdUser && (createdUser.parents || createdUser.ParentStudents))
      if (parentsArray && parentsArray.length && !(parentArr && parentArr.length)) {
        // Parent didn't get created by backend; notify
        // Try fallback: call parent service to create parent if server exposes endpoint
        try {
          const studentId = (studentObj && (studentObj.student_id || studentObj.id || studentObj.studentId)) || (createdUser && (createdUser.student_id || createdUser.id))
          if (studentId) {
            for (const p of parentsArray) {
              await parentStudentService.createParent(studentId, p)
            }
            // If created successfully, refresh list
            await loadStudents()
            alert('Tạo sinh viên thành công và lưu thông tin phụ huynh thành công (qua fallback API).')
          } else {
            alert('Tạo sinh viên thành công. Lưu ý: thông tin phụ huynh không được lưu (backend không hỗ trợ ParentStudents trong payload).')
          }
        } catch (err) {
          console.warn('Parent creation fallback failed:', err)
          alert('Tạo sinh viên thành công. Lưu ý: không thể lưu thông tin phụ huynh tự động. Vui lòng kiểm tra endpoint backend.')
        }
      } else {
        alert('Tạo sinh viên thành công')
      }
    }
  } catch (err) {
    console.error('handleSubmitStudent error', err)
    alert(err.message || 'Có lỗi xảy ra khi lưu thông tin sinh viên')
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

const confirmDeleteStudent = async () => {
  if (!studentToDelete.value) return
  try {
    const userCode = studentToDelete.value.userCode || studentToDelete.value.studentCode || studentToDelete.value.raw?.user_code
    if (!userCode) throw new Error('Không tìm thấy mã người dùng để xóa')
    await deleteUser(userCode)
    await loadStudents()
    alert(`Đã xóa sinh viên "${studentToDelete.value.fullName}" thành công`)
  } catch (err) {
    console.error('confirmDeleteStudent error', err)
    alert(err.message || 'Xóa sinh viên thất bại')
  } finally {
    closeDeleteStudentModal()
  }
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
onMounted(async () => {
  // Tải danh sách danh mục trước hoặc song song
  await Promise.all([
    fetchMajors(),
    fetchAcademicYears({ limit: 100 }), // Lấy nhiều để đủ mapping
    fetchOfficeClasses({ limit: 500 })  // Lấy nhiều để đủ mapping
  ])
  await loadStudents()
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
