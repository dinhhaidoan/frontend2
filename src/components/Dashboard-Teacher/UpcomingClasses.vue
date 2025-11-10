<template>
  <div class="card upcoming-card">
    <h2>Lớp sắp tới</h2>
    <div class="list-items">
      <div v-for="cls in upcomingClasses" :key="cls.id" class="list-item">
        <div class="list-time">
          <div class="time">{{ cls.time }}</div>
          <div class="date">{{ cls.date }}</div>
        </div>
        <div class="list-content">
          <div class="list-title">{{ cls.subject }}</div>
          <div class="list-meta">{{ cls.class }}</div>
        </div>
        <button class="btn-icon" @click="$emit('view')" title="Xem lịch">
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
      <div v-if="!upcomingClasses.length" class="empty-state">Không có lớp sắp tới</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  upcomingClasses: { type: Array, required: true }
})

defineEmits(['view'])
</script>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 200ms ease;
}

.card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.card h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #0f172a;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 150ms ease;
}

.list-item:hover {
  background: #f3f4f6;
}

.list-time {
  text-align: center;
  min-width: 60px;
  font-size: 12px;
}

.list-time .time {
  font-weight: 700;
  color: #0f172a;
  font-size: 13px;
}

.list-time .date {
  color: #9ca3af;
  font-size: 11px;
}

.list-content {
  flex: 1;
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 2px;
}

.list-meta {
  font-size: 12px;
  color: #9ca3af;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  flex-shrink: 0;
}

.btn-icon:hover {
  background: #e5e7eb;
  color: #0f172a;
}

.empty-state {
  text-align: center;
  padding: 24px 12px;
  color: #9ca3af;
  font-size: 13px;
}
</style>
