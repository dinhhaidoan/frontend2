<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="semester-modal" @click.stop>
      <div class="modal-header">
        <h3>{{ mode === 'create' ? 'Tạo học kỳ mới' : 'Chỉnh sửa học kỳ' }}</h3>
        <button @click="closeModal" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="semesterName">Tên học kỳ</label>
            <input 
              id="semesterName"
              type="text" 
              v-model="form.name"
              placeholder="VD: Học kỳ 1 - Năm 1"
              required
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Ngày bắt đầu</label>
              <input 
                id="startDate"
                type="date" 
                v-model="form.startDate"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="endDate">Ngày kết thúc</label>
              <input 
                id="endDate"
                type="date" 
                v-model="form.endDate"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="maxCredits">Số tín chỉ tối đa</label>
            <input 
              id="maxCredits"
              type="number" 
              v-model="form.maxCredits"
              min="10"
              max="30"
              required
            />
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button @click="closeModal" class="btn-cancel">
          Hủy
        </button>
        <button @click="handleSubmit" class="btn-primary">
          <i :class="mode === 'create' ? 'fas fa-plus' : 'fas fa-save'"></i>
          {{ mode === 'create' ? 'Tạo học kỳ' : 'Cập nhật' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'create' // 'create' or 'edit'
  },
  semester: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'save'])

// Form data
const form = reactive({
  id: null,
  name: '',
  startDate: '',
  endDate: '',
  maxCredits: 20
})

// Watch for semester prop changes to populate form
watch(() => props.semester, (newSemester) => {
  if (newSemester && props.mode === 'edit') {
    Object.assign(form, {
      id: newSemester.id,
      name: newSemester.name,
      startDate: newSemester.startDate,
      endDate: newSemester.endDate,
      maxCredits: newSemester.maxCredits
    })
  } else {
    // Reset form for create mode
    Object.assign(form, {
      id: null,
      name: '',
      startDate: '',
      endDate: '',
      maxCredits: 20
    })
  }
}, { immediate: true })

// Methods
const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  // Validate form
  if (!form.name || !form.startDate || !form.endDate) {
    alert('Vui lòng điền đầy đủ thông tin bắt buộc')
    return
  }

  // Check date logic
  if (new Date(form.endDate) <= new Date(form.startDate)) {
    alert('Ngày kết thúc phải sau ngày bắt đầu')
    return
  }

  // Emit save event with form data
  emit('save', { ...form })
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
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.semester-modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 32px 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-cancel,
.btn-primary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 2px solid transparent;
}

.btn-cancel {
  background: white;
  color: #6b7280;
  border-color: #e5e7eb;
}

.btn-cancel:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .semester-modal {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>