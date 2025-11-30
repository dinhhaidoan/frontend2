<template>
  <div class="class-list" v-if="subjectId">
    <div class="header-section">
      <h3 class="section-title">
        <i class="fas fa-chalkboard-teacher"></i>
        Danh sách lớp học phần
      </h3>
      
      <div class="filter-actions">
        <label class="checkbox-filter">
          <input type="checkbox" v-model="showOnlyNoConflict" />
          <span>Chỉ hiển thị lớp không trùng lịch</span>
        </label>
      </div>
    </div>

    <div class="classes-grid">
      <div
        v-for="classItem in displayedClasses"
        :key="classItem.id"
        class="class-card"
        :class="{
          'has-conflict': classItem.hasConflict,
          'is-full': classItem.isFull
        }"
      >
        <div class="class-header">
          <div class="class-name">
            <h4>{{ classItem.className }}</h4>
            <span class="class-code">{{ classItem.classCode }}</span>
          </div>
          <div class="class-badges">
            <span v-if="classItem.hasConflict" class="badge badge-warning">
              <i class="fas fa-exclamation-triangle"></i> Trùng lịch
            </span>
            <span v-if="classItem.isFull" class="badge badge-danger">
              <i class="fas fa-users-slash"></i> Đã đầy
            </span>
            <span v-else-if="classItem.remainingSlots <= 5" class="badge badge-alert">
              <i class="fas fa-hourglass-half"></i> Sắp đầy
            </span>
          </div>
        </div>

        <div class="class-info">
          <div class="info-row">
            <i class="fas fa-user-tie"></i>
            <span>Giảng viên: <strong>{{ classItem.teacher }}</strong></span>
          </div>
          <div class="info-row">
            <i class="fas fa-calendar-week"></i>
            <span>{{ formatSchedule(classItem.schedule) }}</span>
          </div>
          <div class="info-row">
            <i class="fas fa-map-marker-alt"></i>
            <!-- Room display removed per UX request -->
          </div>
          <div class="info-row">
            <i class="fas fa-users"></i>
            <span>Sĩ số: <strong>{{ classItem.currentStudents }}/{{ classItem.maxStudents }}</strong></span>
          </div>
        </div>

        <div class="class-actions">
          <button
            class="btn btn-details"
            @click="viewDetails(classItem)"
          >
            <i class="fas fa-info-circle"></i>
            Chi tiết
          </button>
          <button
            class="btn btn-register"
            :disabled="classItem.isFull || classItem.hasConflict"
            @click="registerClass(classItem)"
          >
            <i class="fas fa-plus-circle"></i>
            Đăng ký
          </button>
        </div>
      </div>

      <div v-if="displayedClasses.length === 0" class="no-data">
        <i class="fas fa-inbox"></i>
        <p v-if="showOnlyNoConflict">Không có lớp nào không trùng lịch</p>
        <p v-else>Không có lớp học phần nào</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  subjectId: {
    type: [String, Number],
    default: null
  },
  classes: {
    type: Array,
    required: true
  },
  registeredSchedules: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['register', 'view-details']);

const showOnlyNoConflict = ref(false);

const displayedClasses = computed(() => {
  let filtered = props.classes;
  
  if (showOnlyNoConflict.value) {
    filtered = filtered.filter(c => !c.hasConflict);
  }
  
  return filtered;
});

const formatSchedule = (schedule) => {
  if (!schedule || schedule.length === 0) return 'Chưa có lịch';
  
  return schedule.map(s => 
    `${s.dayOfWeek} (${s.startPeriod}-${s.endPeriod})`
  ).join(', ');
};

const registerClass = (classItem) => {
  emit('register', classItem);
};

const viewDetails = (classItem) => {
  emit('view-details', classItem);
};
</script>

<style scoped>
.class-list {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.section-title i {
  color: #3b82f6;
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.checkbox-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  user-select: none;
}

.checkbox-filter input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.class-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: all 0.3s ease;
}

.class-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.class-card.has-conflict {
  border-color: #fbbf24;
  background: #fffbeb;
}

.class-card.is-full {
  border-color: #ef4444;
  background: #fef2f2;
  opacity: 0.8;
}

.class-header {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.class-name {
  margin-bottom: 12px;
}

.class-name h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.class-code {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.class-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-warning {
  background: #fef3c7;
  color: #d97706;
}

.badge-danger {
  background: #fee2e2;
  color: #dc2626;
}

.badge-alert {
  background: #fed7aa;
  color: #ea580c;
}

.class-info {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #4b5563;
}

.info-row i {
  color: #9ca3af;
  margin-top: 2px;
  min-width: 16px;
}

.class-actions {
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-details {
  background: #f3f4f6;
  color: #374151;
}

.btn-details:hover {
  background: #e5e7eb;
}

.btn-register {
  background: #3b82f6;
  color: white;
}

.btn-register:hover:not(:disabled) {
  background: #2563eb;
}

.btn-register:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
}

.no-data {
  grid-column: 1 / -1;
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
