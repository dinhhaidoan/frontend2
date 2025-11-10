<template>
  <div class="teacher-stats">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-chalkboard-teacher"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.total }}</h3>
          <p>Tổng giảng viên</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon active">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.active }}</h3>
          <p>Đang giảng dạy</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon break">
          <i class="fas fa-user-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.onBreak }}</h3>
          <p>Tạm nghỉ</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon inactive">
          <i class="fas fa-user-times"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.resigned }}</h3>
          <p>Nghỉ việc</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon subjects">
          <i class="fas fa-book-open"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.totalSubjects }}</h3>
          <p>Tổng môn giảng dạy</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon classes">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.totalClasses }}</h3>
          <p>Tổng lớp phụ trách</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeacherStats',
  props: {
    statistics: {
      type: Object,
      default: () => ({
        total: 0,
        active: 0,
        onBreak: 0,
        resigned: 0,
        totalSubjects: 0,
        totalClasses: 0
      })
    }
  }
}
</script>

<style scoped>
.teacher-stats {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  background: #6366f1;
}

.stat-icon.active {
  background: #10b981;
}

.stat-icon.break {
  background: #f59e0b;
}

.stat-icon.inactive {
  background: #ef4444;
}

.stat-icon.subjects {
  background: #8b5cf6;
}

.stat-icon.classes {
  background: #06b6d4;
}

.stat-content h3 {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.stat-content p {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}
</style>