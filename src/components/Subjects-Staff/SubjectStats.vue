<template>
  <div class="subject-stats">
    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="fas fa-book"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.total }}</h3>
          <p>Tổng môn học</p>
        </div>
      </div>
      
      <div class="stat-card active">
        <div class="stat-icon">
          <i class="fas fa-play-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.active }}</h3>
          <p>Đang hoạt động</p>
        </div>
      </div>
      
      <div class="stat-card teacher">
        <div class="stat-icon">
          <i class="fas fa-chalkboard-teacher"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.withTeacher }}</h3>
          <p>Đã có giáo viên</p>
        </div>
      </div>
      
      <div class="stat-card room">
        <div class="stat-icon">
          <i class="fas fa-door-open"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.withRoom }}</h3>
          <p>Đã có phòng học</p>
        </div>
      </div>
      
      <div class="stat-card registration">
        <div class="stat-icon">
          <i class="fas fa-user-plus"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.registrationOpen }}</h3>
          <p>Mở đăng ký</p>
        </div>
      </div>
      
      <div class="stat-card students">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.registered }}</h3>
          <p>Sinh viên đăng ký</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SubjectStats',
  props: {
    stats: {
      type: Object,
      default: () => ({
        total: 0,
        active: 0,
        withTeacher: 0,
        withRoom: 0,
        registrationOpen: 0,
        registered: 0
      })
    }
  }
}
</script>

<style scoped>
.subject-stats {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid transparent;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.total {
  border-left-color: #3b82f6;
}

.stat-card.active {
  border-left-color: #10b981;
}

.stat-card.teacher {
  border-left-color: #f59e0b;
}

.stat-card.room {
  border-left-color: #8b5cf6;
}

.stat-card.registration {
  border-left-color: #06b6d4;
}

.stat-card.students {
  border-left-color: #ef4444;
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

.total .stat-icon {
  background: #3b82f6;
}

.active .stat-icon {
  background: #10b981;
}

.teacher .stat-icon {
  background: #f59e0b;
}

.room .stat-icon {
  background: #8b5cf6;
}

.registration .stat-icon {
  background: #06b6d4;
}

.students .stat-icon {
  background: #ef4444;
}

.stat-content h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.stat-content p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
    gap: 12px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .stat-content h3 {
    font-size: 20px;
  }
  
  .stat-content p {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>