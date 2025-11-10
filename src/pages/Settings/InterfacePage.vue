<template>
  <div class="interface-page">
    <div class="page-header">
      <h2>Giao diện</h2>
      <p>Tùy chỉnh theme, màu sắc và kích cỡ chữ theo sở thích của bạn</p>
    </div>

    <div class="interface-content">
      <!-- Theme Selection -->
      <div class="interface-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-palette"></i>
            Chủ đề giao diện
          </h3>
        </div>
        <div class="section-content">
          <div class="theme-options">
            <div 
              v-for="theme in themes" 
              :key="theme.id"
              :class="['theme-card', { 'active': interfaceSettings.theme === theme.id }]"
              @click="selectTheme(theme.id)"
            >
              <div class="theme-preview">
                <div :class="['preview-content', theme.id]">
                  <div class="preview-header"></div>
                  <div class="preview-sidebar"></div>
                  <div class="preview-main">
                    <div class="preview-card"></div>
                    <div class="preview-card"></div>
                  </div>
                </div>
              </div>
              <div class="theme-info">
                <h4>{{ theme.name }}</h4>
                <p>{{ theme.description }}</p>
              </div>
              <div class="theme-icon">
                <i :class="theme.icon"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Font Size Selection -->
      <div class="interface-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-font"></i>
            Kích cỡ chữ
          </h3>
        </div>
        <div class="section-content">
          <div class="font-size-options">
            <div 
              v-for="size in fontSizes" 
              :key="size.id"
              :class="['font-size-card', { 'active': interfaceSettings.fontSize === size.id }]"
              @click="selectFontSize(size.id)"
            >
              <div class="font-size-preview">
                <div :class="['preview-text', size.id]">
                  Aa
                </div>
              </div>
              <div class="font-size-info">
                <h4>{{ size.name }}</h4>
                <p>{{ size.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Preview -->
      <div class="interface-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-eye"></i>
            Xem trước giao diện
          </h3>
        </div>
        <div class="section-content">
          <div :class="['interface-preview', interfaceSettings.theme]">
            <div class="preview-window">
              <div class="preview-titlebar">
                <div class="preview-controls">
                  <span class="control close"></span>
                  <span class="control minimize"></span>
                  <span class="control maximize"></span>
                </div>
                <div class="preview-title">Xem trước giao diện</div>
              </div>
              <div class="preview-body">
                <div class="preview-header-bar">
                  <div class="header-logo">Logo</div>
                  <div class="header-nav">
                    <span>Trang chủ</span>
                    <span>Sản phẩm</span>
                    <span>Liên hệ</span>
                  </div>
                </div>
                <div class="preview-content-area">
                  <div class="preview-sidebar-area">
                    <div class="sidebar-item active">Dashboard</div>
                    <div class="sidebar-item">Sản phẩm</div>
                    <div class="sidebar-item">Đơn hàng</div>
                    <div class="sidebar-item">Cài đặt</div>
                  </div>
                  <div class="preview-main-area">
                    <h3 :class="['preview-heading', interfaceSettings.fontSize]">
                      Tiêu đề trang
                    </h3>
                    <p :class="['preview-paragraph', interfaceSettings.fontSize]">
                      Đây là đoạn văn bản mẫu để xem trước kích cỡ chữ và theme đã chọn. 
                      Bạn có thể thay đổi cài đặt để xem sự khác biệt.
                    </p>
                    <div class="preview-cards">
                      <div class="preview-card-item">
                        <h4 :class="['card-title', interfaceSettings.fontSize]">Thẻ 1</h4>
                        <p :class="['card-text', interfaceSettings.fontSize]">Nội dung thẻ</p>
                      </div>
                      <div class="preview-card-item">
                        <h4 :class="['card-title', interfaceSettings.fontSize]">Thẻ 2</h4>
                        <p :class="['card-text', interfaceSettings.fontSize]">Nội dung thẻ</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Actions -->
      <div class="interface-actions">
        <button class="btn btn-primary" @click="saveInterfaceSettings" :disabled="!hasChanges">
          <i class="fas fa-save"></i>
          Lưu cài đặt
        </button>
        <button class="btn btn-secondary" @click="resetInterfaceSettings">
          <i class="fas fa-undo"></i>
          Khôi phục mặc định
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Interface settings
const interfaceSettings = ref({
  theme: 'light',
  fontSize: 'medium'
})

// Original settings for comparison
const originalSettings = ref({})

// Theme options
const themes = ref([
  {
    id: 'light',
    name: 'Sáng',
    description: 'Giao diện sáng, dễ nhìn ban ngày',
    icon: 'fas fa-sun'
  },
  {
    id: 'dark',
    name: 'Tối',
    description: 'Giao diện tối, phù hợp ban đêm',
    icon: 'fas fa-moon'
  },
  {
    id: 'system',
    name: 'Hệ thống',
    description: 'Tự động theo cài đặt của máy',
    icon: 'fas fa-desktop'
  }
])

// Font size options
const fontSizes = ref([
  {
    id: 'small',
    name: 'Nhỏ',
    description: 'Phù hợp với màn hình nhỏ'
  },
  {
    id: 'medium',
    name: 'Vừa',
    description: 'Kích cỡ tiêu chuẩn'
  },
  {
    id: 'large',
    name: 'Lớn',
    description: 'Dễ đọc hơn, phù hợp người lớn tuổi'
  }
])

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(interfaceSettings.value) !== JSON.stringify(originalSettings.value)
})

// Methods
const selectTheme = (themeId) => {
  interfaceSettings.value.theme = themeId
}

const selectFontSize = (sizeId) => {
  interfaceSettings.value.fontSize = sizeId
}

const saveInterfaceSettings = () => {
  // Simulate API call
  console.log('Saving interface settings:', interfaceSettings.value)
  
  // Apply theme to document
  applyTheme(interfaceSettings.value.theme)
  
  // Apply font size to document
  applyFontSize(interfaceSettings.value.fontSize)
  
  // Update original settings
  originalSettings.value = { ...interfaceSettings.value }
  
  // Show success message
  alert('Đã lưu cài đặt giao diện thành công!')
}

const resetInterfaceSettings = () => {
  interfaceSettings.value = { ...originalSettings.value }
}

const applyTheme = (theme) => {
  const root = document.documentElement
  
  if (theme === 'system') {
    // Detect system theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme = prefersDark ? 'dark' : 'light'
  }
  
  root.setAttribute('data-theme', theme)
}

const applyFontSize = (fontSize) => {
  const root = document.documentElement
  root.setAttribute('data-font-size', fontSize)
}

const loadInterfaceSettings = () => {
  // Simulate loading settings
  const mockSettings = {
    theme: 'light',
    fontSize: 'medium'
  }
  
  interfaceSettings.value = { ...mockSettings }
  originalSettings.value = { ...mockSettings }
  
  // Apply current settings
  applyTheme(mockSettings.theme)
  applyFontSize(mockSettings.fontSize)
}

// Initialize
onMounted(() => {
  loadInterfaceSettings()
})
</script>

<style scoped>
.interface-page {
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

.interface-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.interface-section {
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

/* Theme Options */
.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.theme-card {
  border: 2px solid rgba(226, 232, 240, 0.5);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  position: relative;
}

.theme-card:hover {
  border-color: rgba(99, 102, 241, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.theme-card.active {
  border-color: #6366f1;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.2);
}

.theme-preview {
  width: 100%;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.3);
}

.preview-content {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main";
  grid-template-columns: 60px 1fr;
  grid-template-rows: 20px 1fr;
}

.preview-content.light {
  background: #ffffff;
  color: #1e293b;
}

.preview-content.dark {
  background: #1e293b;
  color: #f8fafc;
}

.preview-content.system {
  background: linear-gradient(45deg, #ffffff 50%, #1e293b 50%);
}

.preview-header {
  grid-area: header;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.preview-sidebar {
  grid-area: sidebar;
  background: rgba(99, 102, 241, 0.1);
}

.preview-main {
  grid-area: main;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-card {
  height: 16px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 4px;
}

.theme-info h4 {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.theme-info p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.theme-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

/* Font Size Options */
.font-size-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.font-size-card {
  border: 2px solid rgba(226, 232, 240, 0.5);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  text-align: center;
}

.font-size-card:hover {
  border-color: rgba(99, 102, 241, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.font-size-card.active {
  border-color: #6366f1;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.2);
}

.font-size-preview {
  margin-bottom: 1rem;
}

.preview-text {
  font-weight: 600;
  color: #6366f1;
  transition: all 0.3s ease;
}

.preview-text.small {
  font-size: 2rem;
}

.preview-text.medium {
  font-size: 2.5rem;
}

.preview-text.large {
  font-size: 3rem;
}

.font-size-info h4 {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.font-size-info p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

/* Live Preview */
.interface-preview {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.preview-window {
  background: #ffffff;
  transition: all 0.3s ease;
}

.interface-preview.dark .preview-window {
  background: #1e293b;
  color: #f8fafc;
}

.preview-titlebar {
  background: #f1f5f9;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.interface-preview.dark .preview-titlebar {
  background: #334155;
  border-bottom-color: rgba(148, 163, 184, 0.2);
}

.preview-controls {
  display: flex;
  gap: 0.5rem;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.control.close { background: #ef4444; }
.control.minimize { background: #f59e0b; }
.control.maximize { background: #10b981; }

.preview-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.interface-preview.dark .preview-title {
  color: #94a3b8;
}

.preview-body {
  height: 300px;
  display: flex;
  flex-direction: column;
}

.preview-header-bar {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-logo {
  font-weight: 600;
}

.header-nav {
  display: flex;
  gap: 1.5rem;
}

.header-nav span {
  font-size: 0.875rem;
  cursor: pointer;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.header-nav span:hover {
  opacity: 1;
}

.preview-content-area {
  flex: 1;
  display: grid;
  grid-template-columns: 200px 1fr;
}

.preview-sidebar-area {
  background: rgba(99, 102, 241, 0.05);
  padding: 1rem;
  border-right: 1px solid rgba(226, 232, 240, 0.5);
}

.interface-preview.dark .preview-sidebar-area {
  background: rgba(148, 163, 184, 0.1);
  border-right-color: rgba(148, 163, 184, 0.2);
}

.sidebar-item {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar-item:hover {
  background: rgba(99, 102, 241, 0.1);
}

.sidebar-item.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.preview-main-area {
  padding: 1.5rem;
}

.preview-heading {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-weight: 600;
}

.interface-preview.dark .preview-heading {
  color: #f8fafc;
}

.preview-heading.small { font-size: 1.25rem; }
.preview-heading.medium { font-size: 1.5rem; }
.preview-heading.large { font-size: 1.75rem; }

.preview-paragraph {
  margin: 0 0 1.5rem 0;
  color: #64748b;
  line-height: 1.6;
}

.interface-preview.dark .preview-paragraph {
  color: #94a3b8;
}

.preview-paragraph.small { font-size: 0.875rem; }
.preview-paragraph.medium { font-size: 1rem; }
.preview-paragraph.large { font-size: 1.125rem; }

.preview-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.preview-card-item {
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 12px;
  padding: 1rem;
}

.interface-preview.dark .preview-card-item {
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.2);
}

.card-title {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-weight: 600;
}

.interface-preview.dark .card-title {
  color: #e2e8f0;
}

.card-title.small { font-size: 1rem; }
.card-title.medium { font-size: 1.125rem; }
.card-title.large { font-size: 1.25rem; }

.card-text {
  margin: 0;
  color: #6b7280;
}

.interface-preview.dark .card-text {
  color: #9ca3af;
}

.card-text.small { font-size: 0.75rem; }
.card-text.medium { font-size: 0.875rem; }
.card-text.large { font-size: 1rem; }

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

.interface-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .theme-options,
  .font-size-options {
    grid-template-columns: 1fr;
  }
  
  .preview-content-area {
    grid-template-columns: 1fr;
  }
  
  .preview-sidebar-area {
    display: none;
  }
  
  .preview-cards {
    grid-template-columns: 1fr;
  }
  
  .interface-actions {
    flex-direction: column;
  }
}
</style>