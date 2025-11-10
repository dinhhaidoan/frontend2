<template>
  <div class="upcoming-deadlines">
    <div class="deadlines-header">
      <h3>
        <i class="fas fa-exclamation-circle"></i>
        Deadline sắp tới
      </h3>
      <button @click="viewAll" class="btn-view-all">
        Xem tất cả
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>

    <div v-if="deadlines.length === 0" class="no-deadlines">
      <i class="fas fa-check-circle"></i>
      <p>Tuyệt vời! Không có deadline gần</p>
    </div>

    <div v-else class="deadlines-list">
      <div 
        v-for="(deadline, index) in deadlines" 
        :key="index"
        class="deadline-item"
        :class="deadline.urgency"
      >
        <div class="deadline-icon" :class="deadline.type">
          <i :class="deadline.icon"></i>
        </div>
        <div class="deadline-content">
          <div class="deadline-title">{{ deadline.title }}</div>
          <div class="deadline-meta">
            <span class="subject">{{ deadline.subject }}</span>
            <span class="separator">•</span>
            <span class="type">{{ deadline.typeLabel }}</span>
          </div>
        </div>
        <div class="deadline-time" :class="deadline.urgency">
          <i class="far fa-clock"></i>
          <span>{{ deadline.timeLeft }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const deadlines = ref([
  {
    title: 'Bài tập Android - Fragments & Navigation',
    subject: 'Mobile Android',
    type: 'assignment',
    typeLabel: 'Bài tập',
    icon: 'fas fa-file-alt',
    timeLeft: '2 ngày',
    urgency: 'urgent'
  },
  {
    title: 'Kiểm tra giữa kỳ',
    subject: 'Cơ sở dữ liệu',
    type: 'exam',
    typeLabel: 'Kiểm tra',
    icon: 'fas fa-clipboard-check',
    timeLeft: '5 ngày',
    urgency: 'warning'
  },
  {
    title: 'Đồ án cuối kỳ - Thiết kế website',
    subject: 'Lập trình Web',
    type: 'project',
    typeLabel: 'Đồ án',
    icon: 'fas fa-project-diagram',
    timeLeft: '1 tuần',
    urgency: 'normal'
  },
  {
    title: 'Bài tập nhóm - Phân tích hệ thống',
    subject: 'Phân tích thiết kế',
    type: 'group',
    typeLabel: 'Nhóm',
    icon: 'fas fa-users',
    timeLeft: '10 ngày',
    urgency: 'normal'
  }
])

const viewAll = () => {
  router.push('/student-assignments')
}
</script>

<style scoped>
.upcoming-deadlines {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

.deadlines-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.deadlines-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.deadlines-header h3 i {
  color: #f59e0b;
}

.btn-view-all {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-view-all:hover {
  background: #f9fafb;
  border-color: #667eea;
  color: #667eea;
}

.no-deadlines {
  text-align: center;
  padding: 40px 20px;
}

.no-deadlines i {
  font-size: 48px;
  color: #10b981;
  margin-bottom: 16px;
}

.no-deadlines p {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
}

.deadlines-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.deadline-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: #f9fafb;
  border-left: 4px solid #e5e7eb;
  transition: all 0.3s;
}

.deadline-item:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.deadline-item.urgent {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.deadline-item.warning {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.deadline-item.normal {
  border-left-color: #3b82f6;
}

.deadline-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  flex-shrink: 0;
}

.deadline-icon.assignment {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.deadline-icon.exam {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.deadline-icon.project {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.deadline-icon.group {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.deadline-content {
  flex: 1;
}

.deadline-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.deadline-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.subject {
  font-weight: 600;
  color: #667eea;
}

.separator {
  opacity: 0.5;
}

.deadline-time {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.deadline-time.urgent {
  background: #fee2e2;
  color: #dc2626;
}

.deadline-time.warning {
  background: #fef3c7;
  color: #d97706;
}

.deadline-time.normal {
  background: #dbeafe;
  color: #2563eb;
}

.deadline-time i {
  font-size: 12px;
}

@media (max-width: 768px) {
  .deadline-item {
    flex-wrap: wrap;
  }

  .deadline-time {
    width: 100%;
    justify-content: center;
  }
}
</style>
