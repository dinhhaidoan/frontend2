<template>
  <div class="filters-sidebar">
    <div class="filters-header">
      <h3>
        <i class="fas fa-filter"></i>
        Bộ lọc
      </h3>
      <button @click="resetFilters" class="btn-reset">
        <i class="fas fa-redo"></i>
        Đặt lại
      </button>
    </div>

    <div class="filter-group">
      <label class="filter-label">Lớp học</label>
      <select v-model="localFilters.classId" @change="emitFilters" class="filter-select">
        <option value="">Tất cả lớp</option>
        <option value="1">Lập trình hướng đối tượng</option>
        <option value="2">Phát triển ứng dụng Web</option>
        <option value="3">Cơ sở dữ liệu</option>
        <option value="4">Cấu trúc dữ liệu</option>
      </select>
    </div>

    <div class="filter-group">
      <label class="filter-label">Loại bài tập</label>
      <select v-model="localFilters.type" @change="emitFilters" class="filter-select">
        <option value="">Tất cả loại</option>
        <option value="essay">Tự luận</option>
        <option value="multiple-choice">Trắc nghiệm</option>
        <option value="mixed">Hỗn hợp</option>
      </select>
    </div>

    <div class="filter-group">
      <label class="filter-label">Trạng thái</label>
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="statusFilters.notStarted" @change="emitFilters" />
          <span class="checkbox-text">
            <i class="fas fa-circle status-indicator not-started"></i>
            Chưa làm
          </span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="statusFilters.inProgress" @change="emitFilters" />
          <span class="checkbox-text">
            <i class="fas fa-circle status-indicator in-progress"></i>
            Đang làm
          </span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="statusFilters.submitted" @change="emitFilters" />
          <span class="checkbox-text">
            <i class="fas fa-circle status-indicator submitted"></i>
            Đã nộp
          </span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="statusFilters.graded" @change="emitFilters" />
          <span class="checkbox-text">
            <i class="fas fa-circle status-indicator graded"></i>
            Đã chấm
          </span>
        </label>
      </div>
    </div>

    <div class="filter-group">
      <label class="filter-label">Hạn nộp</label>
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="deadlineFilters.overdue" @change="emitFilters" />
          <span class="checkbox-text">
            <i class="fas fa-exclamation-triangle" style="color: #dc2626;"></i>
            Quá hạn
          </span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="deadlineFilters.today" @change="emitFilters" />
          <span class="checkbox-text">
            <i class="fas fa-calendar-day" style="color: #f59e0b;"></i>
            Hôm nay
          </span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="deadlineFilters.thisWeek" @change="emitFilters" />
          <span class="checkbox-text">
            <i class="fas fa-calendar-week" style="color: #06b6d4;"></i>
            Tuần này
          </span>
        </label>
      </div>
    </div>

    <div class="quick-stats">
      <div class="quick-stat-item">
        <span class="quick-stat-label">Tỷ lệ hoàn thành</span>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: completionRate + '%' }"
          ></div>
        </div>
        <span class="quick-stat-value">{{ completionRate }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  completionRate: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:filters']);

const localFilters = reactive({
  classId: props.filters.classId || '',
  type: props.filters.type || ''
});

const statusFilters = reactive({
  notStarted: false,
  inProgress: false,
  submitted: false,
  graded: false
});

const deadlineFilters = reactive({
  overdue: false,
  today: false,
  thisWeek: false
});

const emitFilters = () => {
  const activeStatuses = Object.entries(statusFilters)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  const activeDeadlines = Object.entries(deadlineFilters)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  emit('update:filters', {
    ...localFilters,
    statuses: activeStatuses,
    deadlines: activeDeadlines
  });
};

const resetFilters = () => {
  localFilters.classId = '';
  localFilters.type = '';
  statusFilters.notStarted = false;
  statusFilters.inProgress = false;
  statusFilters.submitted = false;
  statusFilters.graded = false;
  deadlineFilters.overdue = false;
  deadlineFilters.today = false;
  deadlineFilters.thisWeek = false;
  emitFilters();
};
</script>

<style scoped>
.filters-sidebar {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.filters-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filters-header h3 i {
  color: #667eea;
}

.btn-reset {
  background: #f1f5f9;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #e2e8f0;
  color: #475569;
}

.filter-group {
  margin-bottom: 24px;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 10px;
}

.filter-select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: #cbd5e1;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
  margin-right: 10px;
}

.checkbox-text {
  font-size: 14px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  font-size: 8px;
}

.status-indicator.not-started {
  color: #94a3b8;
}

.status-indicator.in-progress {
  color: #f59e0b;
}

.status-indicator.submitted {
  color: #06b6d4;
}

.status-indicator.graded {
  color: #10b981;
}

.quick-stats {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #f1f5f9;
}

.quick-stat-item {
  text-align: center;
}

.quick-stat-label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 10px;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.quick-stat-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}

@media (max-width: 992px) {
  .filters-sidebar {
    position: static;
  }
}
</style>
