<template>
  <div class="weekly-list-view">
    <div class="list-controls">
      <label>Chọn ngày</label>
      <select v-model="selectedDay" @change="onDayChange">
        <option value="all">Tất cả các ngày</option>
        <option v-for="day in days" :key="day.dayOfWeek" :value="day.dayOfWeek">{{ day.name }}</option>
      </select>
    </div>

    <div v-if="filteredSchedules.length === 0" class="empty-list">
      <p>Không có lịch cho lựa chọn hiện tại.</p>
    </div>

    <table v-else class="schedule-table">
      <thead>
        <tr>
          <th>Ngày</th>
          <th>Giờ</th>
          <th>Môn</th>
          <th>Phòng</th>
          <th>Giảng viên</th>
          <th>Loại</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in filteredSchedules" :key="s.id">
          <td>{{ getDayName(s.dayOfWeek) }}</td>
          <td>{{ getTimeText(s) }}</td>
          <td>{{ s.subjectName || s.subjectCode }}</td>
          <td>{{ s.roomName || '-' }}</td>
          <td>{{ s.teacherName || '-' }}</td>
          <td>{{ s.scheduleType === 'exam' ? 'Thi' : 'Học' }}</td>
          <td>{{ (s.status || '').toString() }}</td>
          <td class="actions">
            <button class="action-btn" title="Xem chi tiết" @click="$emit('view:details', s)"><i class="fas fa-eye"></i></button>
            <button class="action-btn" title="Sửa" @click.stop="$emit('edit:schedule', s)"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete" title="Xóa" @click.stop="$emit('delete:schedule', s)"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUserRole } from '@/composables/useUserRole'

const props = defineProps({
  schedules: { type: Array, default: () => [] },
  days: { type: Array, default: () => [] },
  timeSlots: { type: Array, default: () => [] }
})

const emit = defineEmits(['edit:schedule', 'delete:schedule', 'view:details', 'export'])

const { currentRole } = useUserRole()

const selectedDay = ref('all')

const allSchedules = computed(() => props.schedules || [])

const filteredSchedules = computed(() => {
  let rows = allSchedules.value
  if (selectedDay.value !== 'all') {
    const d = Number(selectedDay.value)
    rows = rows.filter(s => s.dayOfWeek === d)
  }
  // Sort by date/time or timeSlot
  rows = rows.slice().sort((a, b) => {
    if (a.date && b.date) {
      return new Date(a.date) - new Date(b.date)
    }
    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime)
    }
    if (a.timeSlot && b.timeSlot) {
      return Number(a.timeSlot) - Number(b.timeSlot)
    }
    return 0
  })
  return rows
})

const onDayChange = () => {
  // nothing — computed updates automatically
}

const getDayName = (value) => {
  const d = props.days?.find(x => x.dayOfWeek === value)
  if (d) return d.name
  // fallback names
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  return days[(value === 0 ? 6 : value - 1) % 7] || value
}

const getTimeText = (s) => {
  if (s.isParentOnly) return 'Chưa xếp lịch'
  if (s.timeSlot) return s.timeSlot
  if (s.startTime && s.endTime) return `${s.startTime} - ${s.endTime}`
  return '-'
}
</script>

<style scoped>
.weekly-list-view { padding: 12px }
.list-controls { display:flex; gap:12px; align-items:center; margin-bottom:12px }
.view-actions { margin-left:auto }
.schedule-table { width:100%; border-collapse:collapse; background:white }
.schedule-table th, .schedule-table td { padding:8px 10px; border-bottom:1px solid #eee; text-align:left; font-size:13px }
.schedule-table thead th { background:#f8fafc; font-weight:600 }
.actions { display:flex; gap:6px }
.action-btn { background:#e5e7eb; border:none; padding:6px; border-radius:6px; cursor:pointer }
.action-btn.delete { background:#fee2e2 }
.empty-list { background:#fafafa; padding:12px; border-radius:8px }
</style>
