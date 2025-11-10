<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon student">
        <i class="fas fa-user-graduate"></i>
      </div>
      <div class="stat-content">
        <h3>{{ stats.students }}</h3>
        <p>Sinh viên</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon teacher">
        <i class="fas fa-chalkboard-teacher"></i>
      </div>
      <div class="stat-content">
        <h3>{{ stats.teachers }}</h3>
        <p>Giảng viên</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon staff">
        <i class="fas fa-user-tie"></i>
      </div>
      <div class="stat-content">
        <h3>{{ stats.staff }}</h3>
        <p>Giáo vụ</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon active">
        <i class="fas fa-user-check"></i>
      </div>
      <div class="stat-content">
        <h3>{{ stats.active }}</h3>
        <p>Đang hoạt động</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vue compiler macros - no import needed

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      students: 0,
      teachers: 0,
      staff: 0,
      active: 0
    })
  }
})
</script>

<style scoped>
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
</style>