<template>
  <div class="student-table-container">
    <!-- Toolbar -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <button @click="$emit('add')" class="btn-add">
          <i class="fas fa-plus"></i> Thêm sinh viên
        </button>
        <button @click="$emit('import')" class="btn-import">
          <i class="fas fa-file-import"></i> Import
        </button>
        <button @click="$emit('export')" class="btn-export">
          <i class="fas fa-file-export"></i> Export
        </button>
      </div>

      <div class="toolbar-right">
        <div class="view-options">
          <button
            @click="viewMode = 'table'"
            :class="{ active: viewMode === 'table' }"
            class="btn-view"
          >
            <i class="fas fa-table"></i>
          </button>
          <button
            @click="viewMode = 'grid'"
            :class="{ active: viewMode === 'grid' }"
            class="btn-view"
          >
            <i class="fas fa-th"></i>
          </button>
        </div>

        <select v-model="pageSize" @change="$emit('update:pageSize', pageSize)" class="page-size">
          <option :value="10">10 / trang</option>
          <option :value="25">25 / trang</option>
          <option :value="50">50 / trang</option>
          <option :value="100">100 / trang</option>
        </select>
      </div>
    </div>

    <!-- Table View -->
    <div v-if="viewMode === 'table'" class="table-wrapper">
      <table class="student-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" />
            </th>
            <th @click="sort('studentCode')">
              Mã SV
              <i class="fas fa-sort"></i>
            </th>
            <th @click="sort('fullName')">
              Họ và tên
              <i class="fas fa-sort"></i>
            </th>
            <th>Lớp</th>
            <th>Ngành</th>
            <th>Khóa</th>
            <th @click="sort('gpa')">
              GPA
              <i class="fas fa-sort"></i>
            </th>
            <th @click="sort('credits')">
              Tín chỉ
              <i class="fas fa-sort"></i>
            </th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="student in students"
            :key="student.id"
            :class="{ selected: isSelected(student.id) }"
          >
            <td>
              <input
                type="checkbox"
                :checked="isSelected(student.id)"
                @change="toggleSelect(student.id)"
              />
            </td>
            <td>
              <strong>{{ student.studentCode }}</strong>
            </td>
            <td>
              <div class="student-info">
                <img :src="student.avatar || '/default-avatar.png'" :alt="student.fullName" />
                <div>
                  <strong>{{ student.fullName }}</strong>
                  <small>{{ student.email }}</small>
                </div>
              </div>
            </td>
            <td>
              <span class="badge class-badge">{{ student.officialClass }}</span>
            </td>
            <td>{{ student.major }}</td>
            <td>K{{ student.course }}</td>
            <td>
              <span class="gpa-badge" :class="getGPAClass(student.gpa)">
                {{ student.gpa.toFixed(2) }}
              </span>
            </td>
            <td>
              <span class="credits-badge">{{ student.credits }} TC</span>
            </td>
            <td>
              <span class="status-badge" :class="student.status">
                {{ getStatusLabel(student.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="$emit('view', student)" class="btn-icon view" title="Xem chi tiết">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click="$emit('edit', student)" class="btn-icon edit" title="Chỉnh sửa">
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="$emit('delete', student)"
                  class="btn-icon delete"
                  title="Xóa"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="students.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Không tìm thấy sinh viên nào</p>
      </div>
    </div>

    <!-- Grid View -->
    <div v-else class="grid-view">
      <div v-for="student in students" :key="student.id" class="student-card">
        <div class="card-header">
          <img :src="student.avatar || '/default-avatar.png'" :alt="student.fullName" />
          <span class="status-badge" :class="student.status">
            {{ getStatusLabel(student.status) }}
          </span>
        </div>
        <div class="card-body">
          <h3>{{ student.fullName }}</h3>
          <p class="student-code">{{ student.studentCode }}</p>
          <div class="card-info">
            <div class="info-item">
              <i class="fas fa-users"></i>
              <span>{{ student.officialClass }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-graduation-cap"></i>
              <span>{{ student.major }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-chart-line"></i>
              <span>GPA: {{ student.gpa.toFixed(2) }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-award"></i>
              <span>{{ student.credits }} TC</span>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button @click="$emit('view', student)" class="btn-card">
            <i class="fas fa-eye"></i> Xem
          </button>
          <button @click="$emit('edit', student)" class="btn-card">
            <i class="fas fa-edit"></i> Sửa
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button @click="changePage(1)" :disabled="currentPage === 1" class="btn-page">
        <i class="fas fa-angle-double-left"></i>
      </button>
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="btn-page">
        <i class="fas fa-angle-left"></i>
      </button>

      <span class="page-info">
        Trang {{ currentPage }} / {{ totalPages }} ({{ totalItems }} sinh viên)
      </span>

      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="btn-page"
      >
        <i class="fas fa-angle-right"></i>
      </button>
      <button
        @click="changePage(totalPages)"
        :disabled="currentPage === totalPages"
        class="btn-page"
      >
        <i class="fas fa-angle-double-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  students: {
    type: Array,
    default: () => []
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 1
  },
  totalItems: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'add',
  'edit',
  'view',
  'delete',
  'import',
  'export',
  'page-change',
  'update:pageSize',
  'sort'
])

const viewMode = ref('table')
const pageSize = ref(25)
const selectedStudents = ref([])

const isAllSelected = computed(() => {
  return props.students.length > 0 && selectedStudents.value.length === props.students.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedStudents.value = []
  } else {
    selectedStudents.value = props.students.map((s) => s.id)
  }
}

const toggleSelect = (id) => {
  const index = selectedStudents.value.indexOf(id)
  if (index > -1) {
    selectedStudents.value.splice(index, 1)
  } else {
    selectedStudents.value.push(id)
  }
}

const isSelected = (id) => {
  return selectedStudents.value.includes(id)
}

const changePage = (page) => {
  emit('page-change', page)
}

const sort = (field) => {
  emit('sort', field)
}

const getStatusLabel = (status) => {
  const labels = {
    studying: 'Đang học',
    reserved: 'Bảo lưu',
    suspended: 'Nghỉ học',
    graduated: 'Tốt nghiệp',
    expelled: 'Thôi học'
  }
  return labels[status] || status
}

const getGPAClass = (gpa) => {
  if (gpa >= 3.6) return 'excellent'
  if (gpa >= 3.2) return 'good'
  if (gpa >= 2.5) return 'average'
  if (gpa >= 2.0) return 'fair'
  return 'poor'
}
</script>

<style scoped>
.student-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-add,
.btn-import,
.btn-export {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-add {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-import {
  background: #27ae60;
  color: white;
}

.btn-import:hover {
  background: #229954;
}

.btn-export {
  background: #3498db;
  color: white;
}

.btn-export:hover {
  background: #2980b9;
}

.view-options {
  display: flex;
  gap: 5px;
  background: white;
  border-radius: 8px;
  padding: 2px;
}

.btn-view {
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
}

.btn-view.active {
  background: #667eea;
  color: white;
}

.page-size {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.table-wrapper {
  overflow-x: auto;
}

.student-table {
  width: 100%;
  border-collapse: collapse;
}

.student-table thead {
  background: #f8f9fa;
}

.student-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.student-table th i {
  margin-left: 5px;
  color: #95a5a6;
}

.student-table tbody tr {
  border-bottom: 1px solid #ecf0f1;
  transition: all 0.3s;
}

.student-table tbody tr:hover {
  background: #f8f9fa;
}

.student-table tbody tr.selected {
  background: #e3f2fd;
}

.student-table td {
  padding: 15px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.student-info div {
  display: flex;
  flex-direction: column;
}

.student-info small {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.class-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.gpa-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 700;
}

.gpa-badge.excellent {
  background: #c8e6c9;
  color: #2e7d32;
}

.gpa-badge.good {
  background: #b3e5fc;
  color: #0277bd;
}

.gpa-badge.average {
  background: #fff9c4;
  color: #f57f17;
}

.gpa-badge.fair {
  background: #ffe0b2;
  color: #e65100;
}

.gpa-badge.poor {
  background: #ffcdd2;
  color: #c62828;
}

.credits-badge {
  background: #f3e5f5;
  color: #7b1fa2;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.studying {
  background: #c8e6c9;
  color: #2e7d32;
}

.status-badge.reserved {
  background: #fff9c4;
  color: #f57f17;
}

.status-badge.suspended {
  background: #ffccbc;
  color: #d84315;
}

.status-badge.graduated {
  background: #e1bee7;
  color: #6a1b9a;
}

.status-badge.expelled {
  background: #ffcdd2;
  color: #c62828;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon.view {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-icon.view:hover {
  background: #1976d2;
  color: white;
}

.btn-icon.edit {
  background: #fff9c4;
  color: #f57f17;
}

.btn-icon.edit:hover {
  background: #f57f17;
  color: white;
}

.btn-icon.delete {
  background: #ffcdd2;
  color: #c62828;
}

.btn-icon.delete:hover {
  background: #c62828;
  color: white;
}

/* Grid View */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
}

.student-card {
  background: white;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.student-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  text-align: center;
}

.card-header img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
}

.card-header .status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
}

.card-body {
  padding: 15px;
}

.card-body h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.1rem;
  text-align: center;
}

.student-code {
  text-align: center;
  color: #7f8c8d;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.card-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #34495e;
}

.info-item i {
  color: #667eea;
}

.card-footer {
  display: flex;
  gap: 10px;
  padding: 15px;
  border-top: 1px solid #ecf0f1;
}

.btn-card {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: #ecf0f1;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-card:hover {
  background: #667eea;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #95a5a6;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 1.2rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #ecf0f1;
}

.btn-page {
  padding: 8px 12px;
  border: 2px solid #ecf0f1;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-page:not(:disabled):hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  margin: 0 15px;
  font-weight: 600;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    justify-content: space-between;
  }

  .grid-view {
    grid-template-columns: 1fr;
  }
}
</style>
