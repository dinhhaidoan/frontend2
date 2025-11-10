<template>
  <div class="language-page">
    <div class="page-header">
      <h2>Ngôn ngữ</h2>
      <p>Chọn ngôn ngữ hiển thị và định dạng khu vực phù hợp với bạn</p>
    </div>

    <div class="language-content">
      <!-- Language Selection -->
      <div class="language-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-globe"></i>
            Ngôn ngữ hiển thị
          </h3>
        </div>
        <div class="section-content">
          <div class="language-grid">
            <div 
              v-for="language in languages" 
              :key="language.code"
              :class="['language-card', { 'active': languageSettings.selectedLanguage === language.code }]"
              @click="selectLanguage(language.code)"
            >
              <div class="language-flag">
                {{ language.flag }}
              </div>
              <div class="language-info">
                <h4>{{ language.name }}</h4>
                <p>{{ language.nativeName }}</p>
                <span class="language-code">{{ language.code.toUpperCase() }}</span>
              </div>
              <div class="language-status" v-if="languageSettings.selectedLanguage === language.code">
                <i class="fas fa-check"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Save Actions -->
      <div class="language-actions">
        <button class="btn btn-primary" @click="saveLanguageSettings" :disabled="!hasChanges">
          <i class="fas fa-save"></i>
          Lưu cài đặt
        </button>
        <button class="btn btn-secondary" @click="resetLanguageSettings">
          <i class="fas fa-undo"></i>
          Khôi phục mặc định
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Language settings
const languageSettings = ref({
  selectedLanguage: 'vi',
})

// Original settings for comparison
const originalSettings = ref({})

// Available languages with real country flags
const languages = ref([
  {
    code: 'vi',
    name: 'Tiếng Việt',
    nativeName: 'Vietnamese',
    flag: '🇻🇳'
  },
  {
    code: 'en',
    name: 'Tiếng Anh',
    nativeName: 'English',
    flag: '🇺🇸'
  }
])

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(languageSettings.value) !== JSON.stringify(originalSettings.value)
})

// Methods
const selectLanguage = (langCode) => {
  languageSettings.value.selectedLanguage = langCode
}

const saveLanguageSettings = () => {
  // Simulate API call
  console.log('Saving language settings:', languageSettings.value)
  
  // Update original settings
  originalSettings.value = { ...languageSettings.value }
  
  // Show success message
  alert('Đã lưu cài đặt ngôn ngữ thành công!')
}

const resetLanguageSettings = () => {
  languageSettings.value = { ...originalSettings.value }
}

const loadLanguageSettings = () => {
  // Simulate loading settings
  const mockSettings = {
    selectedLanguage: 'vi',
  }
  
  languageSettings.value = { ...mockSettings }
  originalSettings.value = { ...mockSettings }
}

// Initialize
onMounted(() => {
  loadLanguageSettings()
})
</script>

<style scoped>
.language-page {
  max-width: 900px;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h2 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #64748b;
  margin: 0;
}

.language-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.language-section {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 16px;
  overflow: hidden;
}

.section-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  padding: 1.5rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #374151;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.section-header h3 i {
  color: #6366f1;
  width: 20px;
}

.section-content {
  padding: 1.5rem;
}

/* Language Grid */
.language-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.language-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid rgba(226, 232, 240, 0.5);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  position: relative;
}

.language-card:hover {
  border-color: rgba(99, 102, 241, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.language-card.active {
  border-color: #6366f1;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.2);
}

.language-flag {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 12px;
  flex-shrink: 0;
}

.language-info {
  flex: 1;
}

.language-info h4 {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.language-info p {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.language-code {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.language-status {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

/* Format Options */
.format-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.format-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.format-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
}

.format-label i {
  color: #6366f1;
  width: 16px;
}

.format-select {
  padding: 0.75rem;
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  font-size: 0.875rem;
  color: #374151;
  transition: all 0.3s ease;
}

.format-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Preview */
.preview-container {
  max-width: 500px;
  margin: 0 auto;
}

.preview-window {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.preview-header {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 1rem;
  text-align: center;
}

.preview-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.preview-body {
  padding: 1.5rem;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
}

.preview-item:last-of-type {
  border-bottom: none;
  margin-bottom: 1rem;
}

.preview-label {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.preview-value {
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
}

.preview-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.3);
}

.preview-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preview-btn.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.preview-btn.secondary {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.2);
}

.preview-btn:hover {
  transform: translateY(-1px);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.2);
}

.btn-secondary:hover {
  background: rgba(100, 116, 139, 0.15);
  transform: translateY(-1px);
}

.language-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .language-grid {
    grid-template-columns: 1fr;
  }
  
  .format-options {
    grid-template-columns: 1fr;
  }
  
  .language-actions {
    flex-direction: column;
  }
}
</style>