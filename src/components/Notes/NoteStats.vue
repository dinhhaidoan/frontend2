<template>
  <div class="note-stats">
    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="fas fa-sticky-note"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.total }}</h3>
          <p>Tổng ghi chú</p>
        </div>
      </div>
      
      <div class="stat-card active">
        <div class="stat-icon">
          <i class="fas fa-edit"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.active }}</h3>
          <p>Đang hoạt động</p>
        </div>
      </div>
      
      <div class="stat-card completed">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.completed }}</h3>
          <p>Đã hoàn thành</p>
        </div>
      </div>
      
      <div class="stat-card favorites">
        <div class="stat-icon">
          <i class="fas fa-heart"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.favorites }}</h3>
          <p>Yêu thích</p>
        </div>
      </div>
      
      <div class="stat-card archived">
        <div class="stat-icon">
          <i class="fas fa-archive"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.archived }}</h3>
          <p>Đã lưu trữ</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vue 3 Composition API

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      total: 0,
      active: 0,
      completed: 0,
      favorites: 0,
      archived: 0
    })
  }
})
</script>

<style scoped>
.note-stats {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.stat-card.active .stat-icon {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
}

.stat-card.completed .stat-icon {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.stat-card.favorites .stat-icon {
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.stat-card.archived .stat-icon {
  background: linear-gradient(135deg, #6b7280, #9ca3af);
}

.stat-content h3 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1;
}

.stat-content p {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Animation */
@keyframes countUp {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.stat-content h3 {
  animation: countUp 0.6s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
  }
  
  .stat-card {
    padding: 20px 16px;
    gap: 12px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
  
  .stat-content h3 {
    font-size: 24px;
  }
  
  .stat-content p {
    font-size: 12px;
  }
}
</style>