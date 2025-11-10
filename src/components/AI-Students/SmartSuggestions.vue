<template>
  <div class="smart-suggestions">
    <div class="suggestions-header">
      <h3>
        <i class="fas fa-lightbulb"></i>
        Gợi ý thông minh
      </h3>
      <button @click="refreshSuggestions" class="btn-refresh">
        <i class="fas fa-sync-alt" :class="{ spinning: isRefreshing }"></i>
        Làm mới
      </button>
    </div>

    <div class="suggestions-grid">
      <!-- Priority Subjects -->
      <div class="suggestion-card priority">
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-fire"></i>
          </div>
          <div class="header-content">
            <h4>Môn học ưu tiên</h4>
            <span class="subtitle">Cần tập trung ngay</span>
          </div>
        </div>
        <div class="card-body">
          <div 
            v-for="(subject, index) in prioritySubjects" 
            :key="index"
            class="suggestion-item"
          >
            <div class="item-info">
              <div class="item-icon" :style="{ background: subject.color }">
                <i :class="subject.icon"></i>
              </div>
              <div class="item-details">
                <div class="item-name">{{ subject.name }}</div>
                <div class="item-reason">{{ subject.reason }}</div>
              </div>
            </div>
            <div class="item-action">
              <button @click="goToSubject(subject)" class="btn-action">
                Học ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Study Schedule -->
      <div class="suggestion-card schedule">
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="header-content">
            <h4>Thời gian tối ưu</h4>
            <span class="subtitle">Dựa trên thói quen của bạn</span>
          </div>
        </div>
        <div class="card-body">
          <div 
            v-for="(slot, index) in studySchedule" 
            :key="index"
            class="schedule-item"
          >
            <div class="schedule-time">
              <i class="far fa-clock"></i>
              {{ slot.time }}
            </div>
            <div class="schedule-content">
              <div class="schedule-title">{{ slot.title }}</div>
              <div class="schedule-duration">{{ slot.duration }}</div>
            </div>
            <div class="schedule-badge" :class="slot.priority">
              {{ slot.priorityLabel }}
            </div>
          </div>
        </div>
      </div>

      <!-- Review Content -->
      <div class="suggestion-card review">
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-redo"></i>
          </div>
          <div class="header-content">
            <h4>Nội dung cần ôn</h4>
            <span class="subtitle">Theo đường cong망각</span>
          </div>
        </div>
        <div class="card-body">
          <div 
            v-for="(content, index) in reviewContent" 
            :key="index"
            class="review-item"
          >
            <div class="review-header">
              <div class="review-title">{{ content.title }}</div>
              <div class="review-urgency" :class="content.urgency">
                {{ content.urgencyLabel }}
              </div>
            </div>
            <div class="review-details">
              <div class="review-subject">
                <i class="fas fa-book"></i>
                {{ content.subject }}
              </div>
              <div class="review-date">
                <i class="far fa-calendar"></i>
                Học lần cuối: {{ content.lastReview }}
              </div>
            </div>
            <div class="review-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: content.retention + '%', background: getRetentionColor(content.retention) }"
                ></div>
              </div>
              <div class="progress-label">Độ ghi nhớ: {{ content.retention }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Deadlines -->
      <div class="suggestion-card deadlines">
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="header-content">
            <h4>Deadline sắp tới</h4>
            <span class="subtitle">{{ upcomingDeadlines.length }} bài tập</span>
          </div>
        </div>
        <div class="card-body">
          <div 
            v-for="(deadline, index) in upcomingDeadlines" 
            :key="index"
            class="deadline-item"
          >
            <div class="deadline-header">
              <div class="deadline-title">{{ deadline.title }}</div>
              <div class="deadline-time" :class="deadline.status">
                <i class="far fa-clock"></i>
                {{ deadline.timeLeft }}
              </div>
            </div>
            <div class="deadline-info">
              <span class="deadline-subject">{{ deadline.subject }}</span>
              <span class="deadline-type">{{ deadline.type }}</span>
            </div>
            <div class="deadline-actions">
              <button @click="goToAssignment(deadline)" class="btn-start">
                Làm ngay
              </button>
              <button class="btn-remind">
                <i class="far fa-bell"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Insights -->
      <div class="suggestion-card insights">
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-brain"></i>
          </div>
          <div class="header-content">
            <h4>Phân tích AI</h4>
            <span class="subtitle">Dựa trên dữ liệu học tập</span>
          </div>
        </div>
        <div class="card-body">
          <div 
            v-for="(insight, index) in aiInsights" 
            :key="index"
            class="insight-item"
          >
            <div class="insight-icon" :class="insight.type">
              <i :class="insight.icon"></i>
            </div>
            <div class="insight-content">
              <div class="insight-title">{{ insight.title }}</div>
              <div class="insight-description">{{ insight.description }}</div>
              <button v-if="insight.action" @click="handleAction(insight.action)" class="insight-action">
                {{ insight.actionLabel }}
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Study Tips -->
      <div class="suggestion-card tips">
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-magic"></i>
          </div>
          <div class="header-content">
            <h4>Mẹo học tập</h4>
            <span class="subtitle">Được AI đề xuất</span>
          </div>
        </div>
        <div class="card-body">
          <div 
            v-for="(tip, index) in studyTips" 
            :key="index"
            class="tip-item"
          >
            <div class="tip-number">{{ index + 1 }}</div>
            <div class="tip-content">
              <div class="tip-title">{{ tip.title }}</div>
              <div class="tip-description">{{ tip.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isRefreshing = ref(false)

const prioritySubjects = ref([
  {
    name: 'Mobile Android',
    reason: 'Điểm thấp hơn trung bình (7.8/10)',
    icon: 'fab fa-android',
    color: 'linear-gradient(135deg, #3ddc84 0%, #07c160 100%)',
    id: 1
  },
  {
    name: 'Cơ sở dữ liệu',
    reason: 'Có bài kiểm tra tuần sau',
    icon: 'fas fa-database',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    id: 2
  },
  {
    name: 'Lập trình Web',
    reason: '2 bài tập chưa hoàn thành',
    icon: 'fas fa-code',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    id: 3
  }
])

const studySchedule = ref([
  {
    time: '19:00 - 20:30',
    title: 'Ôn tập Mobile Android',
    duration: '90 phút',
    priority: 'high',
    priorityLabel: 'Cao'
  },
  {
    time: '20:45 - 21:30',
    title: 'Làm bài tập Web',
    duration: '45 phút',
    priority: 'medium',
    priorityLabel: 'Trung bình'
  },
  {
    time: '21:30 - 22:00',
    title: 'Xem video Database',
    duration: '30 phút',
    priority: 'low',
    priorityLabel: 'Thấp'
  }
])

const reviewContent = ref([
  {
    title: 'Vue 3 Composition API',
    subject: 'Lập trình Web',
    lastReview: '5 ngày trước',
    retention: 65,
    urgency: 'medium',
    urgencyLabel: 'Nên ôn'
  },
  {
    title: 'Activity Lifecycle',
    subject: 'Mobile Android',
    lastReview: '2 tuần trước',
    retention: 40,
    urgency: 'high',
    urgencyLabel: 'Cần ôn gấp'
  },
  {
    title: 'SQL Joins',
    subject: 'Cơ sở dữ liệu',
    lastReview: '3 ngày trước',
    retention: 85,
    urgency: 'low',
    urgencyLabel: 'Tốt'
  }
])

const upcomingDeadlines = ref([
  {
    title: 'Bài tập Android - Fragments',
    subject: 'Mobile Android',
    type: 'Thực hành',
    timeLeft: '2 ngày',
    status: 'warning',
    id: 1
  },
  {
    title: 'Thiết kế giao diện Vue',
    subject: 'Lập trình Web',
    type: 'Bài tập lớn',
    timeLeft: '5 ngày',
    status: 'normal',
    id: 2
  },
  {
    title: 'Kiểm tra giữa kỳ',
    subject: 'Cơ sở dữ liệu',
    timeLeft: '1 tuần',
    type: 'Kiểm tra',
    status: 'normal',
    id: 3
  }
])

const aiInsights = ref([
  {
    type: 'success',
    icon: 'fas fa-chart-line',
    title: 'Tiến bộ vượt trội',
    description: 'Điểm Lập trình Web của bạn tăng 15% so với tháng trước. Tiếp tục phát huy!',
    action: null
  },
  {
    type: 'warning',
    icon: 'fas fa-calendar-times',
    title: 'Tỷ lệ vắng học tăng',
    description: 'Bạn đã vắng 3 buổi Mobile gần đây. Điều này có thể ảnh hưởng đến điểm số.',
    action: 'view-schedule',
    actionLabel: 'Xem lịch học'
  },
  {
    type: 'info',
    icon: 'fas fa-users',
    title: 'Gợi ý nhóm học',
    description: 'Có 4 bạn cùng lớp muốn tìm nhóm ôn Database. Tham gia nhóm để học hiệu quả hơn!',
    action: 'find-group',
    actionLabel: 'Tìm nhóm'
  }
])

const studyTips = ref([
  {
    title: 'Pomodoro Technique',
    description: 'Học 25 phút, nghỉ 5 phút. Kỹ thuật này giúp bạn tập trung tốt hơn 40%.'
  },
  {
    title: 'Ôn tập ngắt quãng',
    description: 'Ôn lại kiến thức sau 1 ngày, 3 ngày, 1 tuần để ghi nhớ lâu hơn.'
  },
  {
    title: 'Giải thích cho người khác',
    description: 'Thử giảng lại bài cho bạn bè. Đây là cách học hiệu quả nhất.'
  },
  {
    title: 'Học vào buổi tối',
    description: 'Dữ liệu cho thấy bạn tập trung tốt nhất từ 19h-22h.'
  }
])

const refreshSuggestions = () => {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
    // TODO: Fetch new suggestions from API
  }, 1000)
}

const goToSubject = (subject) => {
  router.push(`/student-lessons?subjectId=${subject.id}`)
}

const goToAssignment = (deadline) => {
  router.push(`/student-assignments?assignmentId=${deadline.id}`)
}

const handleAction = (action) => {
  if (action === 'view-schedule') {
    router.push('/student-schedule')
  } else if (action === 'find-group') {
    // TODO: Open study group modal
  }
}

const getRetentionColor = (retention) => {
  if (retention >= 70) return 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
  if (retention >= 50) return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
  return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
}
</script>

<style scoped>
.smart-suggestions {
  padding: 24px;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.suggestions-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
}

.suggestions-header h3 i {
  color: #f59e0b;
}

.btn-refresh {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-refresh:hover {
  background: #f9fafb;
  border-color: #667eea;
  color: #667eea;
}

.btn-refresh i.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.suggestion-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s;
}

.suggestion-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.card-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.suggestion-card.priority .header-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.suggestion-card.schedule .header-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.suggestion-card.review .header-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.suggestion-card.deadlines .header-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.suggestion-card.insights .header-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.suggestion-card.tips .header-icon {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
}

.header-content h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  font-size: 12px;
  color: #6b7280;
}

.card-body {
  padding: 20px;
}

/* Priority Subjects */
.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 12px;
}

.suggestion-item:last-child {
  margin-bottom: 0;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.item-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.item-details {
  flex: 1;
}

.item-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.item-reason {
  font-size: 12px;
  color: #6b7280;
}

.btn-action {
  padding: 6px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Study Schedule */
.schedule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 12px;
}

.schedule-item:last-child {
  margin-bottom: 0;
}

.schedule-time {
  font-weight: 700;
  color: #3b82f6;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
}

.schedule-content {
  flex: 1;
}

.schedule-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.schedule-duration {
  font-size: 12px;
  color: #6b7280;
}

.schedule-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.schedule-badge.high {
  background: #fee2e2;
  color: #dc2626;
}

.schedule-badge.medium {
  background: #fef3c7;
  color: #d97706;
}

.schedule-badge.low {
  background: #dbeafe;
  color: #2563eb;
}

/* Review Content */
.review-item {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 12px;
}

.review-item:last-child {
  margin-bottom: 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-title {
  font-weight: 700;
  color: #1f2937;
}

.review-urgency {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.review-urgency.high {
  background: #fee2e2;
  color: #dc2626;
}

.review-urgency.medium {
  background: #fef3c7;
  color: #d97706;
}

.review-urgency.low {
  background: #d1fae5;
  color: #059669;
}

.review-details {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #6b7280;
}

.review-subject,
.review-date {
  display: flex;
  align-items: center;
  gap: 6px;
}

.review-progress {
  margin-top: 12px;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-label {
  font-size: 12px;
  color: #6b7280;
}

/* Deadlines */
.deadline-item {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 12px;
}

.deadline-item:last-child {
  margin-bottom: 0;
}

.deadline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.deadline-title {
  font-weight: 700;
  color: #1f2937;
}

.deadline-time {
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.deadline-time.warning {
  color: #dc2626;
}

.deadline-time.normal {
  color: #6b7280;
}

.deadline-info {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
}

.deadline-subject {
  color: #3b82f6;
  font-weight: 600;
}

.deadline-type {
  color: #6b7280;
}

.deadline-actions {
  display: flex;
  gap: 8px;
}

.btn-start {
  flex: 1;
  padding: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-remind {
  width: 36px;
  height: 36px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remind:hover {
  background: #f9fafb;
  border-color: #667eea;
  color: #667eea;
}

/* AI Insights */
.insight-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 12px;
}

.insight-item:last-child {
  margin-bottom: 0;
}

.insight-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}

.insight-icon.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.insight-icon.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.insight-icon.info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.insight-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 12px;
}

.insight-action {
  padding: 6px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.insight-action:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Study Tips */
.tip-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 12px;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.tip-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
