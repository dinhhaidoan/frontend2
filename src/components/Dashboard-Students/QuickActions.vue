<template>
  <div class="quick-actions">
    <h3>
      <i class="fas fa-bolt"></i>
      Truy cập nhanh
    </h3>
    
    <div class="actions-grid">
      <button 
        v-for="(action, index) in actions" 
        :key="index"
        @click="navigateTo(action.route)"
        class="action-card"
        :style="{ background: action.gradient }"
      >
        <div class="action-icon">
          <i :class="action.icon"></i>
        </div>
        <div class="action-label">{{ action.label }}</div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const actions = ref([
  {
    icon: 'fas fa-graduation-cap',
    label: 'Lớp học của tôi',
    route: '/student-classes',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: 'fas fa-book-reader',
    label: 'Bài học',
    route: '/student-lessons',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: 'fas fa-tasks',
    label: 'Bài tập',
    route: '/student-assignments',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: 'fas fa-calendar-alt',
    label: 'Lịch học',
    route: '/schedule-students',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    icon: 'fas fa-robot',
    label: 'AI Học tập',
    route: '/ai-students',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    icon: 'fas fa-sticky-note',
    label: 'Ghi chú',
    route: '/notes',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  }
])

const navigateTo = (route) => {
  router.push(route)
}
</script>

<style scoped>
.quick-actions {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

.quick-actions h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.quick-actions h3 i {
  color: #f59e0b;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.action-card {
  padding: 20px;
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.action-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.action-label {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.95;
}

@media (max-width: 1024px) {
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
