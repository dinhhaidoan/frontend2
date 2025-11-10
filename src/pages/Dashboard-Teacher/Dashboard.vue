<template>
  <div class="dashboard">
    <div class="dashboard-content">
      <!-- Header with Quick Actions -->
      <div class="header-section">
        <div>
          <h1>Bảng điều khiển</h1>
          <p class="subtitle">Chào mừng bạn trở lại</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" @click="goToLessons">
            <i class="fas fa-plus"></i> Tạo bài tập
          </button>
          <button class="btn btn-outline" @click="goToMessages">
            <i class="fas fa-envelope"></i> Tin nhắn
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
    <div class="stats-grid">
      <StatCard :value="stats.activeclasses" label="Lớp đang dạy" icon="fas fa-chalkboard-user" iconBg="linear-gradient(135deg, #3b82f6, #1e40af)" />
      <StatCard :value="stats.lessons" label="Bài học/tuần" icon="fas fa-book-open" iconBg="linear-gradient(135deg, #10b981, #047857)" />
      <StatCard :value="stats.pending" label="Cần chấm điểm" icon="fas fa-clipboard-check" iconBg="linear-gradient(135deg, #f59e0b, #d97706)" />
      <StatCard :value="stats.students" label="Sinh viên quản lý" icon="fas fa-users" iconBg="linear-gradient(135deg, #8b5cf6, #6d28d9)" />
    </div>      <!-- Main Content Grid -->
      <div class="main-grid">
      <!-- Grade Comparison Chart -->
      <GradeComparisonChart :classGrades="classGrades" />

      <!-- Upcoming Classes -->
      <UpcomingClasses :upcomingClasses="upcomingClasses" @view="goToSchedule" />

      <!-- Important Notes -->
      <ImportantNotes :importantNotes="importantNotes" @edit="goToNotes" />

      <!-- Grade Progress -->
      <GradeProgress :graded="graded" :pending="stats.pending" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import StatCard from '@/components/Dashboard-Teacher/StatCard.vue'
import GradeComparisonChart from '@/components/Dashboard-Teacher/GradeComparisonChart.vue'
import UpcomingClasses from '@/components/Dashboard-Teacher/UpcomingClasses.vue'
import ImportantNotes from '@/components/Dashboard-Teacher/ImportantNotes.vue'
import GradeProgress from '@/components/Dashboard-Teacher/GradeProgress.vue'

const router = useRouter()

// Stats data
const stats = ref({
  activeclasses: 3,
  lessons: 12,
  pending: 8,
  students: 45
})

const graded = ref(32)

// Activity data for mini chart
const activityData = ref([45, 52, 48, 68, 72, 58, 85])

// Class grades comparison
const classGrades = ref([
  { id: 1, name: 'DHKTPM18B', avg: 7.8 },
  { id: 2, name: 'DHKTPM17C', avg: 8.2 },
  { id: 3, name: 'DHKTPM18A', avg: 7.5 },
  { id: 4, name: 'DHKTPM17A', avg: 8.5 }
])

// Upcoming classes
const upcomingClasses = ref([
  { id: 1, time: '09:00 - 11:00', date: 'Thứ 2', subject: 'Web Programming - Lab', class: 'DHKTPM18B' },
  { id: 2, time: '13:00 - 15:00', date: 'Thứ 3', subject: 'CSDL - Thực hành', class: 'DHKTPM17C' },
  { id: 3, time: '10:00 - 12:00', date: 'Thứ 4', subject: 'Lập trình Java', class: 'DHKTPM18A' }
])

// Important notes (marked/pinned)
const importantNotes = ref([
  { id: 1, priority: 'high', title: 'Nộp điểm lớp DHKTPM18B', content: 'Hạn nộp: 28/10 — Chấm xong rồi, nộp vào hệ thống' },
  { id: 2, priority: 'medium', title: 'Chuẩn bị đề thi giữa kỳ', content: 'Lớp DHKTPM17A — Khoảng 2 tuần nữa' },
  { id: 3, priority: 'high', title: 'Update bài giảng tuần này', content: 'Thêm slide bài 5 vào tài liệu dạy học' }
])

// Computed
const gradePercent = computed(() => {
  const total = graded.value + stats.value.pending
  return Math.round((graded.value / Math.max(1, total)) * 100)
})

// Helper: get color based on grade
const getGradeColor = (grade) => {
  if (grade >= 8.5) return 'linear-gradient(90deg, #10b981, #059669)'  // green
  if (grade >= 7.5) return 'linear-gradient(90deg, #3b82f6, #2563eb)'  // blue
  if (grade >= 6.5) return 'linear-gradient(90deg, #f59e0b, #d97706)'  // amber
  return 'linear-gradient(90deg, #ef4444, #dc2626)'  // red
}

// Navigation
const goToLessons = () => router.push({ name: 'lesson-details' })
const goToMessages = () => router.push({ name: 'messages' })
const goToSchedule = () => router.push({ name: 'teacher-schedule' })
const goToAssignments = () => router.push({ name: 'lesson-details' })
const goToNotes = () => router.push({ name: 'notes' })
</script>

<style scoped>
.dashboard {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
  padding: 0;
}

.dashboard-content {
  max-width: 1300px;
  margin: 0 auto;
  padding: 24px;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-section h1 {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 4px 0;
  color: #0f172a;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.btn-outline {
  background: white;
  color: #3b82f6;
  border: 1px solid #dbeafe;
}

.btn-outline:hover {
  background: #f0f9ff;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 16px;
  }

  .header-section {
    flex-direction: column;
    margin-bottom: 24px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    flex: 1;
    justify-content: center;
  }

  .header-section h1 {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
