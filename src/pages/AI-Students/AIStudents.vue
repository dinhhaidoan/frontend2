<template>
  <div class="ai-students-page">
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-robot"></i>
          AI Học tập
        </h1>
        <p class="header-subtitle">
          Trợ lý AI thông minh giúp bạn học tập hiệu quả hơn
        </p>
      </div>
      <div class="header-stats">
        <div class="stat-chip">
          <i class="fas fa-comments"></i>
          <span>{{ chatCount }} cuộc hội thoại</span>
        </div>
        <div class="stat-chip">
          <i class="fas fa-lightbulb"></i>
          <span>{{ suggestionCount }} gợi ý hôm nay</span>
        </div>
        <div class="stat-chip">
          <i class="fas fa-chart-line"></i>
          <span>Tiến bộ +{{ progressIncrease }}%</span>
        </div>
      </div>
    </div>

    <div class="tab-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <div class="tab-content">
      <transition name="fade" mode="out-in">
        <div v-if="activeTab === 'chat'" key="chat" class="content-section">
          <div class="section-intro">
            <h2>Trợ lý AI Chat</h2>
            <p>Hỏi đáp với AI về bài học, nhận giải thích chi tiết và gợi ý học tập</p>
          </div>
          <AIChatBox />
        </div>

        <div v-else-if="activeTab === 'suggestions'" key="suggestions" class="content-section">
          <div class="section-intro">
            <h2>Gợi ý thông minh</h2>
            <p>AI phân tích dữ liệu học tập và đề xuất lịch trình, nội dung phù hợp nhất</p>
          </div>
          <SmartSuggestions />
        </div>

        <div v-else-if="activeTab === 'analytics'" key="analytics" class="content-section">
          <div class="section-intro">
            <h2>Phân tích năng lực</h2>
            <p>Biểu đồ chi tiết về kỹ năng, tiến độ và thói quen học tập của bạn</p>
          </div>
          <LearningAnalytics />
        </div>

        <div v-else-if="activeTab === 'settings'" key="settings" class="content-section">
          <div class="section-intro">
            <h2>Cá nhân hóa</h2>
            <p>Tùy chỉnh trải nghiệm AI theo phong cách và mục tiêu của bạn</p>
          </div>
          <PersonalizationSettings />
        </div>
      </transition>
    </div>

    <!-- Quick Action Floating Button -->
    <div class="floating-actions">
      <button 
        @click="showQuickChat = !showQuickChat" 
        class="fab-main"
        :class="{ active: showQuickChat }"
      >
        <i :class="showQuickChat ? 'fas fa-times' : 'fas fa-robot'"></i>
      </button>
      
      <transition name="fab">
        <div v-if="showQuickChat" class="quick-chat-panel">
          <div class="quick-chat-header">
            <h4>Hỏi nhanh AI</h4>
            <button @click="showQuickChat = false" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="quick-chat-body">
            <div class="quick-questions">
              <button 
                v-for="(question, index) in quickQuestions" 
                :key="index"
                @click="askQuickQuestion(question)"
                class="quick-question"
              >
                <i :class="question.icon"></i>
                {{ question.text }}
              </button>
            </div>
            <div class="quick-input">
              <input 
                v-model="quickQuestion"
                @keypress.enter="askQuickQuestion({ text: quickQuestion })"
                type="text" 
                placeholder="Hoặc nhập câu hỏi..."
                class="quick-input-field"
              />
              <button 
                @click="askQuickQuestion({ text: quickQuestion })"
                class="quick-send-btn"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- AI Tips Banner -->
    <transition name="slide-up">
      <div v-if="showTipBanner" class="ai-tip-banner">
        <div class="tip-icon">
          <i class="fas fa-lightbulb"></i>
        </div>
        <div class="tip-content">
          <div class="tip-title">💡 Mẹo hôm nay</div>
          <div class="tip-text">{{ dailyTip }}</div>
        </div>
        <button @click="showTipBanner = false" class="tip-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AIChatBox from '@/components/AI-Students/AIChatBox.vue'
import SmartSuggestions from '@/components/AI-Students/SmartSuggestions.vue'
import LearningAnalytics from '@/components/AI-Students/LearningAnalytics.vue'
import PersonalizationSettings from '@/components/AI-Students/PersonalizationSettings.vue'

const router = useRouter()
const activeTab = ref('chat')
const showQuickChat = ref(false)
const showTipBanner = ref(true)
const quickQuestion = ref('')

const chatCount = ref(42)
const suggestionCount = ref(8)
const progressIncrease = ref(12)

const tabs = [
  {
    id: 'chat',
    label: 'Chat AI',
    icon: 'fas fa-comments',
    badge: null
  },
  {
    id: 'suggestions',
    label: 'Gợi ý thông minh',
    icon: 'fas fa-lightbulb',
    badge: '8'
  },
  {
    id: 'analytics',
    label: 'Phân tích năng lực',
    icon: 'fas fa-chart-bar',
    badge: null
  },
  {
    id: 'settings',
    label: 'Cá nhân hóa',
    icon: 'fas fa-sliders-h',
    badge: null
  }
]

const quickQuestions = [
  {
    icon: 'fas fa-question-circle',
    text: 'Giải thích Composition API'
  },
  {
    icon: 'fas fa-calendar',
    text: 'Lịch học tuần này'
  },
  {
    icon: 'fas fa-chart-line',
    text: 'Điểm số của tôi'
  },
  {
    icon: 'fas fa-tasks',
    text: 'Bài tập chưa làm'
  }
]

const dailyTip = ref(
  'Học 25 phút, nghỉ 5 phút (Pomodoro) giúp bạn tập trung tốt hơn 40%. Hãy thử ngay hôm nay!'
)

const askQuickQuestion = (question) => {
  if (!question.text.trim()) return
  
  // Switch to chat tab and pass the question
  activeTab.value = 'chat'
  showQuickChat.value = false
  quickQuestion.value = ''
  
  // TODO: Emit event to AIChatBox component to send the question
  console.log('Quick question:', question.text)
}

onMounted(() => {
  // Check URL params for direct tab access
  const tabParam = router.currentRoute.value.query.tab
  if (tabParam && tabs.some(t => t.id === tabParam)) {
    activeTab.value = tabParam
  }

  // Dismiss tip banner after 10 seconds
  setTimeout(() => {
    showTipBanner.value = false
  }, 10000)
})
</script>

<style scoped>
.ai-students-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-content h1 i {
  color: #667eea;
  font-size: 36px;
}

.header-subtitle {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
}

.header-stats {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.stat-chip {
  padding: 8px 16px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  font-weight: 600;
}

.stat-chip i {
  color: #667eea;
}

.tab-navigation {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: white;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow-x: auto;
}

.tab-btn {
  flex: 1;
  min-width: 180px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
}

.tab-btn:hover {
  background: #f9fafb;
  color: #667eea;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.tab-btn i {
  font-size: 16px;
}

.tab-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-btn.active .tab-badge {
  background: white;
  color: #667eea;
}

.tab-content {
  min-height: 600px;
}

.content-section {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-intro {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.section-intro h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
}

.section-intro p {
  margin: 0;
  font-size: 15px;
  opacity: 0.9;
}

.floating-actions {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
}

.fab-main {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-main:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
}

.fab-main.active {
  background: #ef4444;
}

.quick-chat-panel {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 360px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.quick-chat-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-chat-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.quick-chat-body {
  padding: 16px;
}

.quick-questions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.quick-question {
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.quick-question:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.quick-question i {
  color: inherit;
  opacity: 0.7;
}

.quick-input {
  display: flex;
  gap: 8px;
}

.quick-input-field {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.quick-input-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.quick-send-btn {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-send-btn:hover {
  transform: scale(1.05);
}

.ai-tip-banner {
  position: fixed;
  bottom: 32px;
  left: 32px;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  gap: 16px;
  padding: 16px;
  z-index: 999;
}

.tip-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
  font-size: 14px;
}

.tip-text {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.tip-close {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.tip-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s;
}

.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

@media (max-width: 768px) {
  .ai-students-page {
    padding: 16px;
  }

  .header-content h1 {
    font-size: 24px;
  }

  .header-content h1 i {
    font-size: 28px;
  }

  .tab-navigation {
    overflow-x: auto;
  }

  .tab-btn {
    min-width: 140px;
    font-size: 13px;
  }

  .quick-chat-panel {
    width: calc(100vw - 64px);
  }

  .ai-tip-banner {
    left: 16px;
    right: 16px;
    max-width: none;
  }

  .floating-actions {
    bottom: 24px;
    right: 24px;
  }
}
</style>
