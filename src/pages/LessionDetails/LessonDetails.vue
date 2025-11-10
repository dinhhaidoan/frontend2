<template>
  <div class="lesson-details-page">
    <!-- Stats Section -->
    <AssignmentStats :stats="stats" />

    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Sidebar Filters -->
      <aside class="sidebar">
        <AssignmentFilters 
          :filters="filters"
          @update:filters="handleFiltersUpdate"
        />
      </aside>

      <!-- Assignment List -->
      <main class="main-content">
        <div class="header">
          <div class="header-left">
            <h2 class="page-title">Danh sách bài tập</h2>
            <span class="assignment-count">{{ filteredAssignments.length }} bài tập</span>
          </div>
          <div class="header-actions">
            <button @click="openCreateModal" class="btn-create">
              <i class="fas fa-plus"></i>
              Tạo bài tập mới
            </button>
          </div>
        </div>

        <AssignmentList 
          :assignments="assignments"
          :filters="filters"
          @assignment-click="openViewModal"
          @grade-click="openGradeModal"
        />
      </main>
    </div>

    <!-- Create/Edit Assignment Modal -->
    <Transition name="modal">
      <AssignmentModal
        v-if="showAssignmentModal"
        :assignment="selectedAssignment"
        @close="closeAssignmentModal"
        @save="handleSaveAssignment"
        @delete="handleDeleteAssignment"
      />
    </Transition>

    <!-- Grading Modal -->
    <Transition name="modal">
      <GradingModal
        v-if="showGradingModal"
        :assignment="selectedAssignment"
        @close="closeGradingModal"
        @save="handleSaveGrades"
      />
    </Transition>

    <!-- View Assignment Detail Modal -->
    <Transition name="modal">
      <AssignmentViewModal
        v-if="showViewModal"
        :assignment="selectedAssignment"
        @close="closeViewModal"
        @edit="openEditModal"
        @grade="openGradeModal"
        @delete="handleDeleteAssignment"
      />
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AssignmentStats from '../../components/LessionDetails/AssignmentStats.vue'
import AssignmentFilters from '../../components/LessionDetails/AssignmentFilters.vue'
import AssignmentList from '../../components/LessionDetails/AssignmentList.vue'
import AssignmentModal from '../../components/LessionDetails/AssignmentModal.vue'
import GradingModal from '../../components/LessionDetails/GradingModal.vue'
import AssignmentViewModal from '../../components/LessionDetails/AssignmentViewModal.vue'

// Filters state
const filters = ref({
  type: 'all',
  status: 'all',
  deadline: 'all',
  score: 'all'
})

// Modal states
const showAssignmentModal = ref(false)
const showGradingModal = ref(false)
const showViewModal = ref(false)
const selectedAssignment = ref(null)

// Mock data - assignments
const assignments = ref([
  {
    id: 1,
    title: 'Bài tập lập trình Java cơ bản',
    className: 'Lập trình hướng đối tượng - Nhóm 01',
    classId: 1,
    type: 'essay',
    deadline: '2025-10-30T23:59:00',
    maxScore: 10,
    totalStudents: 45,
    submitted: 38,
    graded: 30,
    avgScore: 7.8,
    maxScoreAchieved: 9.5,
    minScore: 5.0,
    status: 'graded',
    description: 'Viết chương trình quản lý danh sách sinh viên sử dụng OOP',
    questions: [
      {
        id: 1,
        type: 'essay',
        content: 'Thiết kế class Student với các thuộc tính: id, name, email, gpa',
        points: 3
      },
      {
        id: 2,
        type: 'essay',
        content: 'Implement các phương thức CRUD cho StudentManager',
        points: 4
      },
      {
        id: 3,
        type: 'essay',
        content: 'Viết test cases và demo chương trình',
        points: 3
      }
    ]
  },
  {
    id: 2,
    title: 'Kiểm tra lý thuyết OOP',
    className: 'Lập trình hướng đối tượng - Nhóm 01',
    classId: 1,
    type: 'multiple-choice',
    deadline: '2025-11-05T23:59:00',
    maxScore: 10,
    totalStudents: 45,
    submitted: 12,
    graded: 12,
    avgScore: 8.5,
    maxScoreAchieved: 10,
    minScore: 6.5,
    status: 'pending',
    description: 'Trắc nghiệm kiến thức về OOP, Inheritance, Polymorphism',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        content: 'OOP là viết tắt của gì?',
        points: 1,
        options: [
          'Object Oriented Programming',
          'Online Object Programming',
          'Optimized Object Protocol',
          'Open Object Platform'
        ],
        correctAnswer: 0
      },
      {
        id: 2,
        type: 'multiple-choice',
        content: 'Tính chất nào KHÔNG thuộc OOP?',
        points: 1,
        options: [
          'Encapsulation',
          'Inheritance',
          'Compilation',
          'Polymorphism'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 3,
    title: 'Đồ án cuối kỳ - Ứng dụng Web',
    className: 'Phát triển ứng dụng Web - Nhóm 02',
    classId: 2,
    type: 'mixed',
    deadline: '2025-11-15T23:59:00',
    maxScore: 10,
    totalStudents: 40,
    submitted: 5,
    graded: 2,
    avgScore: 8.0,
    maxScoreAchieved: 9.0,
    minScore: 7.0,
    status: 'pending',
    description: 'Xây dựng ứng dụng web hoàn chỉnh sử dụng Vue.js và Node.js',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        content: 'Framework nào được sử dụng cho frontend?',
        points: 1,
        options: ['React', 'Vue.js', 'Angular', 'Svelte'],
        correctAnswer: 1
      },
      {
        id: 2,
        type: 'essay',
        content: 'Mô tả kiến trúc hệ thống và các công nghệ sử dụng',
        points: 3
      },
      {
        id: 3,
        type: 'essay',
        content: 'Demo ứng dụng và giải thích code',
        points: 6
      }
    ]
  },
  {
    id: 4,
    title: 'Bài tập SQL - Truy vấn nâng cao',
    className: 'Cơ sở dữ liệu - Nhóm 03',
    classId: 3,
    type: 'essay',
    deadline: '2025-10-28T23:59:00',
    maxScore: 10,
    totalStudents: 50,
    submitted: 45,
    graded: 45,
    avgScore: 7.2,
    maxScoreAchieved: 9.8,
    minScore: 4.5,
    status: 'returned',
    description: 'Viết các câu truy vấn SQL phức tạp với JOIN, Subquery, GROUP BY',
    questions: [
      {
        id: 1,
        type: 'essay',
        content: 'Viết query lấy danh sách sinh viên có GPA cao nhất mỗi khoa',
        points: 3
      },
      {
        id: 2,
        type: 'essay',
        content: 'Tạo stored procedure tính điểm trung bình theo học kỳ',
        points: 4
      },
      {
        id: 3,
        type: 'essay',
        content: 'Tối ưu hóa query và giải thích execution plan',
        points: 3
      }
    ]
  },
  {
    id: 5,
    title: 'Kiểm tra giữa kỳ - Cấu trúc dữ liệu',
    className: 'Cấu trúc dữ liệu & Giải thuật - Nhóm 04',
    classId: 4,
    type: 'multiple-choice',
    deadline: '2025-11-01T23:59:00',
    maxScore: 10,
    totalStudents: 48,
    submitted: 20,
    graded: 20,
    avgScore: 6.8,
    maxScoreAchieved: 9.0,
    minScore: 3.5,
    status: 'pending',
    description: 'Trắc nghiệm về Array, Linked List, Stack, Queue, Tree',
    questions: []
  },
  {
    id: 6,
    title: 'Lab 3 - Implement Binary Search Tree',
    className: 'Cấu trúc dữ liệu & Giải thuật - Nhóm 04',
    classId: 4,
    type: 'essay',
    deadline: '2025-10-27T23:59:00',
    maxScore: 10,
    totalStudents: 48,
    submitted: 8,
    graded: 0,
    avgScore: null,
    maxScoreAchieved: null,
    minScore: null,
    status: 'pending',
    description: 'Cài đặt cây tìm kiếm nhị phân với các phép toán cơ bản',
    questions: [
      {
        id: 1,
        type: 'essay',
        content: 'Implement Insert, Delete, Search operations',
        points: 5
      },
      {
        id: 2,
        type: 'essay',
        content: 'Implement Tree Traversal (Inorder, Preorder, Postorder)',
        points: 3
      },
      {
        id: 3,
        type: 'essay',
        content: 'Phân tích độ phức tạp thuật toán',
        points: 2
      }
    ]
  }
])

// Computed stats
const stats = computed(() => {
  const total = assignments.value.length
  const totalStudents = assignments.value.reduce((sum, a) => sum + a.totalStudents, 0)
  const submitted = assignments.value.reduce((sum, a) => sum + a.submitted, 0)
  const pending = assignments.value.filter(a => a.status === 'pending').length
  const graded = assignments.value.reduce((sum, a) => sum + a.graded, 0)
  
  const assignmentsWithScores = assignments.value.filter(a => a.avgScore !== null)
  const avgScore = assignmentsWithScores.length > 0
    ? (assignmentsWithScores.reduce((sum, a) => sum + a.avgScore, 0) / assignmentsWithScores.length).toFixed(1)
    : 0
  
  const overdue = assignments.value.filter(a => {
    const deadline = new Date(a.deadline)
    return deadline < new Date() && a.status !== 'returned'
  }).length

  return {
    total,
    submitted: `${submitted}/${totalStudents}`,
    pending,
    graded,
    avgScore,
    overdue
  }
})

// Computed filtered assignments
const filteredAssignments = computed(() => {
  let result = [...assignments.value]

  if (filters.value.type !== 'all') {
    result = result.filter(a => a.type === filters.value.type)
  }

  if (filters.value.status !== 'all') {
    result = result.filter(a => a.status === filters.value.status)
  }

  if (filters.value.deadline !== 'all') {
    const now = new Date()
    if (filters.value.deadline === 'upcoming') {
      result = result.filter(a => new Date(a.deadline) > now && new Date(a.deadline) - now < 7 * 24 * 60 * 60 * 1000)
    } else if (filters.value.deadline === 'overdue') {
      result = result.filter(a => new Date(a.deadline) < now && a.status !== 'returned')
    } else if (filters.value.deadline === 'completed') {
      result = result.filter(a => a.status === 'returned')
    }
  }

  if (filters.value.score !== 'all') {
    result = result.filter(a => {
      if (a.avgScore === null) return false
      if (filters.value.score === 'high') return a.avgScore >= 8
      if (filters.value.score === 'medium') return a.avgScore >= 5 && a.avgScore < 8
      if (filters.value.score === 'low') return a.avgScore < 5
      return true
    })
  }

  return result
})

// Event handlers
const handleFiltersUpdate = (newFilters) => {
  filters.value = { ...newFilters }
}

const openCreateModal = () => {
  selectedAssignment.value = null
  showAssignmentModal.value = true
}

const openEditModal = (assignment) => {
  selectedAssignment.value = assignment
  showViewModal.value = false
  showAssignmentModal.value = true
}

const openViewModal = (assignment) => {
  selectedAssignment.value = assignment
  showViewModal.value = true
}

const openGradeModal = (assignment) => {
  selectedAssignment.value = assignment
  showViewModal.value = false
  showGradingModal.value = true
}

const closeAssignmentModal = () => {
  showAssignmentModal.value = false
  selectedAssignment.value = null
}

const closeGradingModal = () => {
  showGradingModal.value = false
  selectedAssignment.value = null
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedAssignment.value = null
}

const handleSaveAssignment = (assignmentData) => {
  if (selectedAssignment.value) {
    // Update existing assignment
    const index = assignments.value.findIndex(a => a.id === selectedAssignment.value.id)
    if (index !== -1) {
      assignments.value[index] = { ...assignments.value[index], ...assignmentData }
    }
  } else {
    // Create new assignment
    const newAssignment = {
      id: Math.max(...assignments.value.map(a => a.id)) + 1,
      ...assignmentData,
      submitted: 0,
      graded: 0,
      avgScore: null,
      maxScoreAchieved: null,
      minScore: null,
      status: 'pending'
    }
    assignments.value.push(newAssignment)
  }
  closeAssignmentModal()
}

const handleSaveGrades = (grades) => {
  // Update assignment grading stats
  const index = assignments.value.findIndex(a => a.id === selectedAssignment.value.id)
  if (index !== -1) {
    const gradedCount = grades.filter(g => g.score !== null).length
    const scores = grades.filter(g => g.score !== null).map(g => g.score)
    
    assignments.value[index] = {
      ...assignments.value[index],
      graded: gradedCount,
      avgScore: scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null,
      maxScoreAchieved: scores.length > 0 ? Math.max(...scores) : null,
      minScore: scores.length > 0 ? Math.min(...scores) : null,
      status: gradedCount === assignments.value[index].submitted ? 'graded' : 'pending'
    }
  }
  closeGradingModal()
}

const handleDeleteAssignment = (assignment) => {
  const index = assignments.value.findIndex(a => a.id === assignment.id)
  if (index !== -1) {
    assignments.value.splice(index, 1)
    console.log('Deleted assignment:', assignment)
  }
  closeViewModal()
}
</script>

<style scoped>
.lesson-details-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  margin-top: 24px;
}

.sidebar {
  position: sticky;
  top: 24px;
  height: fit-content;
}

.main-content {
  min-width: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.assignment-count {
  padding: 6px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-create {
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-create i {
  font-size: 14px;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .lesson-details-page {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .header-actions {
    width: 100%;
  }

  .btn-create {
    width: 100%;
    justify-content: center;
  }
}
</style>
