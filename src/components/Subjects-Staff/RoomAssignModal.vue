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
          
          <!-- Search and Filter -->
          <div class="search-filter">
            <div class="search-input">
              <i class="fas fa-search"></i>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Tìm kiếm phòng học theo tên hoặc tòa nhà..."
              />
            </div>
            
            <div class="filter-building">
              <select v-model="selectedBuilding">
                <option value="">Tất cả tòa nhà</option>
                <option v-for="building in buildings" :key="building" :value="building">
                  {{ building }}
                </option>
              </select>
            </div>
            
            <div class="filter-type">
              <select v-model="selectedType">
                <option value="">Tất cả loại phòng</option>
                <option value="Lý thuyết">Lý thuyết</option>
                <option value="Thực hành">Thực hành</option>
                <option value="Máy tính">Máy tính</option>
                <option value="Hội thảo">Hội thảo</option>
              </select>
            </div>
          </div>
          
          <!-- Rooms Grid -->
          <div class="rooms-grid">
            <div 
              v-for="room in filteredRooms" 
              :key="room.id"
              class="room-card"
              :class="{ selected: selectedRoomId === room.id }"
              @click="selectRoom(room)"
            >
              <div class="room-header">
                <div class="room-name">{{ room.name }}</div>
                <div class="room-building">{{ room.building }}</div>
              </div>
              
              <div class="room-details">
                <div class="room-capacity">
                  <i class="fas fa-users"></i>
                  {{ room.capacity }} chỗ
                </div>
                <div class="room-type">
                  <i class="fas fa-tag"></i>
                  {{ room.type }}
                </div>
              </div>
              
              <div class="room-equipment" v-if="room.equipment && room.equipment.length > 0">
                <div class="equipment-label">Thiết bị:</div>
                <div class="equipment-list">
                  <span 
                    v-for="equipment in room.equipment" 
                    :key="equipment"
                    class="equipment-item"
                  >
                    {{ equipment }}
                  </span>
                </div>
              </div>
              
              <div class="selection-indicator">
                <i v-if="selectedRoomId === room.id" class="fas fa-check-circle"></i>
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
          
          <!-- No Results -->
          <div v-if="filteredRooms.length === 0 && (searchQuery || selectedBuilding || selectedType)" class="no-results">
            <i class="fas fa-search"></i>
            <p>Không tìm thấy phòng học nào phù hợp</p>
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
import { ref, computed } from 'vue'

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
    
    const buildings = computed(() => {
      const uniqueBuildings = [...new Set(props.rooms.map(room => room.building))]
      return uniqueBuildings.sort()
    })
    
    const filteredRooms = computed(() => {
      let result = props.rooms
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(room => 
          room.name.toLowerCase().includes(query) ||
          room.building.toLowerCase().includes(query) ||
          (room.equipment && room.equipment.some(eq => eq.toLowerCase().includes(query)))
        )
      }
      
      if (selectedBuilding.value) {
        result = result.filter(room => room.building === selectedBuilding.value)
      }
      
      if (selectedType.value) {
        result = result.filter(room => room.type === selectedType.value)
      }
      
      return result
    })
    
    const selectRoom = (room) => {
      selectedRoomId.value = room ? room.id : null
    }
    
    const handleSave = () => {
      if (selectedRoomId.value === undefined) return
      
      const roomData = {
        roomId: selectedRoomId.value,
        roomName: selectedRoomId.value ? 
          props.rooms.find(r => r.id === selectedRoomId.value)?.name : null
      }
      
      emit('save', roomData)
    }
    
    const handleOverlayClick = () => {
      emit('close')
    }
    
    return {
      searchQuery,
      selectedBuilding,
      selectedType,
      selectedRoomId,
      buildings,
      filteredRooms,
      selectRoom,
      handleSave,
      handleOverlayClick
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