<template>
  <div class="bulk-actions">
    <div class="bulk-info">
      <div class="selected-count">
        <i class="fas fa-check-circle"></i>
        Đã chọn {{ selectedCount }} môn học
      </div>
    </div>
    
    <div class="bulk-buttons">
      <button @click="$emit('bulk:assign-teacher')" class="bulk-btn teacher">
        <i class="fas fa-chalkboard-teacher"></i>
        Gán giáo viên
      </button>
      
      <button @click="$emit('bulk:assign-room')" class="bulk-btn room">
        <i class="fas fa-door-open"></i>
        Gán phòng học
      </button>
      
      <button @click="$emit('bulk:toggle-registration')" class="bulk-btn registration">
        <i class="fas fa-user-plus"></i>
        Bật/Tắt đăng ký
      </button>
      
      <button @click="$emit('bulk:delete')" class="bulk-btn delete">
        <i class="fas fa-trash"></i>
        Xóa tất cả
      </button>
      
      <button @click="$emit('clear-selection')" class="bulk-btn clear">
        <i class="fas fa-times"></i>
        Bỏ chọn
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BulkActions',
  props: {
    selectedCount: {
      type: Number,
      required: true
    }
  },
  emits: [
    'bulk:delete',
    'bulk:assign-teacher', 
    'bulk:assign-room',
    'bulk:toggle-registration',
    'clear-selection'
  ]
}
</script>

<style scoped>
.bulk-actions {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 100;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.bulk-info {
  display: flex;
  align-items: center;
}

.selected-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
}

.selected-count i {
  color: #10b981;
}

.bulk-buttons {
  display: flex;
  gap: 8px;
}

.bulk-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.bulk-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.bulk-btn.teacher {
  color: #f59e0b;
  border-color: #fbbf24;
}

.bulk-btn.teacher:hover {
  background: #fef3c7;
}

.bulk-btn.room {
  color: #8b5cf6;
  border-color: #a78bfa;
}

.bulk-btn.room:hover {
  background: #f3e8ff;
}

.bulk-btn.registration {
  color: #06b6d4;
  border-color: #22d3ee;
}

.bulk-btn.registration:hover {
  background: #cffafe;
}

.bulk-btn.delete {
  color: #ef4444;
  border-color: #f87171;
}

.bulk-btn.delete:hover {
  background: #fef2f2;
}

.bulk-btn.clear {
  color: #6b7280;
  border-color: #9ca3af;
}

.bulk-btn.clear:hover {
  background: #f9fafb;
}

/* Responsive */
@media (max-width: 768px) {
  .bulk-actions {
    left: 10px;
    right: 10px;
    transform: none;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }
  
  .bulk-buttons {
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }
  
  .bulk-btn {
    font-size: 12px;
    padding: 6px 10px;
  }
}
</style>