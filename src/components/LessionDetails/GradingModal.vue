<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-info">
          <h2>Chấm điểm bài tập</h2>
          <p class="assignment-title">{{ assignment.title }}</p>
        </div>
        <button @click="close" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Summary Stats -->
        <div class="summary-stats">
          <div class="stat-card">
            <i class="fas fa-users"></i>
            <div class="stat-content">
              <span class="stat-label">Đã nộp</span>
              <span class="stat-value">{{ assignment.submitted }}/{{ assignment.totalStudents }}</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-check-circle"></i>
            <div class="stat-content">
              <span class="stat-label">Đã chấm</span>
              <span class="stat-value">{{ gradedCount }}/{{ assignment.submitted }}</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-star"></i>
            <div class="stat-content">
              <span class="stat-label">Điểm TB</span>
              <span class="stat-value">{{ averageScore }}</span>
            </div>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Tìm kiếm sinh viên..."
              class="search-input"
            />
          </div>
          <div class="filter-buttons">
            <button 
              @click="filterStatus = 'all'"
              :class="['filter-btn', { active: filterStatus === 'all' }]"
            >
              Tất cả ({{ submissions.length }})
            </button>
            <button 
              @click="filterStatus = 'graded'"
              :class="['filter-btn', { active: filterStatus === 'graded' }]"
            >
              Đã chấm ({{ gradedCount }})
            </button>
            <button 
              @click="filterStatus = 'pending'"
              :class="['filter-btn', { active: filterStatus === 'pending' }]"
            >
              Chưa chấm ({{ submissions.length - gradedCount }})
            </button>
          </div>
        </div>

        <!-- Student Submissions List -->
        <div class="submissions-list">
          <div 
            v-for="submission in filteredSubmissions" 
            :key="submission.studentId"
            :class="['submission-item', { graded: submission.score !== null }]"
          >
            <div class="student-info">
              <img :src="submission.avatar" :alt="submission.studentName" class="student-avatar" />
              <div class="student-details">
                <span class="student-name">{{ submission.studentName }}</span>
                <span class="student-id">MSSV: {{ submission.studentId }}</span>
              </div>
            </div>

            <div class="submission-meta">
              <span class="submit-time">
                <i class="fas fa-clock"></i>
                {{ formatSubmitTime(submission.submitTime) }}
              </span>
              <span v-if="submission.isLate" class="late-badge">
                <i class="fas fa-exclamation-triangle"></i>
                Nộp muộn
              </span>
            </div>

            <div class="grading-section">
              <!-- For Essay Questions -->
              <div v-if="assignment.type === 'essay' || assignment.type === 'mixed'">
                <button @click="viewSubmission(submission)" class="btn-view">
                  <i class="fas fa-eye"></i>
                  Xem bài làm
                </button>
              </div>

              <!-- Score Input -->
              <div class="score-input-group">
                <input 
                  v-model.number="submission.score" 
                  type="number" 
                  min="0" 
                  :max="assignment.maxScore"
                  step="0.25"
                  placeholder="Điểm"
                  class="score-input"
                  @input="updateScore(submission)"
                />
                <span class="max-score">/ {{ assignment.maxScore }}</span>
              </div>

              <!-- Feedback -->
              <div class="feedback-group">
                <button 
                  @click="toggleFeedback(submission)"
                  class="btn-feedback"
                  :class="{ active: submission.showFeedback }"
                >
                  <i class="fas fa-comment"></i>
                  Nhận xét
                </button>
              </div>
            </div>

            <!-- Feedback Textarea (Expandable) -->
            <Transition name="expand">
              <div v-if="submission.showFeedback" class="feedback-section">
                <textarea 
                  v-model="submission.feedback" 
                  rows="3" 
                  placeholder="Nhập nhận xét cho sinh viên..."
                  class="feedback-textarea"
                ></textarea>
              </div>
            </Transition>
          </div>

          <div v-if="filteredSubmissions.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Không tìm thấy bài nộp nào</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="close" class="btn-cancel">Đóng</button>
        <button @click="showConfirmDialog" class="btn-save">
          <i class="fas fa-save"></i>
          Lưu điểm
        </button>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <Transition name="fade">
      <div v-if="showConfirmation" class="confirmation-overlay" @click.self="cancelConfirmation">
        <div class="confirmation-dialog">
          <div class="confirmation-header">
            <i class="fas fa-check-circle"></i>
            <h3>Xác nhận lưu điểm</h3>
          </div>
          
          <div class="confirmation-body">
            <div class="confirm-section">
              <h4>Thông tin bài tập</h4>
              <div class="confirm-row">
                <span class="label">Bài tập:</span>
                <span class="value">{{ assignment.title }}</span>
              </div>
              <div class="confirm-row">
                <span class="label">Lớp học:</span>
                <span class="value">{{ assignment.className }}</span>
              </div>
            </div>

            <div class="confirm-section">
              <h4>Kết quả chấm điểm</h4>
              <div class="grading-summary">
                <div class="summary-card total">
                  <i class="fas fa-users"></i>
                  <div class="summary-content">
                    <span class="summary-label">Tổng số bài nộp</span>
                    <span class="summary-value">{{ assignment.submitted }}</span>
                  </div>
                </div>
                <div class="summary-card graded">
                  <i class="fas fa-check-circle"></i>
                  <div class="summary-content">
                    <span class="summary-label">Đã chấm điểm</span>
                    <span class="summary-value">{{ gradedCount }}</span>
                  </div>
                </div>
                <div class="summary-card pending">
                  <i class="fas fa-clock"></i>
                  <div class="summary-content">
                    <span class="summary-label">Chưa chấm</span>
                    <span class="summary-value">{{ assignment.submitted - gradedCount }}</span>
                  </div>
                </div>
                <div class="summary-card avg">
                  <i class="fas fa-star"></i>
                  <div class="summary-content">
                    <span class="summary-label">Điểm trung bình</span>
                    <span class="summary-value">{{ averageScore }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="confirm-section">
              <h4>Sinh viên đã chấm ({{ gradedCount }})</h4>
              <div class="graded-students-list">
                <div 
                  v-for="submission in gradedSubmissions" 
                  :key="submission.studentId"
                  class="graded-student-item"
                >
                  <span class="student-info-compact">
                    <img :src="submission.avatar" :alt="submission.studentName" class="avatar-mini" />
                    {{ submission.studentName }}
                  </span>
                  <span class="score-display">{{ submission.score }}/{{ assignment.maxScore }}</span>
                </div>
                <div v-if="gradedSubmissions.length === 0" class="no-graded">
                  Chưa có bài nào được chấm điểm
                </div>
              </div>
            </div>

            <div class="confirm-warning">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Bạn có chắc chắn muốn lưu kết quả chấm điểm không?</span>
            </div>
          </div>

          <div class="confirmation-footer">
            <button @click="cancelConfirmation" class="btn-confirm-cancel">
              <i class="fas fa-times"></i>
              Hủy
            </button>
            <button @click="confirmSave" class="btn-confirm-save">
              <i class="fas fa-save"></i>
              Lưu điểm
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- View Submission Modal -->
    <Transition name="modal">
      <div v-if="viewingSubmission" class="submission-viewer-overlay" @click.self="closeViewer">
        <div class="submission-viewer">
          <div class="viewer-header">
            <h3>Bài làm của {{ viewingSubmission.studentName }}</h3>
            <button @click="closeViewer" class="btn-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="viewer-body">
            <div v-for="(question, index) in assignment.questions" :key="question.id" class="question-view">
              <div class="question-header-view">
                <span class="question-label">Câu {{ index + 1 }} ({{ question.points }} điểm)</span>
                <span class="question-type">{{ question.type === 'essay' ? 'Tự luận' : 'Trắc nghiệm' }}</span>
              </div>
              <p class="question-content">{{ question.content }}</p>
              
              <!-- Essay Answer -->
              <div v-if="question.type === 'essay'" class="answer-box">
                <strong>Câu trả lời:</strong>
                <p>{{ viewingSubmission.answers[index] || 'Chưa trả lời' }}</p>
                
                <!-- Uploaded Files -->
                <div v-if="viewingSubmission.files && viewingSubmission.files[question.id]" class="uploaded-files-viewer">
                  <strong class="files-label">
                    <i class="fas fa-paperclip"></i>
                    Tệp đính kèm:
                  </strong>
                  <div class="files-list">
                    <div 
                      v-for="(file, fileIndex) in viewingSubmission.files[question.id]" 
                      :key="fileIndex"
                      class="file-item-viewer"
                    >
                      <i :class="getFileIcon(file.name)" class="file-icon"></i>
                      <div class="file-info-viewer">
                        <span class="file-name-viewer">{{ file.name }}</span>
                        <span class="file-size-viewer">{{ formatFileSize(file.size) }}</span>
                      </div>
                      <div class="file-actions">
                        <button @click="previewFile(file)" class="btn-preview-viewer">
                          <i class="fas fa-eye"></i>
                          Xem
                        </button>
                        <a :href="file.url" download class="btn-download-viewer">
                          <i class="fas fa-download"></i>
                          Tải xuống
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Multiple Choice Answer -->
              <div v-else class="answer-box">
                <strong>Đáp án đã chọn:</strong>
                <p>{{ getAnswerLetter(viewingSubmission.answers[index]) }}. {{ question.options[viewingSubmission.answers[index]] }}</p>
                <p v-if="viewingSubmission.answers[index] === question.correctAnswer" class="correct">
                  <i class="fas fa-check-circle"></i> Đúng
                </p>
                <p v-else class="incorrect">
                  <i class="fas fa-times-circle"></i> Sai - Đáp án đúng: {{ getAnswerLetter(question.correctAnswer) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- File Preview Modal -->
    <Transition name="modal">
      <div v-if="previewingFile" class="file-preview-overlay" @click.self="closePreview">
        <div class="file-preview-modal">
          <div class="preview-header">
            <div class="preview-title">
              <i :class="getFileIcon(previewingFile.name)" class="file-icon"></i>
              <span>{{ previewingFile.name }}</span>
              <span class="file-size-badge">{{ formatFileSize(previewingFile.size) }}</span>
            </div>
            <div class="preview-actions">
              <a :href="previewingFile.url" download class="btn-download-preview">
                <i class="fas fa-download"></i>
                Tải xuống
              </a>
              <button @click="closePreview" class="btn-close">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="preview-body">
            <!-- PDF Preview -->
            <div v-if="(previewingFile.type || getFileType(previewingFile.name)) === 'pdf'" class="pdf-preview">
              <iframe :src="previewingFile.url" frameborder="0"></iframe>
            </div>

            <!-- Image Preview -->
            <div v-else-if="(previewingFile.type || getFileType(previewingFile.name)) === 'image'" class="image-preview">
              <img :src="previewingFile.url" :alt="previewingFile.name">
            </div>

            <!-- Code Preview -->
            <div v-else-if="(previewingFile.type || getFileType(previewingFile.name)) === 'code'" class="code-preview">
              <div class="code-header">
                <span class="code-language">{{ getCodeLanguage(previewingFile.name) }}</span>
                <button @click="copyCode" class="btn-copy-code">
                  <i class="fas fa-copy"></i>
                  {{ codeCopied ? 'Đã sao chép!' : 'Sao chép code' }}
                </button>
              </div>
              <pre><code>{{ previewingFile.content || 'Đang tải nội dung...' }}</code></pre>
            </div>

            <!-- Document Preview (Word, Excel, etc) -->
            <div v-else-if="(previewingFile.type || getFileType(previewingFile.name)) === 'document'" class="document-preview">
              <div class="document-viewer">
                <div class="viewer-loading">
                  <i class="fas fa-spinner fa-spin"></i>
                  <p>Đang tải file Word/Excel...</p>
                </div>
                <iframe 
                  :src="`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewingFile.url)}`"
                  frameborder="0"
                ></iframe>
              </div>
              <div class="office-viewer-notice">
                <i class="fas fa-info-circle"></i>
                <span>Sử dụng Microsoft Office Online Viewer</span>
                <a 
                  :href="`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(previewingFile.url)}`" 
                  target="_blank"
                  class="btn-open-new-tab"
                >
                  <i class="fas fa-external-link-alt"></i>
                  Mở tab mới
                </a>
              </div>
            </div>

            <!-- Archive Preview (ZIP, RAR) -->
            <div v-else-if="(previewingFile.type || getFileType(previewingFile.name)) === 'archive'" class="archive-preview">
              <div class="preview-notice">
                <i class="fas fa-file-archive"></i>
                <h4>File nén {{ getFileExtension(previewingFile.name).toUpperCase() }}</h4>
                <p>File <strong>{{ previewingFile.name }}</strong> chứa các file đã được nén.</p>
                <p class="archive-hint">Tải về để giải nén và xem nội dung bên trong.</p>
                <div class="archive-info">
                  <span><i class="fas fa-info-circle"></i> Kích thước: {{ formatFileSize(previewingFile.size) }}</span>
                </div>
              </div>
            </div>

            <!-- Text Preview -->
            <div v-else class="text-preview">
              <pre>{{ previewingFile.content || 'Đang tải nội dung...' }}</pre>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  assignment: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

// Mock student submissions
const submissions = ref([
  {
    studentId: 'SV001',
    studentName: 'Nguyễn Văn An',
    avatar: 'https://i.pravatar.cc/150?img=11',
    submitTime: '2025-10-28T14:30:00',
    isLate: false,
    score: 8.5,
    feedback: 'Bài làm tốt, code sạch và logic rõ ràng.',
    showFeedback: false,
    answers: ['Đã implement đầy đủ các phương thức CRUD...', 'Code được tổ chức tốt...', 'Test cases đầy đủ...'],
    files: {
      1: [
        { name: 'Student.java', size: 2400, url: '#', type: 'code' },
        { name: 'class_diagram.pdf', size: 125400, url: 'https://pdfobject.com/pdf/sample.pdf', type: 'pdf' }
      ],
      2: [
        { name: 'StudentManager.java', size: 5890, url: '#', type: 'code' },
        { name: 'implementation_notes.docx', size: 45800, url: 'https://file-examples.com/storage/fe7c6d3f6a66b28f4fd1e3b/2017/02/file-sample_100kB.doc', type: 'document' }
      ]
    }
  },
  {
    studentId: 'SV002',
    studentName: 'Trần Thị Bình',
    avatar: 'https://i.pravatar.cc/150?img=5',
    submitTime: '2025-10-29T09:15:00',
    isLate: false,
    score: 9.0,
    feedback: 'Xuất sắc! Code rất tốt và có thêm error handling.',
    showFeedback: false,
    answers: ['Implementation hoàn chỉnh...', 'Có validation tốt...', 'Test coverage cao...'],
    files: {
      1: [
        { name: 'Student.java', size: 3200, url: '#', type: 'code' },
        { name: 'architecture.pdf', size: 245000, url: 'https://pdfobject.com/pdf/sample.pdf', type: 'pdf' }
      ],
      2: [
        { name: 'StudentManager.java', size: 8900, url: '#', type: 'code' },
        { name: 'validation_code.java', size: 2500, url: '#', type: 'code' }
      ],
      3: [
        { name: 'TestCases.java', size: 6800, url: '#', type: 'code' },
        { name: 'student_management.zip', size: 1548000, url: '#', type: 'archive' },
        { name: 'demo_report.docx', size: 125000, url: 'https://file-examples.com/storage/fe7c6d3f6a66b28f4fd1e3b/2017/02/file-sample_100kB.doc', type: 'document' }
      ]
    }
  },
  {
    studentId: 'SV003',
    studentName: 'Lê Hoàng Cường',
    avatar: 'https://i.pravatar.cc/150?img=12',
    submitTime: '2025-10-29T16:45:00',
    isLate: false,
    score: null,
    feedback: '',
    showFeedback: false,
    answers: ['Đã làm cơ bản...', 'Còn thiếu một số method...', 'Chưa có test...'],
    files: {
      1: [
        { name: 'Student.java', size: 1800, url: '#', type: 'code' }
      ],
      3: [
        { name: 'source_code.zip', size: 845000, url: '#', type: 'archive' }
      ]
    }
  },
  {
    studentId: 'SV004',
    studentName: 'Phạm Minh Duy',
    avatar: 'https://i.pravatar.cc/150?img=13',
    submitTime: '2025-10-30T23:30:00',
    isLate: true,
    score: null,
    feedback: '',
    showFeedback: false,
    answers: ['Code chạy được...', 'Logic đúng...', 'Test cơ bản...'],
    files: {
      1: [
        { name: 'Student_v2.java', size: 2100, url: '#', type: 'code' },
        { name: 'diagram.pdf', size: 95000, url: 'https://www.clickdimensions.com/links/TestPDFfile.pdf', type: 'pdf' }
      ],
      3: [
        { name: 'project.zip', size: 2145000, url: '#', type: 'archive' },
        { name: 'documentation.pdf', size: 356000, url: 'https://pdfobject.com/pdf/sample.pdf', type: 'pdf' }
      ]
    }
  },
  {
    studentId: 'SV005',
    studentName: 'Vũ Thu Hà',
    avatar: 'https://i.pravatar.cc/150?img=9',
    submitTime: '2025-10-28T20:00:00',
    isLate: false,
    score: 7.5,
    feedback: 'Tốt, nhưng cần cải thiện performance.',
    showFeedback: false,
    answers: ['Implement đầy đủ...', 'Code hơi dài...', 'Test ổn...'],
    files: {
      2: [
        { name: 'StudentManager_full.java', size: 12000, url: '#', type: 'code' },
        { name: 'implementation_guide.docx', size: 78000, url: 'https://scholar.harvard.edu/files/torman_personal/files/sampledocx.docx', type: 'document' }
      ],
      3: [
        { name: 'TestSuite.java', size: 8500, url: '#', type: 'code' },
        { name: 'app_source.zip', size: 1245000, url: '#', type: 'archive' }
      ]
    }
  }
])

const searchQuery = ref('')
const filterStatus = ref('all')
const viewingSubmission = ref(null)
const showConfirmation = ref(false)
const previewingFile = ref(null)
const codeCopied = ref(false)

const gradedCount = computed(() => {
  return submissions.value.filter(s => s.score !== null).length
})

const averageScore = computed(() => {
  const graded = submissions.value.filter(s => s.score !== null)
  if (graded.length === 0) return '--'
  const avg = graded.reduce((sum, s) => sum + s.score, 0) / graded.length
  return avg.toFixed(2)
})

const gradedSubmissions = computed(() => {
  return submissions.value.filter(s => s.score !== null)
})

const filteredSubmissions = computed(() => {
  let result = submissions.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s => 
      s.studentName.toLowerCase().includes(query) ||
      s.studentId.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (filterStatus.value === 'graded') {
    result = result.filter(s => s.score !== null)
  } else if (filterStatus.value === 'pending') {
    result = result.filter(s => s.score === null)
  }

  return result
})

const formatSubmitTime = (time) => {
  const d = new Date(time)
  return d.toLocaleString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const toggleFeedback = (submission) => {
  submission.showFeedback = !submission.showFeedback
}

const updateScore = (submission) => {
  // Auto-save on score change
}

const viewSubmission = (submission) => {
  viewingSubmission.value = submission
}

const closeViewer = () => {
  viewingSubmission.value = null
}

const getAnswerLetter = (index) => {
  return String.fromCharCode(65 + index)
}

const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'fas fa-file-pdf'
  if (ext === 'doc' || ext === 'docx') return 'fas fa-file-word'
  if (ext === 'zip' || ext === 'rar') return 'fas fa-file-archive'
  if (ext === 'py' || ext === 'js' || ext === 'java' || ext === 'cpp') return 'fas fa-file-code'
  return 'fas fa-file'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const close = () => {
  emit('close')
}

const showConfirmDialog = () => {
  showConfirmation.value = true
}

const cancelConfirmation = () => {
  showConfirmation.value = false
}

const confirmSave = () => {
  saveGrades()
  showConfirmation.value = false
}

const saveGrades = () => {
  emit('save', submissions.value)
}

// File preview functions
const previewFile = (file) => {
  // For code files, add mock content
  const fileType = file.type || getFileType(file.name)
  
  if (fileType === 'code') {
    // Mock code content for demonstration
    file.content = getMockCodeContent(file.name)
  }
  
  previewingFile.value = file
}

const closePreview = () => {
  previewingFile.value = null
  codeCopied.value = false
}

const getFileType = (fileName) => {
  const ext = getFileExtension(fileName).toLowerCase()
  
  if (ext === 'pdf') return 'pdf'
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'image'
  if (['java', 'js', 'py', 'cpp', 'c', 'h', 'cs', 'php', 'rb', 'go', 'ts', 'jsx', 'tsx', 'vue', 'html', 'css', 'scss', 'json', 'xml', 'sql', 'sh'].includes(ext)) return 'code'
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'document'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive'
  
  return 'text'
}

const getFileExtension = (fileName) => {
  return fileName.split('.').pop() || ''
}

const getCodeLanguage = (fileName) => {
  const ext = getFileExtension(fileName).toLowerCase()
  const languageMap = {
    'java': 'Java',
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'py': 'Python',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'php': 'PHP',
    'rb': 'Ruby',
    'go': 'Go',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'vue': 'Vue',
    'jsx': 'React JSX',
    'tsx': 'React TSX',
    'json': 'JSON',
    'xml': 'XML',
    'sql': 'SQL',
    'sh': 'Shell'
  }
  return languageMap[ext] || ext.toUpperCase()
}

const copyCode = () => {
  if (previewingFile.value?.content) {
    navigator.clipboard.writeText(previewingFile.value.content)
    codeCopied.value = true
    setTimeout(() => {
      codeCopied.value = false
    }, 2000)
  }
}

const getMockCodeContent = (fileName) => {
  const ext = getFileExtension(fileName).toLowerCase()
  
  if (ext === 'java') {
    return `public class Student {
    private String id;
    private String name;
    private String email;
    private double gpa;
    
    // Constructor
    public Student(String id, String name, String email, double gpa) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.gpa = gpa;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public double getGpa() {
        return gpa;
    }
    
    public void setGpa(double gpa) {
        this.gpa = gpa;
    }
    
    @Override
    public String toString() {
        return "Student{" +
                "id='" + id + '\\'' +
                ", name='" + name + '\\'' +
                ", email='" + email + '\\'' +
                ", gpa=" + gpa +
                '}';
    }
}`
  }
  
  return `// Mock content for ${fileName}
// In production, this would be fetched from the server

console.log("File content preview");`
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
  border-radius: 20px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px 20px 0 0;
}

.header-info h2 {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.assignment-title {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.btn-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-body {
  padding: 24px 32px;
  overflow-y: auto;
  flex: 1;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
}

.stat-card i {
  font-size: 32px;
  color: #3b82f6;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.search-box {
  flex: 1;
  max-width: 350px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 13px;
  color: #6b7280;
}

.filter-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.filter-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.submission-item {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: white;
  transition: all 0.2s;
}

.submission-item.graded {
  background: #f0fdf4;
  border-color: #86efac;
}

.submission-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.student-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.student-details {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 700;
  color: #1f2937;
  font-size: 15px;
}

.student-id {
  font-size: 13px;
  color: #6b7280;
}

.submission-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #6b7280;
}

.late-badge {
  padding: 4px 8px;
  background: #fef3c7;
  color: #d97706;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
}

.grading-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-view {
  padding: 8px 14px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #374151;
}

.btn-view:hover {
  background: #e5e7eb;
}

.score-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.score-input {
  width: 80px;
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  color: #1f2937;
}

.score-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.max-score {
  font-weight: 600;
  color: #6b7280;
}

.btn-feedback {
  padding: 8px 14px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #374151;
}

.btn-feedback:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-feedback.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.feedback-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.feedback-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.feedback-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.modal-footer {
  padding: 20px 32px;
  border-top: 2px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f9fafb;
  border-radius: 0 0 20px 20px;
}

.btn-cancel,
.btn-save {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Submission Viewer */
.submission-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
}

.submission-viewer {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.viewer-header {
  padding: 20px 24px;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.viewer-header h3 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
}

.viewer-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.question-view {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.question-view:last-child {
  border-bottom: none;
}

.question-header-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.question-label {
  font-weight: 700;
  color: #1f2937;
}

.question-type {
  font-size: 12px;
  padding: 4px 8px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
  font-weight: 600;
}

.question-content {
  margin: 8px 0 12px;
  color: #374151;
  font-size: 15px;
}

.answer-box {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.answer-box strong {
  display: block;
  margin-bottom: 8px;
  color: #1f2937;
}

.answer-box p {
  margin: 4px 0;
  color: #374151;
}

.correct {
  color: #059669;
  font-weight: 600;
}

.incorrect {
  color: #dc2626;
  font-weight: 600;
}

.uploaded-files-viewer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.files-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  margin-bottom: 12px;
  font-size: 14px;
}

.files-label i {
  color: #6b7280;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item-viewer {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.file-item-viewer:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.file-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.file-icon.fa-file-pdf {
  color: #dc2626;
}

.file-icon.fa-file-word {
  color: #2563eb;
}

.file-icon.fa-file-archive {
  color: #f59e0b;
}

.file-icon.fa-file-code {
  color: #8b5cf6;
}

.file-icon.fa-file {
  color: #6b7280;
}

.file-info-viewer {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name-viewer {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size-viewer {
  font-size: 12px;
  color: #6b7280;
}

.btn-download-viewer {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  text-decoration: none;
  flex-shrink: 0;
}

.btn-download-viewer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Confirmation Dialog */
.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
}

.confirmation-dialog {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s;
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

.confirmation-header {
  padding: 24px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 2px solid #86efac;
}

.confirmation-header i {
  font-size: 32px;
  color: #059669;
}

.confirmation-header h3 {
  margin: 0;
  font-size: 20px;
  color: #065f46;
  font-weight: 700;
}

.confirmation-body {
  padding: 24px;
  max-height: 500px;
  overflow-y: auto;
}

.confirm-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.confirm-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.confirm-section h4 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.confirm-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.confirm-row:last-child {
  border-bottom: none;
}

.confirm-row .label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.confirm-row .value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
}

.grading-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
}

.summary-card.total {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.summary-card.graded {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.summary-card.pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.summary-card.avg {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
}

.summary-card i {
  font-size: 24px;
}

.summary-card.total i {
  color: #1e40af;
}

.summary-card.graded i {
  color: #059669;
}

.summary-card.pending i {
  color: #d97706;
}

.summary-card.avg i {
  color: #be185d;
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.graded-students-list {
  max-height: 200px;
  overflow-y: auto;
  background: #f9fafb;
  border-radius: 8px;
  padding: 8px;
}

.graded-student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 6px;
  border: 1px solid #e5e7eb;
}

.graded-student-item:last-child {
  margin-bottom: 0;
}

.student-info-compact {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.avatar-mini {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.score-display {
  font-size: 15px;
  font-weight: 700;
  color: #059669;
  background: #d1fae5;
  padding: 4px 12px;
  border-radius: 6px;
}

.no-graded {
  text-align: center;
  padding: 30px 20px;
  color: #9ca3af;
  font-size: 14px;
}

.confirm-warning {
  margin-top: 20px;
  padding: 16px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.confirm-warning i {
  color: #d97706;
  font-size: 20px;
}

.confirm-warning span {
  color: #92400e;
  font-weight: 600;
  font-size: 14px;
}

.confirmation-footer {
  padding: 20px 24px;
  background: #f9fafb;
  border-radius: 0 0 16px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 2px solid #e5e7eb;
}

.btn-confirm-cancel,
.btn-confirm-save {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-confirm-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-confirm-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm-save {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-confirm-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .summary-stats {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: 100%;
  }

  .filter-buttons {
    flex-wrap: wrap;
  }

  .grading-section {
    flex-wrap: wrap;
  }

  .grading-summary {
    grid-template-columns: 1fr;
  }

  .confirmation-dialog {
    width: 95%;
    max-height: 95vh;
  }
}

/* File Preview Modal Styles */
.file-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.file-preview-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s;
}

.preview-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 2px solid #d1d5db;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.preview-title .file-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.preview-title > span:first-of-type {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size-badge {
  background: #6366f1;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-download-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  white-space: nowrap;
}

.btn-download-preview:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.preview-body {
  flex: 1;
  overflow: auto;
  background: #f9fafb;
}

/* PDF Preview */
.pdf-preview {
  height: 100%;
  min-height: 600px;
}

.pdf-preview iframe {
  width: 100%;
  height: 100%;
  min-height: 600px;
  border: none;
}

/* Image Preview */
.image-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 400px;
  background: #1f2937;
}

.image-preview img {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

/* Code Preview */
.code-preview {
  padding: 0;
  min-height: 400px;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #1f2937;
  border-bottom: 2px solid #374151;
}

.code-language {
  color: #60a5fa;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-copy-code {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #374151;
  color: white;
  border: 1px solid #4b5563;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-copy-code:hover {
  background: #4b5563;
  border-color: #6b7280;
}

.code-preview pre {
  margin: 0;
  padding: 24px;
  background: #1f2937;
  color: #e5e7eb;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
}

.code-preview code {
  font-family: inherit;
}

/* Document Preview */
.document-preview {
  position: relative;
  height: 100%;
  min-height: 600px;
  background: #f3f4f6;
}

.document-viewer {
  position: relative;
  height: calc(100% - 50px);
  min-height: 550px;
  background: white;
}

.viewer-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #6b7280;
  z-index: 1;
}

.viewer-loading i {
  font-size: 48px;
  color: #3b82f6;
  margin-bottom: 16px;
}

.viewer-loading p {
  font-size: 14px;
  margin: 0;
}

.document-viewer iframe {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 550px;
  border: none;
  background: white;
  z-index: 2;
}

.office-viewer-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 13px;
}

.office-viewer-notice i {
  color: #3b82f6;
}

.btn-open-new-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  margin-left: auto;
}

.btn-open-new-tab:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.archive-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  min-height: 400px;
}

.preview-notice {
  text-align: center;
  max-width: 500px;
}

.preview-notice i {
  font-size: 64px;
  color: #3b82f6;
  margin-bottom: 24px;
}

.preview-notice h4 {
  font-size: 20px;
  color: #1f2937;
  margin: 0 0 16px 0;
  font-weight: 700;
}

.preview-notice p {
  color: #6b7280;
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.preview-suggestion {
  font-weight: 600;
  color: #374151;
  margin-top: 24px !important;
}

.btn-office-viewer {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  margin-top: 16px;
}

.btn-office-viewer:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.archive-info {
  margin-top: 24px;
  padding: 16px;
  background: #f3f4f6;
  border-radius: 10px;
  color: #4b5563;
  font-size: 14px;
}

.archive-info i {
  font-size: 14px;
  margin-right: 8px;
  color: #6366f1;
}

.archive-hint {
  color: #374151 !important;
  font-weight: 500;
}

/* Text Preview */
.text-preview {
  padding: 24px;
  min-height: 400px;
}

.text-preview pre {
  margin: 0;
  padding: 20px;
  background: white;
  color: #1f2937;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* File Actions in Viewer */
.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-preview-viewer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-preview-viewer:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-download-viewer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  white-space: nowrap;
}

.btn-download-viewer:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

@media (max-width: 768px) {
  .file-preview-modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .preview-header {
    flex-wrap: wrap;
    padding: 16px;
  }

  .preview-title {
    width: 100%;
    margin-bottom: 12px;
  }

  .preview-actions {
    width: 100%;
    justify-content: space-between;
  }

  .file-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-preview-viewer,
  .btn-download-viewer {
    width: 100%;
    justify-content: center;
  }
}
</style>

