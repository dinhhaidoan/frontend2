<template>
  <div class="search-container">
    <div class="search-wrapper" :class="{ 'focused': isSearchFocused, 'has-suggestions': showSuggestions }">
      <div class="search-input-group">
        <i class="search-icon fas fa-search" :class="{ 'searching': isSearching }"></i>
        <input
          ref="searchInput"
          v-model="searchValue"
          type="text"
          placeholder="Tìm kiếm khóa học, bài giảng..."
          class="search-input"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleInput"
          @keydown="handleKeydown"
          autocomplete="off"
        />
        <div class="search-actions">
          <Transition name="fade">
            <button v-if="searchValue" @click="clearSearch" class="clear-button">
              <i class="fas fa-times"></i>
            </button>
          </Transition>
          <div class="search-divider"></div>
          <button class="search-button" @click="performSearch">
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
      
      <!-- Search Suggestions Dropdown -->
      <Transition name="suggestions">
        <div v-if="showSuggestions && filteredSuggestions.length > 0" class="suggestions-dropdown">
          <div class="suggestions-header">
            <i class="fas fa-clock text-gray-400"></i>
            <span>Tìm kiếm gần đây</span>
          </div>
          <div class="suggestions-list">
            <div
              v-for="(suggestion, index) in filteredSuggestions"
              :key="suggestion.id"
              class="suggestion-item"
              :class="{ 'highlighted': highlightedIndex === index }"
              @click="selectSuggestion(suggestion)"
              @mouseenter="highlightedIndex = index"
            >
              <div class="suggestion-icon">
                <i :class="suggestion.icon"></i>
              </div>
              <div class="suggestion-content">
                <div class="suggestion-title" v-html="highlightText(suggestion.title)"></div>
                <div class="suggestion-category">{{ suggestion.category }}</div>
              </div>
              <div class="suggestion-action">
                <i class="fas fa-arrow-up-right"></i>
              </div>
            </div>
          </div>
          <div class="suggestions-footer">
            <div class="suggestion-item view-all" @click="viewAllResults">
              <div class="suggestion-icon">
                <i class="fas fa-search"></i>
              </div>
              <div class="suggestion-content">
                <div class="suggestion-title">Xem tất cả kết quả cho "{{ searchValue }}"</div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
      
      <!-- Search Overlay -->
      <div v-if="showSuggestions" class="search-overlay" @click="closeSuggestions"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const searchInput = ref(null)
const searchValue = ref('')
const isSearchFocused = ref(false)
const isSearching = ref(false)
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)

// Mock search suggestions data
const suggestions = ref([
  { id: 1, title: 'React Cơ Bản', category: 'Khóa học', icon: 'fab fa-react text-blue-500' },
  { id: 2, title: 'JavaScript ES6', category: 'Bài giảng', icon: 'fab fa-js-square text-yellow-500' },
  { id: 3, title: 'Vue.js Components', category: 'Khóa học', icon: 'fab fa-vuejs text-green-500' },
  { id: 4, title: 'CSS Grid Layout', category: 'Bài giảng', icon: 'fab fa-css3-alt text-blue-600' },
  { id: 5, title: 'Node.js Backend', category: 'Khóa học', icon: 'fab fa-node-js text-green-600' },
  { id: 6, title: 'Python Django', category: 'Khóa học', icon: 'fab fa-python text-yellow-600' },
])

const filteredSuggestions = computed(() => {
  if (!searchValue.value) return suggestions.value.slice(0, 5)
  
  return suggestions.value
    .filter(item => 
      item.title.toLowerCase().includes(searchValue.value.toLowerCase()) ||
      item.category.toLowerCase().includes(searchValue.value.toLowerCase())
    )
    .slice(0, 5)
})

const handleFocus = () => {
  isSearchFocused.value = true
  showSuggestions.value = true
  highlightedIndex.value = -1
}

const handleBlur = () => {
  // Delay blur to allow click on suggestions
  setTimeout(() => {
    isSearchFocused.value = false
    showSuggestions.value = false
    highlightedIndex.value = -1
  }, 200)
}

const handleInput = () => {
  isSearching.value = true
  showSuggestions.value = true
  highlightedIndex.value = -1
  
  // Simulate search delay
  setTimeout(() => {
    isSearching.value = false
  }, 500)
}

const handleKeydown = (event) => {
  if (!showSuggestions.value) return
  
  const maxIndex = filteredSuggestions.value.length - 1
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = highlightedIndex.value < maxIndex ? highlightedIndex.value + 1 : 0
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = highlightedIndex.value > 0 ? highlightedIndex.value - 1 : maxIndex
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0) {
        selectSuggestion(filteredSuggestions.value[highlightedIndex.value])
      } else {
        performSearch()
      }
      break
    case 'Escape':
      closeSuggestions()
      searchInput.value?.blur()
      break
  }
}

const selectSuggestion = (suggestion) => {
  searchValue.value = suggestion.title
  closeSuggestions()
  performSearch()
}

const clearSearch = () => {
  searchValue.value = ''
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const performSearch = () => {
  if (!searchValue.value.trim()) return
  
  isSearching.value = true
  closeSuggestions()
  
  // Simulate search
  setTimeout(() => {
    isSearching.value = false
    console.log('Searching for:', searchValue.value)
  }, 1000)
}

const viewAllResults = () => {
  performSearch()
}

const closeSuggestions = () => {
  showSuggestions.value = false
  highlightedIndex.value = -1
}

const highlightText = (text) => {
  if (!searchValue.value) return text
  
  const regex = new RegExp(`(${searchValue.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// Global click handler
const handleGlobalClick = (event) => {
  if (!event.target.closest('.search-wrapper')) {
    closeSuggestions()
  }
}

onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
})
</script>

<style scoped>
.search-container {
  width: 100%;
  max-width: 600px;
  position: relative;
}

.search-wrapper {
  position: relative;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(229, 231, 235, 0.5);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.search-wrapper.focused .search-input-group {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 
    0 0 0 4px rgba(59, 130, 246, 0.1),
    0 10px 25px -5px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.search-wrapper.has-suggestions .search-input-group {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

/* Search Icon */
.search-icon {
  position: absolute;
  left: 16px;
  color: #9ca3af;
  font-size: 16px;
  transition: all 0.3s ease;
  z-index: 10;
}

.search-icon.searching {
  animation: pulse 1.5s ease-in-out infinite;
}

.search-wrapper.focused .search-icon {
  color: #3b82f6;
  transform: scale(1.1);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Search Input */
.search-input {
  flex: 1;
  padding: 14px 50px 14px 50px;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
  color: #1f2937;
  font-weight: 500;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.search-wrapper.focused .search-input::placeholder {
  color: #d1d5db;
}

/* Search Actions */
.search-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 8px;
}

.clear-button {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
}

.clear-button:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  transform: scale(1.1);
}

.search-divider {
  width: 1px;
  height: 20px;
  background: rgba(229, 231, 235, 0.7);
}

.search-button {
  width: 36px;
  height: 36px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.search-button:hover {
  transform: scale(1.05) translateY(-1px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.search-button:active {
  transform: scale(0.95);
}

/* Suggestions Dropdown */
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(229, 231, 235, 0.5);
  border-top: none;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
}

.suggestions-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(249, 250, 251, 0.8);
  border-bottom: 1px solid rgba(229, 231, 235, 0.3);
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.suggestions-list {
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(229, 231, 235, 0.2);
}

.suggestion-item:hover,
.suggestion-item.highlighted {
  background: rgba(59, 130, 246, 0.05);
  transform: translateX(4px);
}

.suggestion-item.highlighted {
  background: rgba(59, 130, 246, 0.1);
}

.suggestion-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(243, 244, 246, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  transition: all 0.2s ease;
}

.suggestion-item:hover .suggestion-icon {
  transform: scale(1.1);
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 2px;
}

.suggestion-title :deep(mark) {
  background: rgba(59, 130, 246, 0.2);
  color: #1d4ed8;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 700;
}

.suggestion-category {
  font-size: 12px;
  color: #6b7280;
}

.suggestion-action {
  color: #9ca3af;
  font-size: 12px;
  transition: all 0.2s ease;
}

.suggestion-item:hover .suggestion-action {
  color: #3b82f6;
  transform: translateX(2px);
}

.suggestions-footer {
  border-top: 1px solid rgba(229, 231, 235, 0.3);
  background: rgba(249, 250, 251, 0.5);
}

.view-all {
  font-weight: 600;
  color: #3b82f6;
}

.view-all:hover {
  background: rgba(59, 130, 246, 0.1);
}

/* Search Overlay */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
  z-index: 999;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.suggestions-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.suggestions-leave-active {
  transition: all 0.2s ease-in;
}

.suggestions-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.suggestions-leave-to {
  opacity: 0;
  transform: translateY(-5px);
  max-height: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-input {
    padding: 12px 45px 12px 45px;
    font-size: 14px;
  }
  
  .search-input-group {
    border-radius: 12px;
  }
  
  .suggestions-dropdown {
    border-radius: 0 0 12px 12px;
  }
}

@media (max-width: 640px) {
  .search-input {
    padding: 10px 40px 10px 40px;
  }
  
  .search-icon {
    left: 12px;
  }
  
  .search-actions {
    padding-right: 6px;
  }
  
  .clear-button,
  .search-button {
    width: 28px;
    height: 28px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .search-input-group {
    background: rgba(17, 24, 39, 0.9);
    border-color: rgba(75, 85, 99, 0.5);
  }
  
  .search-wrapper.focused .search-input-group {
    background: rgba(17, 24, 39, 0.95);
    border-color: rgba(59, 130, 246, 0.5);
  }
  
  .search-input {
    color: #f9fafb;
  }
  
  .search-input::placeholder {
    color: #6b7280;
  }
  
  .suggestions-dropdown {
    background: rgba(17, 24, 39, 0.95);
    border-color: rgba(75, 85, 99, 0.5);
  }
  
  .suggestion-title {
    color: #f9fafb;
  }
}

/* Loading skeleton for suggestions */
.suggestion-item.loading {
  pointer-events: none;
}

.suggestion-item.loading .suggestion-title,
.suggestion-item.loading .suggestion-category {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>