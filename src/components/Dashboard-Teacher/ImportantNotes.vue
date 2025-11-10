<template>
  <div class="card notes-card">
    <h2>Ghi chú quan trọng</h2>
    <div class="list-items">
      <div v-for="note in importantNotes" :key="note.id" class="list-item note-item">
        <div class="note-priority" :class="'priority-' + note.priority">
          <i class="fas fa-star"></i>
        </div>
        <div class="list-content" style="flex: 1">
          <div class="list-title">{{ note.title }}</div>
          <div class="list-meta">{{ note.content }}</div>
        </div>
        <button class="btn-icon" @click="$emit('edit')" title="Chỉnh sửa">
          <i class="fas fa-edit"></i>
        </button>
      </div>
      <div v-if="!importantNotes.length" class="empty-state">Không có ghi chú quan trọng</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  importantNotes: { type: Array, required: true }
})

defineEmits(['edit'])
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

.note-item {
  display: flex !important;
  align-items: center;
}

.note-priority {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  color: white;
  margin-right: 4px;
}

.note-priority.priority-high {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.note-priority.priority-medium {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.note-priority.priority-low {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
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
