<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2><i class="fas fa-file-import"></i> Import danh sách sinh viên</h2>
        <button @click="close" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="import-steps">
          <!-- Step 1: Download Template -->
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Tải file mẫu</h3>
              <p>Tải xuống file Excel mẫu và điền thông tin sinh viên</p>
              <button @click="downloadTemplate" class="btn-download">
                <i class="fas fa-download"></i> Tải file mẫu
              </button>
            </div>
          </div>

          <!-- Step 2: Fill Data -->
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Điền thông tin</h3>
              <p>Điền đầy đủ thông tin sinh viên vào file Excel theo mẫu</p>
              <div class="info-box">
                <i class="fas fa-info-circle"></i>
                <div>
                  <strong>Lưu ý:</strong>
                  <ul>
                    <li>Mã sinh viên là bắt buộc và duy nhất</li>
                    <li>Email phải đúng định dạng</li>
                    <li>Ngày tháng theo định dạng: DD/MM/YYYY</li>
                    <li>Trạng thái: studying, reserved, suspended, graduated</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Upload File -->
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Tải lên file dữ liệu</h3>
              <p>Chọn file Excel đã điền thông tin để import</p>
              
              <div
                @drop.prevent="handleDrop"
                @dragover.prevent
                @dragenter="isDragging = true"
                @dragleave="isDragging = false"
                :class="{ dragging: isDragging }"
                class="upload-area"
              >
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Kéo thả file vào đây hoặc</p>
                <input
                  ref="fileInput"
                  type="file"
                  @change="handleFileSelect"
                  accept=".xlsx,.xls,.csv"
                  style="display: none"
                />
                <button @click="$refs.fileInput.click()" class="btn-browse">
                  Chọn file
                </button>
                <small>Hỗ trợ: .xlsx, .xls, .csv</small>
              </div>

              <div v-if="selectedFile" class="selected-file">
                <i class="fas fa-file-excel"></i>
                <div class="file-info">
                  <strong>{{ selectedFile.name }}</strong>
                  <small>{{ formatFileSize(selectedFile.size) }}</small>
                </div>
                <button @click="removeFile" class="btn-remove">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 4: Options -->
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>Tùy chọn import</h3>
              
              <div class="options">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="options.skipDuplicates" />
                  <span>Bỏ qua sinh viên đã tồn tại</span>
                </label>

                <label class="checkbox-label">
                  <input type="checkbox" v-model="options.updateExisting" />
                  <span>Cập nhật thông tin nếu đã tồn tại</span>
                </label>

                <label class="checkbox-label">
                  <input type="checkbox" v-model="options.sendWelcomeEmail" />
                  <span>Gửi email chào mừng cho sinh viên mới</span>
                </label>

                <label class="checkbox-label">
                  <input type="checkbox" v-model="options.createAccount" />
                  <span>Tự động tạo tài khoản đăng nhập</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Data -->
        <div v-if="previewData.length > 0" class="preview-section">
          <h3><i class="fas fa-eye"></i> Xem trước dữ liệu ({{ previewData.length }} bản ghi)</h3>
          
          <div class="preview-stats">
            <div class="stat-item success">
              <i class="fas fa-check-circle"></i>
              <span>{{ validCount }} hợp lệ</span>
            </div>
            <div class="stat-item error">
              <i class="fas fa-exclamation-circle"></i>
              <span>{{ errorCount }} lỗi</span>
            </div>
          </div>

          <div class="preview-table">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã SV</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Lớp</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, index) in previewData.slice(0, 10)"
                  :key="index"
                  :class="{ error: row.hasError }"
                >
                  <td>{{ index + 1 }}</td>
                  <td>{{ row.studentCode }}</td>
                  <td>{{ row.fullName }}</td>
                  <td>{{ row.email }}</td>
                  <td>{{ row.officialClass }}</td>
                  <td>
                    <span v-if="row.hasError" class="error-badge">
                      <i class="fas fa-times"></i> {{ row.error }}
                    </span>
                    <span v-else class="success-badge">
                      <i class="fas fa-check"></i> Hợp lệ
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="previewData.length > 10" class="preview-note">
              Hiển thị 10/{{ previewData.length }} bản ghi đầu tiên
            </p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="close" class="btn-cancel">
          <i class="fas fa-times"></i> Hủy
        </button>
        <button
          @click="handleImport"
          :disabled="!selectedFile || importing"
          class="btn-import"
        >
          <i :class="importing ? 'fas fa-spinner fa-spin' : 'fas fa-upload'"></i>
          {{ importing ? 'Đang import...' : 'Import dữ liệu' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'import'])

const isDragging = ref(false)
const selectedFile = ref(null)
const previewData = ref([])
const importing = ref(false)

const options = ref({
  skipDuplicates: true,
  updateExisting: false,
  sendWelcomeEmail: true,
  createAccount: true
})

const validCount = computed(() => {
  return previewData.value.filter((row) => !row.hasError).length
})

const errorCount = computed(() => {
  return previewData.value.filter((row) => row.hasError).length
})

const downloadTemplate = () => {
  // Create template data
  const template = [
    ['Mã SV', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'Email', 'SĐT', 'CCCD/CMND', 'Địa chỉ', 'Ngành', 'Khóa', 'Lớp', 'Trạng thái', 'Ngày nhập học'],
    ['2251052001', 'Nguyễn Văn A', '01/01/2004', 'male', 'student@example.com', '0123456789', '001234567890', 'TP.HCM', 'IT', '2022', '22IT1', 'studying', '01/09/2022'],
    ['2251052002', 'Trần Thị B', '15/05/2004', 'female', 'student2@example.com', '0987654321', '001234567891', 'Hà Nội', 'IT', '2022', '22IT1', 'studying', '01/09/2022']
  ]

  // Convert to CSV
  const csv = template.map((row) => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'mau_import_sinh_vien.csv'
  link.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    parseFile(file)
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    selectedFile.value = file
    parseFile(file)
  }
}

const removeFile = () => {
  selectedFile.value = null
  previewData.value = []
}

const parseFile = (file) => {
  // Mock parsing - In real app, use library like xlsx or papaparse
  // This is just a demo
  setTimeout(() => {
    previewData.value = [
      {
        studentCode: '2251052001',
        fullName: 'Nguyễn Văn A',
        email: 'student@example.com',
        officialClass: '22IT1',
        hasError: false
      },
      {
        studentCode: '2251052002',
        fullName: 'Trần Thị B',
        email: 'invalid-email',
        officialClass: '22IT1',
        hasError: true,
        error: 'Email không hợp lệ'
      }
    ]
  }, 500)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleImport = async () => {
  if (!selectedFile.value) return

  importing.value = true

  try {
    // Simulate import process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    emit('import', {
      file: selectedFile.value,
      data: previewData.value,
      options: options.value
    })

    close()
  } catch (error) {
    console.error('Import error:', error)
    alert('Có lỗi xảy ra khi import dữ liệu')
  } finally {
    importing.value = false
  }
}

const close = () => {
  selectedFile.value = null
  previewData.value = []
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.modal-header h2 i {
  margin-right: 10px;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.import-steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step {
  display: flex;
  gap: 20px;
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 1.1rem;
}

.step-content p {
  margin: 0 0 12px;
  color: #7f8c8d;
}

.btn-download {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-download:hover {
  background: #229954;
  transform: translateY(-2px);
}

.btn-download i {
  margin-right: 8px;
}

.info-box {
  background: #e3f2fd;
  border-left: 4px solid #1976d2;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  gap: 12px;
}

.info-box i {
  color: #1976d2;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-box strong {
  color: #1976d2;
  display: block;
  margin-bottom: 8px;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
}

.info-box li {
  margin-bottom: 4px;
  color: #34495e;
}

.upload-area {
  border: 3px dashed #bdc3c7;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-area.dragging {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-area i {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 16px;
}

.upload-area p {
  margin: 0 0 16px;
  color: #7f8c8d;
}

.btn-browse {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-browse:hover {
  background: #5568d3;
}

.upload-area small {
  display: block;
  margin-top: 12px;
  color: #95a5a6;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
}

.selected-file i {
  font-size: 2rem;
  color: #27ae60;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-info strong {
  color: #2c3e50;
}

.file-info small {
  color: #7f8c8d;
}

.btn-remove {
  background: #e74c3c;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-remove:hover {
  background: #c0392b;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s;
}

.checkbox-label:hover {
  background: #f8f9fa;
}

.checkbox-label input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.preview-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #ecf0f1;
}

.preview-section h3 {
  margin: 0 0 16px;
  color: #2c3e50;
}

.preview-section h3 i {
  color: #667eea;
  margin-right: 8px;
}

.preview-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
}

.stat-item.success {
  background: #c8e6c9;
  color: #2e7d32;
}

.stat-item.error {
  background: #ffcdd2;
  color: #c62828;
}

.preview-table {
  overflow-x: auto;
}

.preview-table table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table thead {
  background: #f8f9fa;
}

.preview-table th,
.preview-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.preview-table tbody tr.error {
  background: #ffebee;
}

.error-badge,
.success-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.error-badge {
  background: #ffcdd2;
  color: #c62828;
}

.success-badge {
  background: #c8e6c9;
  color: #2e7d32;
}

.preview-note {
  margin-top: 12px;
  color: #7f8c8d;
  font-style: italic;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 2px solid #ecf0f1;
}

.btn-cancel,
.btn-import {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-cancel:hover {
  background: #bdc3c7;
}

.btn-import {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-import:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-import:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .step {
    flex-direction: column;
  }
}
</style>
