<template>
  <div class="staff-stats">
    <div class="stat">
      <div class="stat-value">{{ total }}</div>
      <div class="stat-label">Tổng số giáo vụ</div>
    </div>
    <div class="stat">
      <div class="stat-value">{{ active }}</div>
      <div class="stat-label">Đang công tác</div>
    </div>
    <div class="stat">
      <div class="stat-value">{{ onBreak }}</div>
      <div class="stat-label">Tạm nghỉ</div>
    </div>
    <div class="stat">
      <div class="stat-value">{{ resigned }}</div>
      <div class="stat-label">Nghỉ việc</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StaffStats',
  props: {
    stats: {
      type: Object,
      default: () => ({ total: 0, active: 0, onBreak: 0, resigned: 0 })
    }
  },
  computed: {
    total() { return this.stats.total || 0 },
    active() { return this.stats.active || 0 },
    onBreak() { return this.stats.onBreak || 0 },
    resigned() { return this.stats.resigned || 0 }
  }
}
</script>

<style scoped>
.staff-stats { display:flex; gap:16px }
.stat { background: #fff; padding:12px 16px; border-radius:6px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); min-width:120px }
.stat-value { font-size:20px; font-weight:700 }
.stat-label { font-size:12px; color:#666 }
</style>
