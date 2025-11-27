<template>
  <div class="teachers-page">
    <div class="page-header">
      <h1><i class="fas fa-chalkboard-teacher"></i> Quản lý Giảng viên</h1>
      <div class="header-actions">
        <button class="btn-primary" @click="openCreate"><i class="fas fa-plus"></i> Thêm giảng viên</button>
      </div>
    </div>

    <div style="margin-bottom:12px; display:flex; gap:8px; align-items:center">
      <input v-model="q" placeholder="Tìm theo tên, mã, email..." class="search-box" @keyup.enter="search" />
      <button class="btn-primary" @click="search">Tìm</button>
    </div>

    <TeacherTable
      :teachers="teachers"
      :filteredTeachers="teachers"
      :selectedTeachers="selected"
      :currentPage="page"
      :pageSize="limit"
      @selection-change="sel => selected = sel"
      @edit="onEdit"
      @view="onView"
      @delete="confirmDelete"
      @export="exportExcel"
    />

    <TeacherModal v-if="showModal" :teacher="editing" @close="closeModal" @saved="onSaved" />

    <ConfirmDialog
      :show="showConfirm"
      title="Xác nhận xóa"
      message="Bạn có chắc muốn xóa giảng viên này?"
      confirmText="Xóa"
      cancelText="Hủy"
      :loading="deleting"
      @confirm="performDelete"
      @cancel="() => { showConfirm = false; toDelete = null }"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TeacherTable from '@/components/Teachers-Manager/TeacherTable.vue'
import TeacherModal from '@/components/Teachers-Manager/TeacherModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useTeachers } from '@/hooks/useTeachers'
import { useToast } from '@/composables/useToast'

const { teachers, fetchTeachers, createTeacher, updateTeacher, deleteTeacher } = useTeachers()
const toast = useToast()

const showModal = ref(false)
const editing = ref(null)
const selected = ref([])
const q = ref('')
const page = ref(1)
const limit = ref(20)
const showConfirm = ref(false)
const toDelete = ref(null)
const deleting = ref(false)

const load = async () => {
  try { await fetchTeachers({ page: page.value, limit: limit.value, q: q.value }) } catch (e) { console.warn(e) }
}

onMounted(load)

const openCreate = () => { editing.value = null; showModal.value = true }
const onEdit = (t) => { editing.value = t.raw || t; showModal.value = true }
const onView = (t) => { toast.info('Xem chi tiết - chức năng có thể mở modal chi tiết') }
const closeModal = () => { showModal.value = false; editing.value = null; load() }
const onSaved = (res) => { load(); toast.success('Lưu thành công') }

const confirmDelete = (t) => { toDelete.value = t; showConfirm.value = true }
const performDelete = async () => {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await deleteTeacher(toDelete.value.user_code || toDelete.value.userId || toDelete.value.user_code)
    toast.success('Xóa thành công')
    showConfirm.value = false
    toDelete.value = null
    await load()
  } catch (e) { console.error(e); toast.error('Xóa thất bại') } finally { deleting.value = false }
}

const search = () => { page.value = 1; load() }

const exportExcel = () => { toast.info('Export not implemented here — use backend / client export helper') }
</script>

<style scoped>
.teachers-page { padding: 20px }
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px }
.search-box { padding:8px 12px; border:1px solid #e5e7eb; border-radius:8px }
.btn-primary{background:#3b82f6;color:white;padding:8px 12px;border-radius:8px;border:none}
</style>
