<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-door-open"></i>
          Gán phòng học cho {{ subjects.length }} môn học
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Selected Subjects List -->
        <div class="selected-subjects">
          <h4>
            <i class="fas fa-list"></i>
            Môn học đã chọn
          </h4>
          <div class="subjects-list">
            <div 
              v-for="subject in subjects" 
              :key="subject.id" 
              class="subject-item"
            >
              <div class="subject-info">
                <span class="subject-code">{{ subject.code }}</span>
                <span class="subject-name">{{ subject.name }}</span>
              </div>
              <div class="current-room">
                <span v-if="subject.roomId" class="has-room">
                  <i class="fas fa-door-open"></i>
                  {{ subject.roomName }}
                </span>
                <span v-else class="no-room">
                  <i class="fas fa-door-closed"></i>
                  Chưa có phòng
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Room Selection -->
        <div class="room-selection">
          <h4>
            <i class="fas fa-building"></i>
            Chọn phòng học
          </h4>
          
          <!-- Base / Floor Selector -->
          <div class="selector-row" v-if="bases && bases.length">
            <div class="selector-base">
              <label>Chọn cơ sở</label>
              <div class="selector-control">
                <select v-model="selectedBase">
                <option value="">-- Chọn cơ sở --</option>
                <option v-for="b in bases" :key="b.base_id" :value="b.base_code">
                  {{ b.base_code }} - {{ b.base_name }}
                </option>
                </select>
                <button v-if="selectedBase" @click="clearBase" class="btn-clear" title="Xóa cơ sở">×</button>
              </div>
              <span v-if="basesLoading" class="loading-text">Đang tải cơ sở...</span>
            </div>

            <div class="selector-floor">
              <label>Chọn tầng</label>
              <div class="selector-control">
                <select v-model="selectedFloor" :disabled="!selectedBase || !(floorsByBase[selectedBase] && floorsByBase[selectedBase].length)">
                <option value="">-- Chọn tầng --</option>
                <option v-for="f in (floorsByBase[selectedBase] || [])" :key="f.floor_id" :value="f.floor_number">
                  {{ f.floor_name || ('Lầu ' + f.floor_number) }}
                </option>
                </select>
                <button v-if="selectedFloor" @click="clearFloor" class="btn-clear" title="Xóa tầng">×</button>
              </div>
              <span v-if="selectedBase && !(floorsByBase[selectedBase] && floorsByBase[selectedBase].length)" class="loading-text">Không có tầng cho cơ sở này</span>
            </div>
          </div>
      
          <!-- Rooms Grid -->
          <div class="rooms-grid">
            <div v-if="!selectedBase && !fetchedRooms.length" class="no-selection">
              <i class="fas fa-info-circle"></i>
              <p>Chọn cơ sở và tầng để tải danh sách phòng.</p>
            </div>
            <div 
              v-for="room in fetchedRooms" 
              :key="room.room_id || room.id"
              class="room-card"
              :class="{ selected: selectedRoomId === (room.room_id || room.id) }"
              @click="selectRoom(room)"
            >
              <div class="room-header">
                <div class="room-name">{{ (room.room_name || room.name) }}</div>
                <div class="room-building">{{ roomLabel(room) }}</div>
              </div>
              

              <div class="selection-indicator">
                <i v-if="selectedRoomId === (room.room_id || room.id)" class="fas fa-check-circle"></i>
                <i v-else class="far fa-circle"></i>
              </div>
            </div>
            
            <!-- No Room Option -->
            <div 
              class="room-card no-room-option"
              :class="{ selected: selectedRoomId === null }"
              @click="selectRoom(null)"
            >
              <div class="room-header">
                <div class="room-name">Không gán phòng học</div>
                <div class="room-building">Hệ thống</div>
              </div>
              
              <div class="room-details">
                <div class="description">Bỏ gán phòng học khỏi các môn học đã chọn</div>
              </div>
              
              <div class="selection-indicator">
                <i v-if="selectedRoomId === null" class="fas fa-check-circle"></i>
                <i v-else class="far fa-circle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">
          <i class="fas fa-times"></i>
          Hủy bỏ
        </button>
        <button @click="handleSave" class="btn-save" :disabled="selectedRoomId === undefined">
          <i class="fas fa-save"></i>
          Gán phòng học
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRooms } from '@/hooks/useRooms'

export default {
  name: 'RoomAssignModal',
  props: {
    subjects: {
      type: Array,
      required: true
    },
    rooms: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const selectedBuilding = ref('')
    const selectedType = ref('')
    const selectedRoomId = ref(undefined)
    const selectedBase = ref('')
    const selectedFloor = ref(null)
    
    const { bases, basesLoading, fetchBases, fetchFloorsByBaseCode, fetchRoomsByBaseAndFloor, floorsByBase, roomsByFloor, parseRoomCode } = useRooms()
    
    const fetchedRooms = ref([])

    const roomLabel = (room) => {
      if (!room) return ''
      const code = room.room_code || room.roomCode || room.room_code || room.code || room.name || ''
      const parsed = parseRoomCode(code)
      const baseName = parsed && parsed.base_code ? (bases.value.find(b => b.base_code === parsed.base_code)?.base_name || `Cơ sở ${parsed.base_code}`) : (room.base_name || room.building || '')
      const floorName = parsed && parsed.floor_number ? `Lầu ${parsed.floor_number}` : (room.floor_number ? `Lầu ${room.floor_number}` : '')
      const roomName = room.room_name || room.room_code || room.name || code
      return `${baseName}${floorName ? ' -> ' + floorName : ''}${roomName ? ' - Phòng ' + roomName : ''}`
    }

    const selectRoom = (room) => {
      selectedRoomId.value = room ? (room.room_id || room.id || null) : null
      // set base / floor for UI if room contains room_code or base/floor info
      if (room && room.room_code) {
        const parsed = parseRoomCode(room.room_code || room.name || '')
        if (parsed?.base_code) selectedBase.value = parsed.base_code
        if (parsed?.floor_number) selectedFloor.value = parsed.floor_number
      }
    }

    const clearBase = () => {
      selectedBase.value = ''
      selectedFloor.value = null
      fetchedRooms.value = []
      selectedRoomId.value = undefined
    }

    const clearFloor = () => {
      selectedFloor.value = null
      fetchedRooms.value = []
      selectedRoomId.value = undefined
    }
    
    const handleSave = () => {
      if (selectedRoomId.value === undefined) return
      
      const roomData = (() => {
        if (selectedRoomId.value === null) return { roomId: null, roomName: null }
        // try to find room in fetched rooms first
        const rn = (fetchedRooms.value.find(r => (r.room_id || r.id) === selectedRoomId.value) || (props.rooms || []).find(r => (r.room_id || r.id) === selectedRoomId.value)) || null
        return { roomId: selectedRoomId.value, roomName: rn ? (rn.room_name || rn.room_code || rn.name || '') : undefined, room: rn }
      })()
      
      emit('save', roomData)
    }
    
    const handleOverlayClick = () => {
      emit('close')
    }

    // --- Load initial bases and fallback rooms ---
    onMounted(async () => {
      try {
        await fetchBases()
      } catch (e) {
        console.debug('fetch bases failed', e)
      }
    })

    watch(selectedBase, async (base) => {
      if (base) {
        // clear old floor and selected room
        selectedFloor.value = null
        fetchedRooms.value = []
        try {
          await fetchFloorsByBaseCode(base)
        } catch (e) {
          console.debug('fetch floors failed', e)
        }
      }
    })

    watch(selectedFloor, async (fl) => {
      if (!fl || !selectedBase.value) return
      // fetch rooms for base + floor number
      try {
        const r = await fetchRoomsByBaseAndFloor(selectedBase.value, fl)
        fetchedRooms.value = Array.isArray(r) ? r : (r.rooms || [])
      } catch (e) {
        console.debug('fetch rooms failed', e)
        fetchedRooms.value = []
      }
    })
    
    return {
      selectedRoomId,
      selectedBase,
      selectedFloor,
      bases,
      basesLoading,
      floorsByBase,
      fetchedRooms,
      roomLabel,
      selectRoom,
      handleSave,
      handleOverlayClick,
      clearBase,
      clearFloor
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
   z-index: 100001;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.modal-header h3 i {
  color: #8b5cf6;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.selected-subjects h4,
.room-selection h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.selected-subjects h4 i {
  color: #3b82f6;
}

.room-selection h4 i {
  color: #8b5cf6;
}

.subjects-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.subject-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.subject-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.subject-code {
  font-family: monospace;
  font-size: 12px;
  background: #f3f4f6;
  padding: 2px 4px;
  border-radius: 4px;
  color: #374151;
}

.subject-name {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
}

.current-room {
  font-size: 12px;
}

.has-room {
  color: #059669;
  display: flex;
  align-items: center;
  gap: 4px;
}

.no-room {
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 4px;
}

.search-filter {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  margin-bottom: 16px;
}

.selector-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: flex-end;
}
.selector-base label, .selector-floor label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  display: block;
}
.selector-control {
  display: flex;
  align-items: center;
  gap: 8px;
}
.selector-control select {
  min-width: 200px;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.btn-clear {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  font-weight: 700;
}
.btn-clear:hover { background: #f3f4f6; color: #374151; }
.loading-text {
  color: #9ca3af;
  font-size: 12px;
  margin-left: 8px;
}
.no-selection {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 16px;
  color: #64748b;
}

.search-input {
  position: relative;
}

.search-input i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.search-input input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-building select,
.filter-type select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 140px;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.room-card {
  position: relative;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.room-card:hover {
  border-color: #8b5cf6;
  background: #f9fafb;
}

.room-card.selected {
  border-color: #8b5cf6;
  background: #f3e8ff;
}

.room-card.no-room-option {
  border-style: dashed;
  border-color: #9ca3af;
}

.room-card.no-room-option:hover {
  border-color: #ef4444;
  background: #fef2f2;
}

.room-card.no-room-option.selected {
  border-color: #ef4444;
  background: #fef2f2;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.room-name {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.room-building {
  font-size: 12px;
  color: #8b5cf6;
  background: #f3e8ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.room-details {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.room-capacity,
.room-type {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.room-capacity i {
  color: #3b82f6;
}

.room-type i {
  color: #f59e0b;
}

.description {
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
}

.room-equipment {
  margin-bottom: 12px;
}

.equipment-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.equipment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.equipment-item {
  font-size: 11px;
  background: #e0e7ff;
  color: #3730a3;
  padding: 2px 6px;
  border-radius: 4px;
}

.selection-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 18px;
}

.room-card.selected .selection-indicator {
  color: #8b5cf6;
}

.room-card.no-room-option.selected .selection-indicator {
  color: #ef4444;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #9ca3af;
  text-align: center;
  grid-column: 1 / -1;
}

.no-results i {
  font-size: 32px;
  margin-bottom: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-cancel {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #8b5cf6;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #7c3aed;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 10px;
    max-width: none;
  }
  
  .search-filter {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .rooms-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .subject-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .room-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .room-details {
    flex-direction: column;
    gap: 8px;
  }
}
</style>