<template>
  <div class="subject-selector" v-if="semesterId">
    <h3 class="section-title">
      <i class="fas fa-book"></i>
      Chọn môn học
    </h3>
    
    <div class="search-box">
      <i class="fas fa-search"></i>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Tìm kiếm môn học theo tên hoặc mã môn..."
        class="search-input"
      />
    </div>

    <div class="subjects-list">
      <div
        v-for="subject in filteredSubjects"
        :key="subject.id"
        class="subject-item"
        :class="{ selected: selectedSubject?.id === subject.id }"
        @click="selectSubject(subject)"
      >
        <div class="subject-main">
          <div class="subject-code">{{ subject.code }}</div>
          <div class="subject-name">{{ subject.name }}</div>
        </div>
        <div class="subject-meta">
          <span class="credit-badge">
            <i class="fas fa-graduation-cap"></i>
            {{ subject.credits }} tín chỉ
          </span>
          <span class="class-count">
            <i class="fas fa-users"></i>
            {{ subject.availableClasses }} lớp
          </span>
        </div>
      </div>

      <div v-if="filteredSubjects.length === 0" class="no-data">
        <i class="fas fa-inbox"></i>
        <p>Không tìm thấy môn học phù hợp</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  semesterId: {
    type: [String, Number],
    default: null
  },
  subjects: {
    type: Array,
    required: true
  },
  selectedSubject: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['select']);

const searchQuery = ref('');

const filteredSubjects = computed(() => {
  if (!searchQuery.value) return props.subjects;
  
  const query = searchQuery.value.toLowerCase();
  return props.subjects.filter(subject =>
    subject.name.toLowerCase().includes(query) ||
    subject.code.toLowerCase().includes(query)
  );
});

const selectSubject = (subject) => {
  emit('select', subject);
};
</script>

<style scoped>
.subject-selector {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: #3b82f6;
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 45px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.subjects-list {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subjects-list::-webkit-scrollbar {
  width: 8px;
}

.subjects-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.subjects-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.subjects-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.subject-item {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.subject-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.subject-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.subject-main {
  margin-bottom: 12px;
}

.subject-code {
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 4px;
}

.subject-name {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.subject-meta {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.credit-badge,
.class-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.credit-badge i,
.class-count i {
  color: #9ca3af;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-data p {
  font-size: 16px;
}
</style>
