<template>
  <div class="semester-selector">
    <h3 class="section-title">
      <i class="fas fa-calendar-alt"></i>
      Chọn học kỳ
    </h3>
    <div class="semester-grid">
      <div
        v-for="semester in semesters"
        :key="semester.id"
        class="semester-card"
        :class="{ active: selectedSemester?.id === semester.id }"
        @click="selectSemester(semester)"
      >
        <div class="semester-info">
          <h4>{{ semester.name }}</h4>
          <p class="semester-year">Năm học: {{ semester.academicYear }}</p>
          <p class="semester-period">
            {{ formatDate(semester.startDate) }} - {{ formatDate(semester.endDate) }}
          </p>
        </div>
        <div class="semester-status" :class="semester.status">
          <span class="status-badge">{{ getStatusText(semester.status) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  semesters: {
    type: Array,
    required: true
  },
  selectedSemester: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['select']);

const selectSemester = (semester) => {
  if (semester.status === 'active') {
    emit('select', semester);
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

const getStatusText = (status) => {
  const statusMap = {
    active: 'Đang mở đăng ký',
    upcoming: 'Sắp mở',
    closed: 'Đã đóng'
  };
  return statusMap[status] || status;
};
</script>

<style scoped>
.semester-selector {
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

.semester-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.semester-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.semester-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.semester-card.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.semester-info h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.semester-year {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.semester-period {
  font-size: 13px;
  color: #9ca3af;
}

.semester-status {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.semester-status.active .status-badge {
  background: #dcfce7;
  color: #16a34a;
}

.semester-status.upcoming .status-badge {
  background: #fef3c7;
  color: #d97706;
}

.semester-status.closed .status-badge {
  background: #f3f4f6;
  color: #6b7280;
}

.semester-card:not(.active) .semester-status.closed,
.semester-card:not(.active) .semester-status.upcoming {
  opacity: 0.7;
  pointer-events: none;
}
</style>
