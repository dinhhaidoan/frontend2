<template>
  <div class="registered-classes">
    <h3 class="section-title">
      <i class="fas fa-clipboard-check"></i>
      Môn học đã đăng ký
      <span class="count-badge">{{ registeredClasses.length }}</span>
    </h3>

    <div class="summary-info">
      <div class="summary-item">
        <span class="label">Tổng số tín chỉ:</span>
        <span class="value">{{ totalCredits }} TC</span>
      </div>
      <div class="summary-item">
        <span class="label">Tổng số môn:</span>
        <span class="value">{{ registeredClasses.length }} môn</span>
      </div>
    </div>

    <div v-if="registeredClasses.length > 0" class="registered-list">
      <div
        v-for="item in registeredClasses"
        :key="item.id"
        class="registered-item"
      >
        <div class="item-header">
          <div class="subject-info">
            <h4>{{ item.subjectName }}</h4>
            <span class="subject-code">{{ item.subjectCode }}</span>
            <span class="class-code">{{ item.className }}</span>
          </div>
          <div class="credits-badge">
            {{ item.credits }} TC
          </div>
        </div>

        <div class="item-details">
          <div class="detail-row">
            <i class="fas fa-user-tie"></i>
            <span>{{ item.teacher }}</span>
          </div>
          <div class="detail-row">
            <i class="fas fa-calendar-week"></i>
            <span>{{ formatSchedule(item.schedule) }}</span>
          </div>
          <div class="detail-row">
            <i class="fas fa-map-marker-alt"></i>
            <!-- Room display removed per UX request -->
          </div>
          <div class="detail-row">
            <i class="fas fa-clock"></i>
            <span>Đăng ký lúc: {{ formatDateTime(item.registeredAt) }}</span>
          </div>
        </div>

        <div class="item-actions">
          <button
            class="btn btn-view"
            @click="viewDetails(item)"
          >
            <i class="fas fa-eye"></i>
            Xem chi tiết
          </button>
          <button
            class="btn btn-cancel"
            @click="confirmCancel(item)"
          >
            <i class="fas fa-times-circle"></i>
            Hủy đăng ký
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="fas fa-clipboard-list"></i>
      <p>Bạn chưa đăng ký môn học nào</p>
      <small>Vui lòng chọn học kỳ và môn học để đăng ký</small>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  registeredClasses: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['cancel', 'view-details']);

const totalCredits = computed(() => {
  return props.registeredClasses.reduce((sum, item) => sum + item.credits, 0);
});

const formatSchedule = (schedule) => {
  if (!schedule || schedule.length === 0) return 'Chưa có lịch';
  
  return schedule.map(s => 
    `${s.dayOfWeek} (${s.startPeriod}-${s.endPeriod})`
  ).join(', ');
};

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString('vi-VN');
};

const viewDetails = (item) => {
  emit('view-details', item);
};

const confirmCancel = (item) => {
  emit('cancel', item);
};
</script>

<style scoped>
.registered-classes {
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
  color: #10b981;
}

.count-badge {
  background: #10b981;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-left: auto;
}

.summary-info {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: #f0fdf4;
  border-radius: 8px;
  border-left: 4px solid #10b981;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item .label {
  font-size: 13px;
  color: #6b7280;
}

.summary-item .value {
  font-size: 18px;
  font-weight: 600;
  color: #059669;
}

.registered-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.registered-item {
  border: 2px solid #d1fae5;
  border-radius: 8px;
  padding: 20px;
  background: #f0fdf4;
  transition: all 0.3s ease;
}

.registered-item:hover {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
  border-color: #10b981;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #d1fae5;
}

.subject-info h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subject-code,
.class-code {
  display: inline-block;
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #059669;
  margin-right: 8px;
}

.credits-badge {
  background: #10b981;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #374151;
}

.detail-row i {
  color: #6b7280;
  margin-top: 2px;
  min-width: 16px;
}

.item-actions {
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

.btn-view {
  background: white;
  color: #059669;
  border: 2px solid #10b981;
}

.btn-view:hover {
  background: #10b981;
  color: white;
}

.btn-cancel {
  background: white;
  color: #dc2626;
  border: 2px solid #ef4444;
}

.btn-cancel:hover {
  background: #ef4444;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #6b7280;
}

.empty-state small {
  font-size: 14px;
  color: #9ca3af;
}
</style>
