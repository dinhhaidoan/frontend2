<template>
  <div class="dashboard-students">
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1>Xin chào, {{ studentName }}! 👋</h1>
        <p>{{ welcomeMessage }}</p>
      </div>
      <div class="current-time">
        <i class="far fa-clock"></i>
        <span>{{ currentTime }}</span>
      </div>
    </div>

    <!-- Quick Stats Row -->
    <QuickStats />

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Left Column -->
      <div class="left-column">
        <TodaySchedule />
        <QuickActions />
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <UpcomingDeadlines />
        <RecentNotifications />
      </div>
    </div>

    <!-- Motivational Quote Banner -->
    <div class="motivation-banner">
      <div class="quote-icon">
        <i class="fas fa-quote-left"></i>
      </div>
      <div class="quote-content">
        <p class="quote-text">"{{ motivationalQuote.text }}"</p>
        <p class="quote-author">— {{ motivationalQuote.author }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import QuickStats from '@/components/Dashboard-Students/QuickStats.vue'
import TodaySchedule from '@/components/Dashboard-Students/TodaySchedule.vue'
import UpcomingDeadlines from '@/components/Dashboard-Students/UpcomingDeadlines.vue'
import RecentNotifications from '@/components/Dashboard-Students/RecentNotifications.vue'
import QuickActions from '@/components/Dashboard-Students/QuickActions.vue'

const studentName = ref('Nguyễn Văn Sinh Viên')
const currentTime = ref('')
let timeInterval = null

const welcomeMessage = ref(getWelcomeMessage())

const motivationalQuote = ref({
  text: 'Thành công không phải là chìa khóa của hạnh phúc. Hạnh phúc mới là chìa khóa của thành công. Nếu bạn yêu thích công việc của mình, bạn sẽ thành công.',
  author: 'Albert Schweitzer'
})

function getWelcomeMessage() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Chúc bạn một ngày học tập hiệu quả! 🌅'
  if (hour < 18) return 'Chúc bạn buổi chiều năng động! ☀️'
  return 'Chúc bạn buổi tối vui vẻ! 🌙'
}

function updateTime() {
  const now = new Date()
  currentTime.value = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(now)
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // Random quote on mount
  const quotes = [
    {
      text: 'Thành công không phải là chìa khóa của hạnh phúc. Hạnh phúc mới là chìa khóa của thành công.',
      author: 'Albert Schweitzer'
    },
    {
      text: 'Học tập không phải là việc ghi nhớ, mà là hiểu và áp dụng.',
      author: 'Richard Feynman'
    },
    {
      text: 'Đầu tư vào kiến thức luôn mang lại lợi nhuận tốt nhất.',
      author: 'Benjamin Franklin'
    },
    {
      text: 'Giáo dục là vũ khí mạnh nhất bạn có thể sử dụng để thay đổi thế giới.',
      author: 'Nelson Mandela'
    },
    {
      text: 'Chìa khóa thành công là tập trung vào mục tiêu, không phải trở ngại.',
      author: 'Unknown'
    }
  ]
  motivationalQuote.value = quotes[Math.floor(Math.random() * quotes.length)]
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.dashboard-students {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.welcome-section h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
}

.welcome-section p {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
}

.current-time {
  padding: 12px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.current-time i {
  color: #667eea;
  font-size: 16px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  margin-bottom: 24px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.motivation-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  display: flex;
  gap: 24px;
  align-items: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.quote-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.quote-content {
  flex: 1;
}

.quote-text {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.6;
  font-style: italic;
}

.quote-author {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .right-column {
    grid-template-columns: repeat(2, 1fr);
    display: grid;
  }
}

@media (max-width: 768px) {
  .dashboard-students {
    padding: 16px;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 16px;
  }

  .welcome-section h1 {
    font-size: 24px;
  }

  .current-time {
    width: 100%;
    justify-content: center;
  }

  .right-column {
    grid-template-columns: 1fr;
  }

  .motivation-banner {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }

  .quote-text {
    font-size: 16px;
  }
}
</style>
