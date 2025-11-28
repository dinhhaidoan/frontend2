<template>
  <div class="overview-page">
    <!-- Admin Dashboard -->
    <AdminOverview v-if="currentRole === 'admin'" />
    
    <!-- Default Dashboard for other roles -->
    <div v-else>
      <div class="page-header">
        <div class="page-title">
          <h1>Tổng quan</h1>
          <p>Chào mừng bạn trở lại StudyHub!</p>
        </div>
      </div>
    
    <div class="overview-content">
      <!-- Main content -->
      <div class="welcome-section">
        <div class="welcome-card">
          <div class="card-icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="card-content">
            <h3>Bắt đầu học tập</h3>
            <p>Khám phá các khóa học mới và tiếp tục hành trình học tập của bạn.</p>
            <button class="cta-button">
              <span>Khám phá ngay</span>
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-book"></i>
          </div>
          <div class="stat-content">
            <h4>Khóa học đang theo dõi</h4>
            <span class="stat-number">5</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <div class="stat-content">
            <h4>Bài tập đã hoàn thành</h4>
            <span class="stat-number">23</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h4>Thời gian học hôm nay</h4>
            <span class="stat-number">2.5h</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-content">
            <h4>Điểm trung bình</h4>
            <span class="stat-number">8.7</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import AdminOverview from './AdminOverview.vue'
import { useUserRole } from '@/composables/useUserRole'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const { currentRole } = useUserRole()
const router = useRouter()

// Redirect admin to dedicated admin dashboard
onMounted(() => {
  if (currentRole.value === 'admin') {
    router.replace('/admin-dashboard')
  }
})
</script>

<style scoped>
.overview-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-title h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #1f2937, #3b82f6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-title p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.overview-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Welcome Section */
.welcome-section {
  margin-bottom: 32px;
}

.welcome-card {
  display: flex;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.welcome-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.05), transparent);
  pointer-events: none;
}

.welcome-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.08);
}

.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24px;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
}

.card-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent);
}

.card-icon i {
  font-size: 32px;
  color: white;
  position: relative;
  z-index: 2;
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}

.card-content {
  flex: 1;
  position: relative;
  z-index: 2;
}

.card-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.card-content p {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.cta-button:active {
  transform: translateY(0);
}

.cta-button i {
  transition: transform 0.3s ease;
}

.cta-button:hover i {
  transform: translateX(2px);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 20px;
  color: white;
}

.stat-content h4 {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .overview-page {
    padding: 16px;
  }
  
  .page-title h1 {
    font-size: 24px;
  }
  
  .welcome-card {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
  
  .card-icon {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 20px;
  }
}
</style>