<template>
  <div class="class-list-view">
    <div class="class-header">
      <h2>Lớp học phụ trách</h2>
      <div class="header-actions">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Tìm lớp học..."
          />
        </div>
        <select v-model="sortBy" class="sort-select">
          <option value="name">Tên lớp</option>
          <option value="students">Số sinh viên</option>
          <option value="schedule">Lịch dạy</option>
        </select>
      </div>
    </div>

    <div class="class-grid">
      <div 
        v-for="classItem in filteredClasses"
        :key="classItem.id"
        class="class-card"
        @click="handleClassClick(classItem)"
      >
        <div class="class-banner" :style="{ background: classItem.color }">
          <div class="class-code">{{ classItem.code }}</div>
          <div class="class-stats">
            <span>
              <i class="fas fa-user-graduate"></i>
              {{ classItem.studentCount }}
            </span>
          </div>
        </div>

        <div class="class-body">
          <h3 class="class-name">{{ classItem.name }}</h3>
          <p class="class-subject">{{ classItem.subject }}</p>

          <div class="class-info">
            <div class="info-item">
              <i class="fas fa-calendar"></i>
              <span>{{ classItem.scheduleCount }} buổi/tuần</span>
            </div>
            <div class="info-item">
              <i class="fas fa-door-open"></i>
              <span>{{ classItem.room }}</span>
            </div>
          </div>

          <div class="class-progress">
            <div class="progress-label">
              <span>Tiến độ học</span>
              <span class="progress-value">{{ classItem.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: classItem.progress + '%' }"
              ></div>
            </div>
          </div>

          <div class="class-footer">
            <button @click.stop="viewAttendance(classItem)" class="action-btn">
              <i class="fas fa-clipboard-check"></i>
              Điểm danh
            </button>
            <button @click.stop="viewGrades(classItem)" class="action-btn">
              <i class="fas fa-star"></i>
              Điểm số
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredClasses.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Không tìm thấy lớp học</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['class-click', 'view-attendance', 'view-grades'])

const searchQuery = ref('')
const sortBy = ref('name')

// Mock classes data
const classes = ref([
  {
    id: 1,
    code: 'DHKTPM17A',
    name: 'Lập trình hướng đối tượng',
    subject: 'OOP with Java',
    studentCount: 45,
    scheduleCount: 3,
    room: 'A201',
    progress: 65,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 2,
    code: 'DHKTPM17B',
    name: 'Cấu trúc dữ liệu và giải thuật',
    subject: 'Data Structures & Algorithms',
    studentCount: 42,
    scheduleCount: 3,
    room: 'B101',
    progress: 58,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    code: 'DHKTPM17C',
    name: 'Cơ sở dữ liệu',
    subject: 'Database Management',
    studentCount: 38,
    scheduleCount: 2,
    room: 'Lab2',
    progress: 72,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 4,
    code: 'DHKTPM18A',
    name: 'Mạng máy tính',
    subject: 'Computer Networks',
    studentCount: 40,
    scheduleCount: 2,
    room: 'A302',
    progress: 45,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 5,
    code: 'DHKTPM18B',
    name: 'Lập trình Web',
    subject: 'Web Programming',
    studentCount: 36,
    scheduleCount: 3,
    room: 'Lab1',
    progress: 80,
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    id: 6,
    code: 'DHKTPM18C',
    name: 'Phát triển ứng dụng',
    subject: 'Mobile App Development',
    studentCount: 35,
    scheduleCount: 2,
    room: 'Lab3',
    progress: 50,
    color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  }
])

const filteredClasses = computed(() => {
  let result = classes.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c => 
      c.code.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      c.subject.toLowerCase().includes(query)
    )
  }

  // Sort
  result = [...result].sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'students':
        return b.studentCount - a.studentCount
      case 'schedule':
        return b.scheduleCount - a.scheduleCount
      default:
        return 0
    }
  })

  return result
})

const handleClassClick = (classItem) => {
  emit('class-click', classItem)
}

const viewAttendance = (classItem) => {
  emit('view-attendance', classItem)
}

const viewGrades = (classItem) => {
  emit('view-grades', classItem)
}
</script>

<style scoped>
.class-list-view {
  height: 100%;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
}

.class-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: #9ca3af;
}

.search-box input {
  padding: 10px 12px 10px 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  width: 250px;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.sort-select {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  background: white;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.class-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.class-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.class-banner {
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.class-code {
  font-size: 18px;
  font-weight: 700;
}

.class-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.class-stats span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.class-body {
  padding: 20px;
}

.class-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.class-subject {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.class-info {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.class-progress {
  margin-bottom: 16px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.progress-value {
  font-weight: 600;
  color: #3b82f6;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  border-radius: 3px;
  transition: width 0.3s;
}

.class-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.action-btn {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #6b7280;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .class-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .class-grid {
    grid-template-columns: 1fr;
  }
}
</style>
