<template>
  <div class="notification-categories">
    <div class="categories-header">
      <h3>Danh mục thông báo</h3>
    </div>
    
    <div class="categories-grid">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-card"
        :class="{ active: activeCategory === category.id }"
        @click="selectCategory(category)"
      >
        <div class="category-icon">
          <i :class="category.icon"></i>
        </div>
        <div class="category-info">
          <h4>{{ category.name }}</h4>
          <span class="category-count">{{ category.count || 0 }} thông báo</span>
        </div>
        <div class="category-actions" v-if="canManage">
          <button @click.stop="editCategory(category)">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  userRole: { type: String, required: true }
})

const emit = defineEmits(['category-change'])

const activeCategory = ref('')
const canManage = ref(['admin', 'staff'].includes(props.userRole))

const selectCategory = (category) => {
  activeCategory.value = category.id
  emit('category-change', category)
}

const editCategory = (category) => {
  console.log('Edit category:', category)
}
</script>

<style scoped>
.notification-categories {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.categories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.categories-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.add-category-btn {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover,
.category-card.active {
  border-color: #667eea;
  background: #f0f9ff;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.category-info h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.category-count {
  font-size: 12px;
  color: #6b7280;
}

.category-actions {
  margin-left: auto;
}

.category-actions button {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
}
</style>