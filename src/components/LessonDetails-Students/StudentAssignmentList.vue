<template>
  <div class="assignments-container">
    <div v-if="filteredAssignments.length === 0" class="empty-state">
      <i class="fas fa-inbox"></i>
      <h3>Không tìm thấy bài tập</h3>
      <p>Thử thay đổi bộ lọc để xem các bài tập khác</p>
    </div>

    <div v-else class="assignments-grid">
      <div 
        v-for="assignment in filteredAssignments" 
        :key="assignment.id"
        class="assignment-card"
        @click="$emit('view-assignment', assignment)"
      >
        <!-- Header -->
        <div class="assignment-header">
          <div class="assignment-title-section">
            <h3 class="assignment-title">{{ assignment.title }}</h3>
            <span class="assignment-class">{{ assignment.className }}</span>
          </div>
          <span :class="['status-badge', assignment.studentStatus]">
            {{ getStatusLabel(assignment.studentStatus) }}
          </span>
        </div>

        <!-- Type and Deadline -->
        <div class="assignment-meta">
          <span :class="['type-badge', assignment.type]">
            <i :class="getTypeIcon(assignment.type)"></i>
            {{ getTypeLabel(assignment.type) }}
          </span>
          <span :class="['deadline-badge', getDeadlineStatus(assignment.deadline)]">
            <i class="fas fa-clock"></i>
            {{ formatDeadline(assignment.deadline) }}
          </span>
        </div>

        <!-- Description -->
        <p v-if="assignment.description" class="assignment-description">
          {{ truncateText(assignment.description, 100) }}
        </p>

        <!-- Student Progress -->
        <div class="student-progress">
          <div class="progress-row">
            <span class="progress-label">
              <i class="fas fa-tasks"></i>
              Tiến độ
            </span>
            <span class="progress-value">{{ assignment.studentProgress || 0 }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: (assignment.studentProgress || 0) + '%' }"
            ></div>
          </div>
        </div>

        <!-- Score (if graded) -->
        <div v-if="assignment.studentStatus === 'graded' && assignment.studentScore !== null" class="score-section">
          <div class="score-display">
            <i class="fas fa-star"></i>
            <span class="score">{{ assignment.studentScore }}/{{ assignment.maxScore }}</span>
          </div>
          <div class="score-bar">
            <div 
              class="score-fill"
              :style="{ 
                width: (assignment.studentScore / assignment.maxScore * 100) + '%',
                background: getScoreColor(assignment.studentScore / assignment.maxScore * 100)
              }"
            ></div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="assignment-footer">
          <div class="assignment-info">
            <span class="info-item">
              <i class="fas fa-question-circle"></i>
              {{ assignment.questions?.length || 0 }} câu hỏi
            </span>
            <span class="info-item">
              <i class="fas fa-chart-line"></i>
              {{ assignment.maxScore }} điểm
            </span>
          </div>
          <button class="btn-action">
            <span v-if="assignment.studentStatus === 'notStarted'">Bắt đầu</span>
            <span v-else-if="assignment.studentStatus === 'inProgress'">Tiếp tục</span>
            <span v-else-if="assignment.studentStatus === 'submitted'">Xem bài nộp</span>
            <span v-else>Xem kết quả</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  assignments: {
    type: Array,
    required: true
  },
  filters: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['view-assignment']);

const filteredAssignments = computed(() => {
  let result = [...props.assignments];

  // Filter by class
  if (props.filters.classId) {
    result = result.filter(a => a.classId === props.filters.classId);
  }

  // Filter by type
  if (props.filters.type) {
    result = result.filter(a => a.type === props.filters.type);
  }

  // Filter by statuses
  if (props.filters.statuses && props.filters.statuses.length > 0) {
    result = result.filter(a => props.filters.statuses.includes(a.studentStatus));
  }

  // Filter by deadlines
  if (props.filters.deadlines && props.filters.deadlines.length > 0) {
    result = result.filter(a => {
      const deadlineStatus = getDeadlineStatus(a.deadline);
      return props.filters.deadlines.some(d => {
        if (d === 'overdue') return deadlineStatus === 'overdue';
        if (d === 'today') return deadlineStatus === 'today';
        if (d === 'thisWeek') return deadlineStatus === 'soon';
        return false;
      });
    });
  }

  return result;
});

const getStatusLabel = (status) => {
  const labels = {
    notStarted: 'Chưa làm',
    inProgress: 'Đang làm',
    submitted: 'Đã nộp',
    graded: 'Đã chấm'
  };
  return labels[status] || status;
};

const getTypeLabel = (type) => {
  const labels = {
    essay: 'Tự luận',
    'multiple-choice': 'Trắc nghiệm',
    mixed: 'Hỗn hợp'
  };
  return labels[type] || type;
};

const getTypeIcon = (type) => {
  const icons = {
    essay: 'fas fa-pen',
    'multiple-choice': 'fas fa-list-ul',
    mixed: 'fas fa-tasks'
  };
  return icons[type] || 'fas fa-file';
};

const getDeadlineStatus = (deadline) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 7) return 'soon';
  return 'normal';
};

const formatDeadline = (deadline) => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Quá hạn ${Math.abs(diffDays)} ngày`;
  } else if (diffDays === 0) {
    return 'Hạn nộp hôm nay';
  } else if (diffDays === 1) {
    return 'Hạn nộp ngày mai';
  } else if (diffDays <= 7) {
    return `Còn ${diffDays} ngày`;
  } else {
    return deadlineDate.toLocaleDateString('vi-VN');
  }
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const getScoreColor = (percentage) => {
  if (percentage >= 80) return 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
  if (percentage >= 50) return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
  return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
};
</script>

<style scoped>
.assignments-container {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-state i {
  font-size: 64px;
  color: #cbd5e1;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 14px;
  color: #94a3b8;
}

.assignments-grid {
  display: grid;
  gap: 20px;
}

.assignment-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.assignment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
}

.assignment-title-section {
  flex: 1;
}

.assignment-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
  line-height: 1.4;
}

.assignment-class {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.notStarted {
  background: #f1f5f9;
  color: #64748b;
}

.status-badge.inProgress {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.submitted {
  background: #cffafe;
  color: #0891b2;
}

.status-badge.graded {
  background: #d1fae5;
  color: #059669;
}

.assignment-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.type-badge,
.deadline-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.type-badge {
  background: #ede9fe;
  color: #7c3aed;
}

.deadline-badge {
  background: #e0e7ff;
  color: #4f46e5;
}

.deadline-badge.overdue {
  background: #fee2e2;
  color: #dc2626;
}

.deadline-badge.today {
  background: #fef3c7;
  color: #d97706;
}

.deadline-badge.soon {
  background: #cffafe;
  color: #0891b2;
}

.assignment-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 16px;
}

.student-progress {
  margin-bottom: 16px;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.progress-value {
  font-size: 13px;
  font-weight: 700;
  color: #667eea;
}

.progress-bar {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.score-section {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.score-display i {
  color: #f59e0b;
  font-size: 16px;
}

.score {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.score-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.assignment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.assignment-info {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.info-item {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-item i {
  color: #94a3b8;
}

.btn-action {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-action:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .assignment-card {
    padding: 20px;
  }

  .assignment-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .assignment-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-action {
    justify-content: center;
  }
}
</style>
