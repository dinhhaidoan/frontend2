<template>
  <div class="personalization-settings">
    <div class="settings-header">
      <h3>
        <i class="fas fa-sliders-h"></i>
        Cá nhân hóa trải nghiệm
      </h3>
      <button @click="saveSettings" class="btn-save">
        <i class="fas fa-save"></i>
        Lưu cài đặt
      </button>
    </div>

    <div class="settings-grid">
      <!-- Learning Goals -->
      <div class="settings-card">
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-bullseye"></i>
          </div>
          <div class="header-content">
            <h4>Mục tiêu học tập</h4>
            <span class="subtitle">Đặt mục tiêu để AI hỗ trợ tốt hơn</span>
          </div>
        </div>
        <div class="card-body">
          <div class="goal-item">
            <label class="goal-label">
              <i class="fas fa-trophy"></i>
              Mục tiêu điểm trung bình
            </label>
            <div class="slider-container">
              <input 
                v-model="settings.goals.targetGPA" 
                type="range" 
                min="5" 
                max="10" 
                step="0.1"
                class="slider"
              />
              <span class="slider-value">{{ settings.goals.targetGPA.toFixed(1) }}/10</span>
            </div>
          </div>

          <div class="goal-item">
            <label class="goal-label">
              <i class="fas fa-clock"></i>
              Thời gian học mỗi tuần
            </label>
            <div class="slider-container">
              <input 
                v-model="settings.goals.weeklyHours" 
                type="range" 
                min="5" 
                max="40" 
                step="1"
                class="slider"
              />
              <span class="slider-value">{{ settings.goals.weeklyHours }} giờ</span>
            </div>
          </div>

          <div class="goal-item">
            <label class="goal-label">
              <i class="fas fa-fire"></i>
              Chuỗi ngày học liên tục
            </label>
            <div class="slider-container">
              <input 
                v-model="settings.goals.streakTarget" 
                type="range" 
                min="7" 
                max="365" 
                step="7"
                class="slider"
              />
              <span class="slider-value">{{ settings.goals.streakTarget }} ngày</span>
            </div>
          </div>

          <div class="priority-subjects">
            <label class="goal-label">
              <i class="fas fa-star"></i>
              Môn học ưu tiên
            </label>
            <div class="subjects-checkboxes">
              <label 
                v-for="subject in availableSubjects" 
                :key="subject.id"
                class="checkbox-label"
              >
                <input 
                  v-model="settings.goals.prioritySubjects" 
                  type="checkbox" 
                  :value="subject.id"
                />
                <span class="checkbox-custom"></span>
                <span class="subject-name">{{ subject.name }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Study Reminders -->
      <div class="settings-card">
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-bell"></i>
          </div>
          <div class="header-content">
            <h4>Nhắc nhở học tập</h4>
            <span class="subtitle">Cấu hình thông báo thông minh</span>
          </div>
        </div>
        <div class="card-body">
          <div class="reminder-toggle">
            <div class="toggle-info">
              <div class="toggle-title">
                <i class="fas fa-bell-on"></i>
                Bật nhắc nhở
              </div>
              <div class="toggle-desc">Nhận thông báo về bài tập, lịch học</div>
            </div>
            <label class="switch">
              <input v-model="settings.reminders.enabled" type="checkbox" />
              <span class="switch-slider"></span>
            </label>
          </div>

          <div v-if="settings.reminders.enabled" class="reminder-options">
            <div class="reminder-item">
              <label class="reminder-label">
                <input 
                  v-model="settings.reminders.types" 
                  type="checkbox" 
                  value="assignment"
                />
                <span class="checkbox-custom"></span>
                <div class="reminder-info">
                  <div class="reminder-title">Bài tập sắp hết hạn</div>
                  <div class="reminder-desc">Nhắc trước 1 ngày</div>
                </div>
              </label>
            </div>

            <div class="reminder-item">
              <label class="reminder-label">
                <input 
                  v-model="settings.reminders.types" 
                  type="checkbox" 
                  value="class"
                />
                <span class="checkbox-custom"></span>
                <div class="reminder-info">
                  <div class="reminder-title">Lịch học sắp tới</div>
                  <div class="reminder-desc">Nhắc trước 30 phút</div>
                </div>
              </label>
            </div>

            <div class="reminder-item">
              <label class="reminder-label">
                <input 
                  v-model="settings.reminders.types" 
                  type="checkbox" 
                  value="review"
                />
                <span class="checkbox-custom"></span>
                <div class="reminder-info">
                  <div class="reminder-title">Ôn tập kiến thức cũ</div>
                  <div class="reminder-desc">Dựa trên đường cong망각</div>
                </div>
              </label>
            </div>

            <div class="reminder-item">
              <label class="reminder-label">
                <input 
                  v-model="settings.reminders.types" 
                  type="checkbox" 
                  value="streak"
                />
                <span class="checkbox-custom"></span>
                <div class="reminder-info">
                  <div class="reminder-title">Duy trì chuỗi ngày học</div>
                  <div class="reminder-desc">Nhắc nếu chưa học trong ngày</div>
                </div>
              </label>
            </div>

            <div class="time-picker">
              <label class="goal-label">
                <i class="far fa-clock"></i>
                Thời gian nhắc nhở mặc định
              </label>
              <input 
                v-model="settings.reminders.defaultTime" 
                type="time" 
                class="time-input"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Learning Style -->
      <div class="settings-card">
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="header-content">
            <h4>Phong cách học tập</h4>
            <span class="subtitle">AI sẽ điều chỉnh nội dung phù hợp</span>
          </div>
        </div>
        <div class="card-body">
          <div class="learning-style-grid">
            <label 
              v-for="style in learningStyles" 
              :key="style.value"
              :class="['style-card', { active: settings.learningStyle === style.value }]"
              @click="settings.learningStyle = style.value"
            >
              <input 
                v-model="settings.learningStyle" 
                type="radio" 
                :value="style.value"
                hidden
              />
              <div class="style-icon">
                <i :class="style.icon"></i>
              </div>
              <div class="style-name">{{ style.name }}</div>
              <div class="style-desc">{{ style.description }}</div>
            </label>
          </div>

          <div class="difficulty-preference">
            <label class="goal-label">
              <i class="fas fa-layer-group"></i>
              Độ khó nội dung ưa thích
            </label>
            <div class="difficulty-buttons">
              <button 
                v-for="level in difficultyLevels" 
                :key="level.value"
                @click="settings.difficulty = level.value"
                :class="['difficulty-btn', level.value, { active: settings.difficulty === level.value }]"
              >
                <i :class="level.icon"></i>
                {{ level.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Tutor Personality -->
      <div class="settings-card">
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-robot"></i>
          </div>
          <div class="header-content">
            <h4>Tính cách AI Tutor</h4>
            <span class="subtitle">Chọn phong cách tương tác</span>
          </div>
        </div>
        <div class="card-body">
          <div class="tutor-personalities">
            <label 
              v-for="personality in tutorPersonalities" 
              :key="personality.value"
              :class="['personality-card', { active: settings.tutorPersonality === personality.value }]"
            >
              <input 
                v-model="settings.tutorPersonality" 
                type="radio" 
                :value="personality.value"
                hidden
              />
              <div class="personality-header">
                <div class="personality-icon" :style="{ background: personality.color }">
                  <i :class="personality.icon"></i>
                </div>
                <div class="personality-name">{{ personality.name }}</div>
              </div>
              <div class="personality-desc">{{ personality.description }}</div>
              <div class="personality-sample">"{{ personality.sample }}"</div>
            </label>
          </div>
        </div>
      </div>

      <!-- Study Preferences -->
      <div class="settings-card">
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-cog"></i>
          </div>
          <div class="header-content">
            <h4>Tùy chọn khác</h4>
            <span class="subtitle">Cấu hình bổ sung</span>
          </div>
        </div>
        <div class="card-body">
          <div class="preference-toggle">
            <div class="toggle-info">
              <div class="toggle-title">
                <i class="fas fa-magic"></i>
                Gợi ý nội dung tự động
              </div>
              <div class="toggle-desc">AI tự động đề xuất bài học tiếp theo</div>
            </div>
            <label class="switch">
              <input v-model="settings.preferences.autoSuggest" type="checkbox" />
              <span class="switch-slider"></span>
            </label>
          </div>

          <div class="preference-toggle">
            <div class="toggle-info">
              <div class="toggle-title">
                <i class="fas fa-users"></i>
                Chia sẻ tiến độ với bạn bè
              </div>
              <div class="toggle-desc">Cho phép bạn bè xem thành tích của bạn</div>
            </div>
            <label class="switch">
              <input v-model="settings.preferences.shareProgress" type="checkbox" />
              <span class="switch-slider"></span>
            </label>
          </div>

          <div class="preference-toggle">
            <div class="toggle-info">
              <div class="toggle-title">
                <i class="fas fa-chart-line"></i>
                Phân tích học tập nâng cao
              </div>
              <div class="toggle-desc">Nhận báo cáo chi tiết mỗi tuần</div>
            </div>
            <label class="switch">
              <input v-model="settings.preferences.detailedAnalytics" type="checkbox" />
              <span class="switch-slider"></span>
            </label>
          </div>

          <div class="preference-toggle">
            <div class="toggle-info">
              <div class="toggle-title">
                <i class="fas fa-gamepad"></i>
                Chế độ gamification
              </div>
              <div class="toggle-desc">Kiếm điểm, huy hiệu khi học tập</div>
            </div>
            <label class="switch">
              <input v-model="settings.preferences.gamification" type="checkbox" />
              <span class="switch-slider"></span>
            </label>
          </div>

          <div class="language-select">
            <label class="goal-label">
              <i class="fas fa-language"></i>
              Ngôn ngữ AI
            </label>
            <select v-model="settings.preferences.language" class="select-input">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="vi-formal">Tiếng Việt (Trang trọng)</option>
              <option value="vi-casual">Tiếng Việt (Thân mật)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Reset & Export -->
      <div class="settings-card">
        <div class="card-header">
          <div class="header-icon">
            <i class="fas fa-database"></i>
          </div>
          <div class="header-content">
            <h4>Quản lý dữ liệu</h4>
            <span class="subtitle">Sao lưu và khôi phục</span>
          </div>
        </div>
        <div class="card-body">
          <div class="data-actions">
            <button @click="exportSettings" class="data-btn export">
              <i class="fas fa-download"></i>
              <div class="btn-content">
                <div class="btn-title">Xuất cài đặt</div>
                <div class="btn-desc">Tải file JSON</div>
              </div>
            </button>

            <button @click="importSettings" class="data-btn import">
              <i class="fas fa-upload"></i>
              <div class="btn-content">
                <div class="btn-title">Nhập cài đặt</div>
                <div class="btn-desc">Từ file JSON</div>
              </div>
            </button>

            <button @click="resetSettings" class="data-btn reset">
              <i class="fas fa-undo"></i>
              <div class="btn-content">
                <div class="btn-title">Đặt lại mặc định</div>
                <div class="btn-desc">Xóa tất cả cài đặt</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Toast -->
    <transition name="toast">
      <div v-if="showToast" class="save-toast">
        <i class="fas fa-check-circle"></i>
        Đã lưu cài đặt thành công!
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const showToast = ref(false)

const settings = reactive({
  goals: {
    targetGPA: 8.5,
    weeklyHours: 24,
    streakTarget: 30,
    prioritySubjects: [1, 2]
  },
  reminders: {
    enabled: true,
    types: ['assignment', 'class', 'review'],
    defaultTime: '19:00'
  },
  learningStyle: 'visual',
  difficulty: 'intermediate',
  tutorPersonality: 'friendly',
  preferences: {
    autoSuggest: true,
    shareProgress: false,
    detailedAnalytics: true,
    gamification: true,
    language: 'vi'
  }
})

const availableSubjects = [
  { id: 1, name: 'Lập trình Web' },
  { id: 2, name: 'Mobile Android' },
  { id: 3, name: 'Cơ sở dữ liệu' },
  { id: 4, name: 'Mạng máy tính' },
  { id: 5, name: 'Thuật toán' }
]

const learningStyles = [
  {
    value: 'visual',
    name: 'Thị giác',
    icon: 'fas fa-eye',
    description: 'Học qua hình ảnh, sơ đồ, video'
  },
  {
    value: 'auditory',
    name: 'Thính giác',
    icon: 'fas fa-headphones',
    description: 'Học qua nghe giảng, podcast'
  },
  {
    value: 'reading',
    name: 'Đọc/Viết',
    icon: 'fas fa-book-open',
    description: 'Học qua đọc tài liệu, ghi chú'
  },
  {
    value: 'kinesthetic',
    name: 'Thực hành',
    icon: 'fas fa-hand-paper',
    description: 'Học qua làm, thử nghiệm'
  }
]

const difficultyLevels = [
  { value: 'beginner', label: 'Cơ bản', icon: 'fas fa-seedling' },
  { value: 'intermediate', label: 'Trung bình', icon: 'fas fa-layer-group' },
  { value: 'advanced', label: 'Nâng cao', icon: 'fas fa-rocket' }
]

const tutorPersonalities = [
  {
    value: 'friendly',
    name: 'Thân thiện',
    icon: 'fas fa-smile',
    color: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    description: 'Hòa nhã, khích lệ, nhiệt tình',
    sample: 'Tuyệt vời! Bạn đang làm rất tốt đó! Tiếp tục phát huy nhé! 🎉'
  },
  {
    value: 'professional',
    name: 'Chuyên nghiệp',
    icon: 'fas fa-user-tie',
    color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    description: 'Nghiêm túc, chính xác, súc tích',
    sample: 'Bài làm đạt 85%. Cần cải thiện phần xử lý lỗi.'
  },
  {
    value: 'motivational',
    name: 'Động viên',
    icon: 'fas fa-fire',
    color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    description: 'Truyền cảm hứng, tích cực',
    sample: 'Bạn có tiềm năng lớn! Đừng bỏ cuộc, thành công đang ở phía trước! 💪'
  },
  {
    value: 'humorous',
    name: 'Hài hước',
    icon: 'fas fa-laugh',
    color: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    description: 'Vui vẻ, dễ gần, giải trí',
    sample: 'Ồ không! Bug xuất hiện rồi! Nhưng đừng lo, chúng ta sẽ "debug" nó thôi! 😄'
  }
]

const saveSettings = () => {
  // TODO: Save to API
  console.log('Saving settings:', settings)
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const exportSettings = () => {
  const dataStr = JSON.stringify(settings, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ai-learning-settings.json'
  link.click()
}

const importSettings = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result)
        Object.assign(settings, imported)
        showToast.value = true
        setTimeout(() => {
          showToast.value = false
        }, 3000)
      } catch (error) {
        alert('File không hợp lệ!')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

const resetSettings = () => {
  if (confirm('Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định?')) {
    Object.assign(settings, {
      goals: {
        targetGPA: 8.0,
        weeklyHours: 20,
        streakTarget: 30,
        prioritySubjects: []
      },
      reminders: {
        enabled: true,
        types: ['assignment'],
        defaultTime: '19:00'
      },
      learningStyle: 'visual',
      difficulty: 'intermediate',
      tutorPersonality: 'friendly',
      preferences: {
        autoSuggest: true,
        shareProgress: false,
        detailedAnalytics: false,
        gamification: false,
        language: 'vi'
      }
    })
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  }
}
</script>

<style scoped>
.personalization-settings {
  padding: 24px;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.settings-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-header h3 i {
  color: #667eea;
}

.btn-save {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.settings-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
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

.header-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  font-size: 12px;
  color: #6b7280;
}

.card-body {
  padding: 24px;
}

.goal-item {
  margin-bottom: 24px;
}

.goal-item:last-child {
  margin-bottom: 0;
}

.goal-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  font-size: 14px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-value {
  min-width: 60px;
  font-weight: 700;
  color: #667eea;
  font-size: 14px;
}

.priority-subjects {
  margin-top: 24px;
}

.subjects-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.2s;
}

.checkbox-label:hover {
  background: #f9fafb;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '\f00c';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.subject-name {
  font-size: 14px;
  color: #374151;
}

.reminder-toggle,
.preference-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.toggle-info {
  flex: 1;
}

.toggle-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.toggle-desc {
  font-size: 12px;
  color: #6b7280;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.3s;
  border-radius: 24px;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.switch input:checked + .switch-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.switch input:checked + .switch-slider:before {
  transform: translateX(24px);
}

.reminder-options {
  margin-top: 16px;
}

.reminder-item {
  margin-bottom: 16px;
}

.reminder-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s;
}

.reminder-label:hover {
  background: #f3f4f6;
}

.reminder-label input[type="checkbox"] {
  display: none;
}

.reminder-info {
  flex: 1;
}

.reminder-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
  font-size: 14px;
}

.reminder-desc {
  font-size: 12px;
  color: #6b7280;
}

.time-picker {
  margin-top: 16px;
}

.time-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.time-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.learning-style-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.style-card {
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.style-card:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.style-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.style-icon {
  font-size: 32px;
  color: #667eea;
  margin-bottom: 8px;
}

.style-name {
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
  font-size: 14px;
}

.style-desc {
  font-size: 12px;
  color: #6b7280;
}

.difficulty-preference {
  margin-top: 24px;
}

.difficulty-buttons {
  display: flex;
  gap: 8px;
}

.difficulty-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.difficulty-btn:hover {
  border-color: #667eea;
}

.difficulty-btn.active {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.difficulty-btn i {
  font-size: 20px;
}

.tutor-personalities {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.personality-card {
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.personality-card:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.personality-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.personality-card input[type="radio"] {
  display: none;
}

.personality-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.personality-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.personality-name {
  font-weight: 700;
  color: #1f2937;
  font-size: 15px;
}

.personality-desc {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.personality-sample {
  font-size: 12px;
  color: #667eea;
  font-style: italic;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
}

.language-select,
.select-input {
  margin-top: 16px;
}

.select-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background: white;
  cursor: pointer;
}

.select-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.data-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
}

.data-btn:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.data-btn i {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
}

.data-btn.export i {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.data-btn.import i {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.data-btn.reset i {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.btn-content {
  flex: 1;
  text-align: left;
}

.btn-title {
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2px;
}

.btn-desc {
  font-size: 12px;
  color: #6b7280;
}

.save-toast {
  position: fixed;
  bottom: 32px;
  right: 32px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  z-index: 9999;
}

.save-toast i {
  font-size: 20px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 1024px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .learning-style-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .learning-style-grid {
    grid-template-columns: 1fr;
  }
}
</style>
