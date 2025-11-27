<template>
  <div ref="bulkRef" class="bulk-actions" :class="{ dragging }" :style="containerStyle" @mousedown.stop="startDrag" @touchstart.stop.prevent="startTouch">
    <div class="bulk-info">
      <div class="drag-handle" title="Kéo để di chuyển" @mousedown.stop.prevent="startDrag" @touchstart.stop.prevent="startTouch">
        <i class="fas fa-arrows-alt"></i>
      </div>
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
  ],
  data() {
    return {
      pos: { x: 0, y: 0 },
      dragging: false,
      dragOffset: { x: 0, y: 0 },
      savedKey: 'bulkActionsPosition'
    }
  },
  computed: {
    containerStyle() {
      return {
        left: this.pos.x + 'px',
        top: this.pos.y + 'px',
        right: 'auto',
        bottom: 'auto'
      }
    }
  },
  mounted() {
    this.initPosition()
    window.addEventListener('resize', this.handleWindowResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleWindowResize)
    this.removeWindowDragListeners()
  },
  methods: {
    initPosition() {
      const stored = localStorage.getItem(this.savedKey)
      const el = this.$refs.bulkRef
      if (!el) return

      // compute centered default if none
      const width = el.offsetWidth || 360
      const height = el.offsetHeight || 56
      const defaultX = Math.max(8, Math.round((window.innerWidth - width) / 2))
      const defaultY = Math.max(8, window.innerHeight - height - 20)
      // on small screens, prefer pinned to bottom with left padding
      const mobileDefault = (window.innerWidth <= 768)
        ? { x: 10, y: Math.max(8, window.innerHeight - height - 20) }
        : null

      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // clamp to viewport bounds
          const clamped = this.clampToViewport(parsed.x, parsed.y, width, height)
          this.pos = clamped
        } catch (err) {
          this.pos = { x: defaultX, y: defaultY }
        }
      } else {
        this.pos = mobileDefault || { x: defaultX, y: defaultY }
      }
    },
    clampToViewport(x, y, width, height) {
      const minX = 8
      const minY = 8
      const maxX = Math.max(minX, window.innerWidth - width - 8)
      const maxY = Math.max(minY, window.innerHeight - height - 8)
      return {
        x: Math.min(Math.max(minX, x), maxX),
        y: Math.min(Math.max(minY, y), maxY)
      }
    },
    startDrag(e) {
      // don't start dragging if user clicked on a button or link
      const ignoreEl = e.target.closest && e.target.closest('button, a, input, textarea, select, label')
      if (ignoreEl) return
      if (e.button !== undefined && e.button !== 0) return // only left click
      const el = this.$refs.bulkRef
      if (!el) return
      this.dragging = true
      this.dragOffset = { x: e.clientX - this.pos.x, y: e.clientY - this.pos.y }
      document.body.style.userSelect = 'none'
      window.addEventListener('mousemove', this.onDrag)
      window.addEventListener('mouseup', this.endDrag)
    },
    startTouch(e) {
      const touch = e.touches[0]
      const el = this.$refs.bulkRef
      if (!el || !touch) return
      this.dragging = true
      this.dragOffset = { x: touch.clientX - this.pos.x, y: touch.clientY - this.pos.y }
      document.body.style.userSelect = 'none'
      window.addEventListener('touchmove', this.onTouchDrag, { passive: false })
      window.addEventListener('touchend', this.endDrag)
    },
    onDrag(e) {
      if (!this.dragging) return
      const el = this.$refs.bulkRef
      if (!el) return
      const newX = e.clientX - this.dragOffset.x
      const newY = e.clientY - this.dragOffset.y
      const clamped = this.clampToViewport(newX, newY, el.offsetWidth, el.offsetHeight)
      this.pos = clamped
    },
    onTouchDrag(e) {
      if (!this.dragging) return
      e.preventDefault()
      const touch = e.touches[0]
      const el = this.$refs.bulkRef
      if (!el || !touch) return
      const newX = touch.clientX - this.dragOffset.x
      const newY = touch.clientY - this.dragOffset.y
      const clamped = this.clampToViewport(newX, newY, el.offsetWidth, el.offsetHeight)
      this.pos = clamped
    },
    endDrag() {
      if (!this.dragging) return
      this.dragging = false
      this.removeWindowDragListeners()
      document.body.style.userSelect = ''
      localStorage.setItem(this.savedKey, JSON.stringify(this.pos))
    },
    removeWindowDragListeners() {
      window.removeEventListener('mousemove', this.onDrag)
      window.removeEventListener('mouseup', this.endDrag)
      window.removeEventListener('touchmove', this.onTouchDrag)
      window.removeEventListener('touchend', this.endDrag)
    },
    handleWindowResize() {
      const el = this.$refs.bulkRef
      if (!el) return
      const clamped = this.clampToViewport(this.pos.x, this.pos.y, el.offsetWidth, el.offsetHeight)
      this.pos = clamped
      localStorage.setItem(this.savedKey, JSON.stringify(this.pos))
    }
  }
}
</script>

<style scoped>
.bulk-actions {
  position: fixed;
  /* initial pos controlled by inline style */
  background: white;
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
  touch-action: none;
  cursor: grab;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bulk-info {
  display: flex;
  align-items: center;
}

.drag-handle {
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #fbfaf8;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  cursor: grab;
  user-select: none;
}

.drag-handle:active { cursor: grabbing }

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

.bulk-actions.dragging {
  cursor: grabbing;
  opacity: 0.95;
  transform: none !important;
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