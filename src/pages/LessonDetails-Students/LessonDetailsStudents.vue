<template>
  <div class="lesson-details-students-page">
    <div class="page-header">
      <div class="header-content">
        <button @click="goBack" class="btn-back">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="header-text">
          <h1>{{ lessonTitle || 'Bài tập & Kiểm tra' }}</h1>
          <p v-if="className">{{ className }}</p>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toast.visible" :class="['toast', toast.type]" role="status" aria-live="polite">
      <div class="toast-icon">{{ toast.icon }}</div>
      <div class="toast-body">
        <strong class="toast-title">{{ toast.title }}</strong>
        <div class="toast-message">{{ toast.message }}</div>
      </div>
      <button class="toast-close" @click="hideToast">✕</button>
    </div>

    <!-- Stats -->
    <StudentAssignmentStats :stats="stats" />

    <!-- Main Content -->
    <div class="content-layout">
      <!-- Filters Sidebar -->
      <StudentAssignmentFilters 
        :filters="filters"
        :completionRate="completionRate"
        @update:filters="handleFiltersUpdate"
      />

      <!-- Assignments List -->
      <StudentAssignmentList 
        :assignments="assignments"
        :filters="filters"
        @view-assignment="openAssignmentModal"
      />
    </div>

    <!-- Assignment Modal -->
    <StudentAssignmentModal 
      v-if="selectedAssignment"
      :assignment="selectedAssignment"
      :locked-reason="getLockedReason(selectedAssignment)"
      @close="closeAssignmentModal"
      @save-draft="handleSaveDraft"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import StudentAssignmentStats from '@/components/LessonDetails-Students/StudentAssignmentStats.vue';
import StudentAssignmentFilters from '@/components/LessonDetails-Students/StudentAssignmentFilters.vue';
import StudentAssignmentList from '@/components/LessonDetails-Students/StudentAssignmentList.vue';
import StudentAssignmentModal from '@/components/LessonDetails-Students/StudentAssignmentModal.vue';

const router = useRouter();
const route = useRoute();

const lessonTitle = ref('');
const className = ref('');
const selectedAssignment = ref(null);
const filters = ref({
  classId: '',
  type: '',
  statuses: [],
  deadlines: []
});

// Mock data - trong thực tế sẽ lấy từ API
const assignments = ref([
  {
    id: 1,
    title: 'Bài tập lớn: Xây dựng ứng dụng Quản lý Sinh viên',
    className: 'Lập trình hướng đối tượng - Nhóm 01',
    classId: '1',
    type: 'essay',
    openAt: '2024-02-01T00:00:00', // Already open
    deadline: '2024-02-15T23:59:00',
    maxScore: 10,
    description: 'Xây dựng ứng dụng quản lý sinh viên sử dụng các nguyên lý OOP đã học. Ứng dụng cần có đầy đủ các chức năng CRUD và áp dụng các design pattern phù hợp.',
    studentStatus: 'inProgress',
    studentProgress: 45,
    studentAnswers: {},
    studentFiles: {},
    questions: [
      {
        id: 'q1',
        type: 'essay',
        content: 'Mô tả kiến trúc tổng quan của ứng dụng, các lớp chính và mối quan hệ giữa chúng. Vẽ sơ đồ lớp (Class Diagram) minh họa.',
        points: 2
      },
      {
        id: 'q2',
        type: 'essay',
        content: 'Giải thích cách bạn áp dụng các nguyên lý SOLID trong dự án. Đưa ra ví dụ cụ thể cho mỗi nguyên lý.',
        points: 3
      },
      {
        id: 'q3',
        type: 'essay',
        content: 'Upload source code dự án (file .zip) và báo cáo chi tiết (file .docx hoặc .pdf)',
        points: 5
      }
    ]
  },
  {
    id: 2,
    title: 'Kiểm tra giữa kỳ: Lập trình Web',
    className: 'Phát triển ứng dụng Web - Nhóm 02',
    classId: '2',
    type: 'mixed',
    openAt: '2025-11-01T08:00:00', // Opens in the future (Nov 1, 2025)
    deadline: '2025-11-10T14:00:00',
    maxScore: 10,
    description: 'Kiểm tra kiến thức HTML, CSS, JavaScript và Vue.js. Thời gian làm bài: 90 phút.',
    studentStatus: 'notStarted',
    studentProgress: 0,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        content: 'Trong Vue 3, hook nào được sử dụng để thực hiện side effects sau khi component được mount?',
        points: 1,
        options: [
          'onBeforeMount()',
          'onMounted()',
          'onUpdated()',
          'onCreated()'
        ],
        correctAnswer: 'onMounted()'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        content: 'CSS Flexbox: Thuộc tính nào dùng để căn giữa các items theo trục chính?',
        points: 1,
        options: [
          'align-items: center',
          'justify-content: center',
          'align-content: center',
          'flex-align: center'
        ],
        correctAnswer: 'justify-content: center'
      },
      {
        id: 'q3',
        type: 'essay',
        content: 'Giải thích sự khác biệt giữa Composition API và Options API trong Vue 3. Khi nào nên sử dụng mỗi loại?',
        points: 3
      },
      {
        id: 'q4',
        type: 'essay',
        content: 'Xây dựng một component đơn giản (upload code và mô tả)',
        points: 5
      }
    ]
  },
  {
    id: 3,
    title: 'Quiz: SQL cơ bản',
    className: 'Cơ sở dữ liệu - Nhóm 03',
    classId: '3',
    type: 'multiple-choice',
    openAt: '2024-02-01T00:00:00',
    deadline: '2024-02-08T23:59:00', // Past deadline - overdue
    maxScore: 10,
    description: 'Trắc nghiệm kiến thức SQL cơ bản: SELECT, JOIN, GROUP BY, subquery.',
    studentStatus: 'notStarted', // Changed to notStarted to test overdue lock
    studentProgress: 0,
    studentAnswers: {},
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        content: 'Câu lệnh SQL nào để lấy tất cả users có tuổi > 18?',
        points: 2.5,
        options: [
          'SELECT * FROM users WHERE age > 18',
          'GET users WHERE age > 18',
          'SELECT ALL FROM users IF age > 18',
          'FETCH * FROM users WHEN age > 18'
        ],
        correctAnswer: 'SELECT * FROM users WHERE age > 18'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        content: 'Loại JOIN nào trả về các bản ghi có giá trị khớp ở cả 2 bảng?',
        points: 2.5,
        options: [
          'LEFT JOIN',
          'RIGHT JOIN',
          'INNER JOIN',
          'FULL JOIN'
        ],
        correctAnswer: 'INNER JOIN'
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        content: 'Hàm aggregate nào dùng để đếm số bản ghi?',
        points: 2.5,
        options: [
          'SUM()',
          'AVG()',
          'COUNT()',
          'MAX()'
        ],
        correctAnswer: 'COUNT()'
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        content: 'HAVING clause được sử dụng với clause nào?',
        points: 2.5,
        options: [
          'WHERE',
          'ORDER BY',
          'GROUP BY',
          'SELECT'
        ],
        correctAnswer: 'GROUP BY'
      }
    ]
  },
  {
    id: 4,
    title: 'Bài tập: Cài đặt thuật toán sắp xếp',
    className: 'Cấu trúc dữ liệu & Giải thuật - Nhóm 04',
    classId: '4',
    type: 'essay',
    openAt: '2024-02-01T00:00:00',
    deadline: '2024-02-12T23:59:00',
    maxScore: 10,
    description: 'Cài đặt và phân tích các thuật toán sắp xếp: Bubble Sort, Quick Sort, Merge Sort.',
    studentStatus: 'graded',
    studentProgress: 100,
    studentScore: 8.5,
    submittedAt: '2024-02-11T20:15:00',
    gradedAt: '2024-02-12T10:30:00',
    feedback: 'Bài làm tốt! Code sạch, có comment đầy đủ. Phân tích độ phức tạp chính xác. Trừ điểm nhỏ vì thiếu test case edge case.',
    studentAnswers: {
      'q1': 'Đã cài đặt đầy đủ 3 thuật toán...',
      'q2': 'Phân tích độ phức tạp:\n- Bubble Sort: O(n^2)...',
      'q3': 'Kết quả test cho thấy Quick Sort nhanh nhất...'
    },
    studentFiles: {
      'q3': [
        {
          name: 'sorting_algorithms.py',
          size: 15420,
          type: 'text/x-python',
          url: '#'
        },
        {
          name: 'test_results.pdf',
          size: 245680,
          type: 'application/pdf',
          url: '#'
        }
      ]
    },
    questions: [
      {
        id: 'q1',
        type: 'essay',
        content: 'Cài đặt 3 thuật toán: Bubble Sort, Quick Sort, Merge Sort bằng ngôn ngữ tự chọn.',
        points: 4,
        earnedPoints: 4,
        feedback: 'Code chuẩn, logic đúng'
      },
      {
        id: 'q2',
        type: 'essay',
        content: 'Phân tích độ phức tạp thời gian và không gian của từng thuật toán.',
        points: 3,
        earnedPoints: 2.5,
        feedback: 'Phân tích đúng nhưng thiếu trường hợp tốt nhất của Quick Sort'
      },
      {
        id: 'q3',
        type: 'essay',
        content: 'So sánh hiệu năng thực tế trên các bộ dữ liệu khác nhau. Upload code và báo cáo.',
        points: 3,
        earnedPoints: 2,
        feedback: 'Thiếu test case với dữ liệu đã sắp xếp và sắp xếp ngược'
      }
    ]
  },
  {
    id: 5,
    title: 'Bài tập nhỏ: HTML & CSS Responsive',
    className: 'Phát triển ứng dụng Web - Nhóm 02',
    classId: '2',
    type: 'essay',
    openAt: '2024-01-28T00:00:00',
    deadline: '2024-02-05T23:59:00',
    maxScore: 5,
    description: 'Tạo landing page responsive với HTML và CSS thuần, không sử dụng framework.',
    studentStatus: 'graded',
    studentProgress: 100,
    studentScore: 4.5,
    submittedAt: '2024-02-05T22:45:00',
    gradedAt: '2024-02-06T09:00:00',
    feedback: 'Giao diện đẹp, responsive tốt. Tuy nhiên cần tối ưu hóa CSS và sử dụng BEM naming convention.',
    studentAnswers: {
      'q1': 'Đã tạo landing page với header, hero section, features, footer...'
    },
    studentFiles: {
      'q1': [
        {
          name: 'landing-page.zip',
          size: 1245600,
          type: 'application/zip',
          url: '#'
        },
        {
          name: 'screenshots.pdf',
          size: 589000,
          type: 'application/pdf',
          url: '#'
        }
      ]
    },
    questions: [
      {
        id: 'q1',
        type: 'essay',
        content: 'Upload source code (HTML, CSS, images) và screenshots minh họa responsive trên các breakpoints.',
        points: 5,
        earnedPoints: 4.5,
        feedback: 'Làm tốt! Cần cải thiện cấu trúc CSS'
      }
    ]
  }
]);

const stats = computed(() => {
  const total = assignments.value.length;
  const completed = assignments.value.filter(a => a.studentStatus === 'graded').length;
  const pending = assignments.value.filter(a => a.studentStatus === 'notStarted' || a.studentStatus === 'inProgress').length;
  
  const gradedAssignments = assignments.value.filter(a => a.studentStatus === 'graded' && a.studentScore !== null);
  const averageScore = gradedAssignments.length > 0
    ? gradedAssignments.reduce((sum, a) => sum + a.studentScore, 0) / gradedAssignments.length
    : 0;

  return {
    total,
    completed,
    pending,
    averageScore
  };
});

const completionRate = computed(() => {
  if (assignments.value.length === 0) return 0;
  const completed = assignments.value.filter(a => a.studentStatus === 'submitted' || a.studentStatus === 'graded').length;
  return Math.round((completed / assignments.value.length) * 100);
});

const toast = ref({ visible: false, title: '', message: '', type: 'info', icon: 'ℹ️' });

const showToast = ({ title = '', message = '', type = 'info', icon = 'ℹ️', timeout = 4000 } = {}) => {
  toast.value = { visible: true, title, message, type, icon };
  if (timeout > 0) {
    setTimeout(() => {
      toast.value.visible = false;
    }, timeout);
  }
};

const hideToast = () => {
  toast.value.visible = false;
};

const openAssignmentModal = (assignment) => {
  const locked = getLockedReason(assignment);
  // If the assignment is not open yet, block opening the modal entirely and show toast
  if (locked === 'notOpen') {
    const openAtText = assignment.openAt ? `Thời gian mở: ${new Date(assignment.openAt).toLocaleString('vi-VN')}` : '';
    showToast({ title: 'Bài tập chưa mở', message: `Bài tập này chưa mở. ${openAtText}`, type: 'warning', icon: '🔒' });
    return;
  }
  selectedAssignment.value = assignment;
};

const closeAssignmentModal = () => {
  selectedAssignment.value = null;
};

const handleFiltersUpdate = (newFilters) => {
  filters.value = { ...newFilters };
};

const handleSaveDraft = ({ answers, files }) => {
  if (selectedAssignment.value) {
    const assignment = assignments.value.find(a => a.id === selectedAssignment.value.id);
    if (assignment) {
      assignment.studentAnswers = answers;
      assignment.studentFiles = files;
      assignment.studentStatus = 'inProgress';
      
      // Calculate progress
      const totalQuestions = assignment.questions.length;
      const answeredQuestions = assignment.questions.filter(q => {
        if (q.type === 'multiple-choice') {
          return answers[q.id];
        } else if (q.type === 'essay') {
          return answers[q.id]?.trim() || files[q.id]?.length > 0;
        }
        return false;
      }).length;
      assignment.studentProgress = Math.round((answeredQuestions / totalQuestions) * 100);
      
      alert('Đã lưu nháp thành công!');
    }
  }
};

const handleSubmit = ({ answers, files, submittedAt }) => {
  if (selectedAssignment.value) {
    const assignment = assignments.value.find(a => a.id === selectedAssignment.value.id);
    if (assignment) {
      assignment.studentAnswers = answers;
      assignment.studentFiles = files;
      assignment.studentStatus = 'submitted';
      assignment.studentProgress = 100;
      assignment.submittedAt = submittedAt;
      
      alert('Nộp bài thành công! Giảng viên sẽ chấm điểm sớm nhất có thể.');
      closeAssignmentModal();
    }
  }
};

const goBack = () => {
  router.back();
};

// Determine if assignment is locked (not open yet or overdue)
const getLockedReason = (assignment) => {
  if (!assignment) return '';
  
  const now = new Date();
  
  // Check if assignment has openAt field (when it becomes available)
  if (assignment.openAt) {
    const openTime = new Date(assignment.openAt);
    if (now < openTime) {
      return 'notOpen';
    }
  }
  
  // Check if overdue
  if (assignment.deadline) {
    const deadline = new Date(assignment.deadline);
    if (now > deadline && assignment.studentStatus !== 'submitted' && assignment.studentStatus !== 'graded') {
      return 'overdue';
    }
  }
  
  return '';
};

onMounted(() => {
  // Get params from route
  if (route.query.lessonId) {
    lessonTitle.value = route.query.lessonTitle || '';
  }
  if (route.query.className) {
    className.value = route.query.className;
  }
  // Auto-filter by classId if provided from MyClass modal
  if (route.query.classId) {
    filters.value.classId = route.query.classId;
  }
});

// expose toast to template
const toastVisible = computed(() => toast.value.visible);

</script>

<style scoped>
.lesson-details-students-page {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Toast styles */
.toast {
  position: fixed;
  right: 24px;
  top: 88px;
  z-index: 1400;
  min-width: 320px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(16,24,40,0.15);
  background: white;
  border: 1px solid rgba(0,0,0,0.06);
}
.toast.warning {
  background: linear-gradient(180deg, #fff5f5 0%, #fff1f2 100%);
  border-color: #fecaca;
}
.toast-icon { font-size: 18px; }
.toast-body { flex: 1; }
.toast-title { display: block; font-weight: 700; margin-bottom: 4px; }
.toast-message { font-size: 13px; color: #374151; }
.toast-close { background: transparent; border: none; font-size: 14px; cursor: pointer; color: #6b7280; }

.page-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-back {
  background: white;
  border: 2px solid #e2e8f0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #475569;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-back:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateX(-4px);
}

.header-text h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text p {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 30px;
  align-items: start;
}

@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: 280px 1fr;
    gap: 24px;
  }
}

@media (max-width: 992px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .lesson-details-students-page {
    padding: 20px;
  }

  .header-text h1 {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .btn-back {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .header-text h1 {
    font-size: 20px;
  }

  .header-text p {
    font-size: 14px;
  }
}
</style>
