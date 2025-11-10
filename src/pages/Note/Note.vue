<template>
  <div class="notes-management">
    <!-- Modern Header with Breadcrumb and Search -->
    <div class="modern-header">
      <div class="breadcrumb">
        <i class="fas fa-home"></i>
        <span>Dashboard</span>
        <i class="fas fa-angle-right"></i>
        <span class="current">Ghi chú</span>
      </div>
      
      <div class="header-main">
        <div class="title-section">
          <h1>
            <i class="fas fa-sticky-note header-icon"></i>
            Quản lý Ghi chú
          </h1>
          <p>Tạo, quản lý và tổ chức ghi chú một cách thông minh</p>
        </div>
        
        <div class="header-search">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="filters.search" 
              placeholder="Tìm kiếm ghi chú, thẻ, nội dung..."
              class="search-input"
            />
            <button v-if="filters.search" @click="filters.search = ''" class="clear-search">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="createNewNote" class="btn-create">
            <i class="fas fa-plus"></i>
            <span>Tạo mới</span>
          </button>
          <div class="view-toggle">
            <button 
              @click="viewMode = 'grid'" 
              :class="{ active: viewMode === 'grid' }"
              class="view-btn"
            >
              <i class="fas fa-th-large"></i>
            </button>
            <button 
              @click="viewMode = 'list'" 
              :class="{ active: viewMode === 'list' }"
              class="view-btn"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Layout with Sidebar -->
    <div class="main-layout">
      <!-- Sidebar -->
      <div class="sidebar">
        <!-- Statistics Cards -->
        <div class="stats-section">
          <h3 class="section-title">
            <i class="fas fa-chart-bar"></i>
            Thống kê
          </h3>
          <div class="mini-stats">
            <div class="mini-stat-card">
              <div class="stat-icon total">
                <i class="fas fa-sticky-note"></i>
              </div>
              <div class="stat-info">
                <span class="stat-number">{{ stats.total }}</span>
                <span class="stat-label">Tổng</span>
              </div>
            </div>
            <div class="mini-stat-card">
              <div class="stat-icon active">
                <i class="fas fa-edit"></i>
              </div>
              <div class="stat-info">
                <span class="stat-number">{{ stats.active }}</span>
                <span class="stat-label">Hoạt động</span>
              </div>
            </div>
            <div class="mini-stat-card">
              <div class="stat-icon favorites">
                <i class="fas fa-heart"></i>
              </div>
              <div class="stat-info">
                <span class="stat-number">{{ stats.favorites }}</span>
                <span class="stat-label">Yêu thích</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Filters -->
        <div class="filters-section">
          <h3 class="section-title">
            <i class="fas fa-filter"></i>
            Bộ lọc
          </h3>
          <div class="quick-filters">
            <button 
              @click="setQuickFilter('all')" 
              :class="{ active: quickFilter === 'all' }"
              class="filter-btn"
            >
              <i class="fas fa-sticky-note"></i>
              Tất cả
            </button>
            <button 
              @click="setQuickFilter('favorites')" 
              :class="{ active: quickFilter === 'favorites' }"
              class="filter-btn"
            >
              <i class="fas fa-heart"></i>
              Yêu thích
            </button>
            <button 
              @click="setQuickFilter('recent')" 
              :class="{ active: quickFilter === 'recent' }"
              class="filter-btn"
            >
              <i class="fas fa-clock"></i>
              Gần đây
            </button>
            <button 
              @click="setQuickFilter('archived')" 
              :class="{ active: quickFilter === 'archived' }"
              class="filter-btn"
            >
              <i class="fas fa-archive"></i>
              Lưu trữ
            </button>
          </div>
        </div>

        <!-- Categories -->
        <div class="categories-section">
          <h3 class="section-title">
            <i class="fas fa-folder"></i>
            Danh mục
          </h3>
          <div class="category-list">
            <button 
              v-for="category in categories" 
              :key="category.value"
              @click="toggleCategory(category.value)"
              :class="{ active: filters.category === category.value }"
              class="category-btn"
            >
              <i :class="category.icon"></i>
              <span>{{ category.label }}</span>
              <span class="count">{{ getCategoryCount(category.value) }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-area">
        <!-- Toolbar -->
        <div class="content-toolbar">
          <div class="toolbar-left">
            <h2 class="content-title">
              {{ getContentTitle() }}
            </h2>
            <span class="notes-count">{{ filteredNotes.length }} ghi chú</span>
          </div>
          
          <div class="toolbar-right">
            <div class="sort-controls">
              <select v-model="sortBy" class="sort-select">
                <option value="updatedAt">Mới cập nhật</option>
                <option value="createdAt">Mới tạo</option>
                <option value="title">Tên A-Z</option>
                <option value="priority">Độ ưu tiên</option>
              </select>
            </div>
            
            <div class="density-control">
              <button 
                @click="toggleDensity"
                class="density-btn"
                :title="density === 'comfortable' ? 'Chế độ compact' : 'Chế độ comfortable'"
              >
                <i :class="density === 'comfortable' ? 'fas fa-compress' : 'fas fa-expand'"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Notes Container -->
        <div class="notes-wrapper">
          <NotesList 
            :notes="filteredNotes"
            :viewMode="viewMode"
            :density="density"
            :selectedNotes="selectedNotes"
            @update:selectedNotes="selectedNotes = $event"
            @view="viewNoteWithRouter"
            @edit="editNoteWithRouter"
            @delete="deleteNote"
            @toggle-favorite="toggleFavorite"
            @toggle-archive="toggleArchive"
          />
        </div>

        <!-- Empty State -->
        <div v-if="filteredNotes.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-sticky-note"></i>
          </div>
          <h3>Không có ghi chú nào</h3>
          <p>{{ getEmptyStateMessage() }}</p>
          <button @click="createNewNote" class="btn-create">
            <i class="fas fa-plus"></i>
            Tạo ghi chú đầu tiên
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Bulk Actions -->
    <Transition name="slide-up">
      <div v-if="selectedNotes.length > 0" class="floating-bulk-actions">
        <div class="bulk-actions-content">
          <div class="selection-info">
            <i class="fas fa-check-circle"></i>
            <span>Đã chọn {{ selectedNotes.length }} ghi chú</span>
          </div>
          <div class="bulk-buttons">
            <button @click="handleBulkFavorite(selectedNotes)" class="bulk-btn">
              <i class="fas fa-heart"></i>
            </button>
            <button @click="handleBulkArchive(selectedNotes)" class="bulk-btn">
              <i class="fas fa-archive"></i>
            </button>
            <button @click="handleBulkDelete(selectedNotes)" class="bulk-btn danger">
              <i class="fas fa-trash"></i>
            </button>
            <button @click="selectedNotes = []" class="bulk-btn cancel">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Create/Edit Note Modal -->
    <NoteModal 
      :isVisible="showCreateModal || showEditModal"
      :note="editingNote"
      :isEditing="!!editingNote"
      @close="closeModalsWithRouter"
      @save="saveNote"
      @save-draft="saveNote"
    />

    <!-- View Note Modal -->
    <NoteViewModal 
      :isVisible="showViewModal"
      :note="viewingNote"
      @close="closeViewModalWithRouter"
      @edit="editFromView"
      @delete="deleteNote"
      @toggle-favorite="toggleFavorite"
      @toggle-archive="toggleArchive"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NotesList from '@/components/Notes/NotesList.vue'
import NoteModal from '@/components/Notes/NoteModal.vue'
import NoteViewModal from '@/components/Notes/NoteViewModal.vue'

// Router
const route = useRoute()
const router = useRouter()

// Reactive data
const viewMode = ref('grid') // 'grid' or 'list'
const density = ref('comfortable') // 'comfortable' or 'compact'
const quickFilter = ref('all')
const sortBy = ref('updatedAt')
const filters = ref({
  search: '',
  category: '',
  status: '',
  priority: '',
  dateRange: null
})
const selectedNotes = ref([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const editingNote = ref(null)
const viewingNote = ref(null)

// Categories data
const categories = [
  { value: '', label: 'Tất cả', icon: 'fas fa-sticky-note' },
  { value: 'study', label: 'Học tập', icon: 'fas fa-graduation-cap' },
  { value: 'project', label: 'Dự án', icon: 'fas fa-project-diagram' },
  { value: 'resource', label: 'Tài liệu', icon: 'fas fa-book' },
  { value: 'meeting', label: 'Họp', icon: 'fas fa-users' },
  { value: 'personal', label: 'Cá nhân', icon: 'fas fa-user' }
]

// Sample data - in real app, this would come from API
const notes = ref([
  {
    id: 1,
    title: 'Kế hoạch học tập học kỳ 1',
    content: 'Lập kế hoạch chi tiết cho các môn học trong học kỳ 1, bao gồm thời gian biểu, mục tiêu và phương pháp học tập hiệu quả.\n\n## Mục tiêu chính\n- Đạt điểm trung bình >= 8.0\n- Hoàn thành tất cả đồ án đúng hạn\n- Tham gia ít nhất 2 hoạt động ngoại khóa\n\n## Kế hoạch chi tiết\n1. **Tuần 1-2**: Ôn tập kiến thức cũ\n2. **Tuần 3-4**: Học bài mới và làm bài tập\n3. **Tuần 5-6**: Chuẩn bị cho kỳ thi giữa kỳ',
    category: 'study',
    priority: 'high',
    status: 'active',
    isFavorite: true,
    isArchived: false,
    tags: ['học tập', 'kế hoạch', 'học kỳ'],
    createdAt: new Date('2024-09-20T08:00:00'),
    updatedAt: new Date('2024-09-25T14:30:00'),
    author: 'Nguyễn Văn An'
  },
  {
    id: 2,
    title: 'Ý tưởng đồ án cuối kỳ',
    content: 'Brainstorm các ý tưởng cho đồ án cuối kỳ môn Phát triển ứng dụng web. Cần tập trung vào tính thực tiễn và khả năng ứng dụng.\n\n### Ý tưởng 1: E-commerce Website\n- Xây dựng website bán hàng online\n- Sử dụng React/Vue.js frontend\n- Node.js + MongoDB backend\n- Tích hợp thanh toán online\n\n### Ý tưởng 2: Learning Management System\n- Hệ thống quản lý học tập trực tuyến\n- Chức năng upload bài giảng, nộp bài tập\n- Chat real-time giữa giáo viên và học sinh',
    category: 'project',
    priority: 'medium',
    status: 'active',
    isFavorite: false,
    isArchived: false,
    tags: ['đồ án', 'web development', 'ý tưởng'],
    createdAt: new Date('2024-09-18T10:15:00'),
    updatedAt: new Date('2024-09-24T16:45:00'),
    author: 'Trần Thị Bình'
  },
  {
    id: 3,
    title: 'Tài liệu tham khảo JavaScript',
    content: `Danh sách các tài liệu, khóa học và nguồn học JavaScript hữu ích. Bao gồm cả documentation và tutorial từ cơ bản đến nâng cao.

## Documentation chính thức
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [JavaScript.info](https://javascript.info/)

## Khóa học online
- Codecademy JavaScript Course
- FreeCodeCamp JavaScript Algorithms
- Udemy: The Complete JavaScript Course

## Sách hay
- "Eloquent JavaScript" by Marijn Haverbeke
- "You Don't Know JS" series by Kyle Simpson
- "JavaScript: The Good Parts" by Douglas Crockford`,
    category: 'resource',
    priority: 'low',
    status: 'active',
    isFavorite: true,
    isArchived: false,
    tags: ['javascript', 'tài liệu', 'học tập'],
    createdAt: new Date('2024-09-15T09:30:00'),
    updatedAt: new Date('2024-09-22T11:20:00'),
    author: 'Lê Minh Cường'
  },
  {
    id: 4,
    title: 'Meeting notes - Nhóm dự án',
    content: 'Ghi chú cuộc họp nhóm về phân chia công việc và timeline cho dự án. Cần follow up các task đã được assign.\n\n## Thành viên tham gia\n- Nguyễn Văn A (Team Leader)\n- Trần Thị B (Frontend Developer)\n- Lê Văn C (Backend Developer)\n- Phạm Thị D (Designer)\n\n## Nội dung họp\n1. **Tiến độ hiện tại**: 60% hoàn thành\n2. **Vấn đề gặp phải**: Database design cần review lại\n3. **Kế hoạch tuần tới**: \n   - A: Hoàn thiện API documentation\n   - B: Implement user authentication UI\n   - C: Fix database schema issues\n   - D: Create final mockups for admin panel',
    category: 'meeting',
    priority: 'high',
    status: 'completed',
    isFavorite: false,
    isArchived: false,
    tags: ['meeting', 'dự án', 'nhóm'],
    createdAt: new Date('2024-09-10T14:00:00'),
    updatedAt: new Date('2024-09-23T09:15:00'),
    author: 'Phạm Thị Dung'
  },
  {
    id: 5,
    title: 'Cài đặt môi trường phát triển',
    content: `Hướng dẫn cài đặt và cấu hình các công cụ cần thiết cho việc phát triển web.

## Công cụ cần thiết
### Code Editor
- **Visual Studio Code** (khuyên dùng)
- Extensions cần thiết:
  - Vetur (Vue.js support)
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - GitLens

### Runtime Environment
- **Node.js** (phiên bản LTS mới nhất)
- **npm** hoặc **yarn** package manager

### Database
- **MongoDB** cho NoSQL
- **PostgreSQL** cho SQL

### Version Control
- **Git** + **GitHub**
- Tạo SSH key để push code dễ dàng`,
    category: 'resource',
    priority: 'medium',
    status: 'active',
    isFavorite: false,
    isArchived: false,
    tags: ['setup', 'development', 'tools'],
    createdAt: new Date('2024-09-12T10:00:00'),
    updatedAt: new Date('2024-09-21T15:30:00'),
    author: 'Hoàng Văn Nam'
  },
  {
    id: 6,
    title: 'Ôn tập kiến thức Vue.js',
    content: `Tổng hợp các kiến thức quan trọng về Vue.js cần nắm vững.

## Composition API vs Options API
### Composition API (Vue 3)
\`\`\`javascript
// In SFC (Single File Component)
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

onMounted(() => {
  console.log('Component mounted')
})
\`\`\`

### Options API (Vue 2)
\`\`\`javascript
export default {
  data() {
    return {
      count: 0
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  mounted() {
    console.log('Component mounted')
  }
}
\`\`\`

## Lifecycle Hooks
- \`onMounted()\` - Component đã mount
- \`onUpdated()\` - Component đã update
- \`onUnmounted()\` - Component sắp unmount`,
    category: 'study',
    priority: 'high',
    status: 'active',
    isFavorite: true,
    isArchived: false,
    tags: ['vue', 'frontend', 'javascript'],
    createdAt: new Date('2024-09-08T14:20:00'),
    updatedAt: new Date('2024-09-20T09:45:00'),
    author: 'Nguyễn Thị Mai'
  }
])

// Stats
const stats = computed(() => ({
  total: notes.value.length,
  active: notes.value.filter(n => n.status === 'active').length,
  completed: notes.value.filter(n => n.status === 'completed').length,
  favorites: notes.value.filter(n => n.isFavorite).length,
  archived: notes.value.filter(n => n.isArchived).length
}))

// Filtered notes
const filteredNotes = computed(() => {
  let filtered = notes.value

  // Quick filter
  if (quickFilter.value === 'favorites') {
    filtered = filtered.filter(note => note.isFavorite)
  } else if (quickFilter.value === 'recent') {
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    filtered = filtered.filter(note => new Date(note.updatedAt) >= lastWeek)
  } else if (quickFilter.value === 'archived') {
    filtered = filtered.filter(note => note.isArchived)
  } else {
    // 'all' - show non-archived notes
    filtered = filtered.filter(note => !note.isArchived)
  }

  // Search filter
  if (filters.value.search) {
    const query = filters.value.search.toLowerCase()
    filtered = filtered.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Category filter
  if (filters.value.category) {
    filtered = filtered.filter(note => note.category === filters.value.category)
  }

  // Status filter
  if (filters.value.status) {
    filtered = filtered.filter(note => note.status === filters.value.status)
  }

  // Priority filter
  if (filters.value.priority) {
    filtered = filtered.filter(note => note.priority === filters.value.priority)
  }

  // Sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'createdAt':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      default: // updatedAt
        return new Date(b.updatedAt) - new Date(a.updatedAt)
    }
  })

  return filtered
})

// Methods
const resetFilters = () => {
  filters.value = {
    search: '',
    category: '',
    status: '',
    priority: '',
    dateRange: null
  }
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const toggleDensity = () => {
  density.value = density.value === 'comfortable' ? 'compact' : 'comfortable'
}

const setQuickFilter = (filter) => {
  quickFilter.value = filter
  // Reset other filters when changing quick filter
  if (filter !== 'all') {
    filters.value.category = ''
  }
}

const toggleCategory = (category) => {
  filters.value.category = filters.value.category === category ? '' : category
  quickFilter.value = 'all'
}

const getCategoryCount = (category) => {
  if (!category) return notes.value.length
  return notes.value.filter(note => note.category === category).length
}

const getContentTitle = () => {
  if (quickFilter.value === 'favorites') return 'Ghi chú yêu thích'
  if (quickFilter.value === 'recent') return 'Ghi chú gần đây'
  if (quickFilter.value === 'archived') return 'Ghi chú đã lưu trữ'
  if (filters.value.category) {
    const category = categories.find(c => c.value === filters.value.category)
    return category ? category.label : 'Ghi chú'
  }
  return 'Tất cả ghi chú'
}

const getEmptyStateMessage = () => {
  if (filters.value.search) return `Không tìm thấy ghi chú nào phù hợp với "${filters.value.search}"`
  if (quickFilter.value === 'favorites') return 'Bạn chưa có ghi chú yêu thích nào'
  if (quickFilter.value === 'recent') return 'Không có ghi chú nào được cập nhật trong tuần qua'
  if (quickFilter.value === 'archived') return 'Không có ghi chú nào được lưu trữ'
  if (filters.value.category) return 'Không có ghi chú nào trong danh mục này'
  return 'Bạn chưa có ghi chú nào. Hãy tạo ghi chú đầu tiên!'
}

const viewNote = (note) => {
  viewingNote.value = note
  showViewModal.value = true
}

const editNote = (note) => {
  editingNote.value = note
  showEditModal.value = true
}

const deleteNote = (note) => {
  if (confirm(`Bạn có chắc chắn muốn xóa ghi chú "${note.title}"?`)) {
    const index = notes.value.findIndex(n => n.id === note.id)
    if (index > -1) {
      notes.value.splice(index, 1)
    }
  }
}

const toggleFavorite = (note) => {
  const noteIndex = notes.value.findIndex(n => n.id === note.id)
  if (noteIndex > -1) {
    notes.value[noteIndex].isFavorite = !notes.value[noteIndex].isFavorite
  }
}

const toggleArchive = (note) => {
  const noteIndex = notes.value.findIndex(n => n.id === note.id)
  if (noteIndex > -1) {
    notes.value[noteIndex].isArchived = !notes.value[noteIndex].isArchived
  }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingNote.value = null
}

const closeViewModal = () => {
  showViewModal.value = false
  viewingNote.value = null
}

const editFromView = (note) => {
  closeViewModalWithRouter()
  editNoteWithRouter(note)
}

const saveNote = (noteData) => {
  let savedNote
  
  if (editingNote.value) {
    // Update existing note
    const index = notes.value.findIndex(n => n.id === editingNote.value.id)
    if (index > -1) {
      notes.value[index] = { 
        ...notes.value[index], 
        ...noteData, 
        updatedAt: new Date()
      }
      savedNote = notes.value[index]
    }
  } else {
    // Create new note
    const newNote = {
      id: Date.now(),
      ...noteData,
      status: 'active',
      isFavorite: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'Current User'
    }
    notes.value.unshift(newNote)
    savedNote = newNote
  }
  
  // Close modals and navigate
  closeModalsWithRouter()
  
  // Navigate to view the saved note
  if (savedNote) {
    setTimeout(() => {
      router.push({ name: 'notes-view', params: { id: savedNote.id } })
    }, 100)
  }
}

// Bulk Actions
const handleBulkDelete = (noteIds) => {
  notes.value = notes.value.filter(n => !noteIds.includes(n.id))
  selectedNotes.value = []
}

const handleBulkArchive = (noteIds) => {
  noteIds.forEach(id => {
    const note = notes.value.find(n => n.id === id)
    if (note) note.isArchived = !note.isArchived
  })
  selectedNotes.value = []
}

const handleBulkFavorite = (noteIds) => {
  noteIds.forEach(id => {
    const note = notes.value.find(n => n.id === id)
    if (note) note.isFavorite = !note.isFavorite
  })
  selectedNotes.value = []
}

const handleBulkCategory = ({ notes: noteIds, category }) => {
  noteIds.forEach(id => {
    const note = notes.value.find(n => n.id === id)
    if (note) note.category = category
  })
  selectedNotes.value = []
}

// Router-based methods
const createNewNote = () => {
  router.push({ name: 'notes-create' })
}

const viewNoteRoute = (note) => {
  router.push({ name: 'notes-view', params: { id: note.id } })
}

const editNoteRoute = (note) => {
  router.push({ name: 'notes-edit', params: { id: note.id } })
}

const backToNotes = () => {
  router.push({ name: 'notes' })
}

// Handle route-based actions
const handleRouteAction = () => {
  const action = route.meta?.action
  const noteId = route.params?.id
  
  if (action === 'create') {
    showCreateModal.value = true
  } else if (action === 'view' && noteId) {
    const note = notes.value.find(n => n.id === parseInt(noteId))
    if (note) {
      viewNote(note)
    } else {
      // Note not found, redirect to notes list
      router.push({ name: 'notes' })
    }
  } else if (action === 'edit' && noteId) {
    const note = notes.value.find(n => n.id === parseInt(noteId))
    if (note) {
      editNote(note)
    } else {
      router.push({ name: 'notes' })
    }
  }
}

// Update existing methods to use router
const viewNoteWithRouter = (note) => {
  viewingNote.value = note
  showViewModal.value = true
  router.push({ name: 'notes-view', params: { id: note.id } })
}

const editNoteWithRouter = (note) => {
  editingNote.value = note
  showEditModal.value = true
  router.push({ name: 'notes-edit', params: { id: note.id } })
}

const closeModalsWithRouter = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingNote.value = null
  
  // Navigate back to notes list if we're on a specific note route
  if (route.name !== 'notes') {
    router.push({ name: 'notes' })
  }
}

const closeViewModalWithRouter = () => {
  showViewModal.value = false
  viewingNote.value = null
  
  // Navigate back to notes list
  if (route.name !== 'notes') {
    router.push({ name: 'notes' })
  }
}

// Watchers
watch(() => route.fullPath, () => {
  handleRouteAction()
}, { immediate: true })

// Lifecycle
onMounted(() => {
  handleRouteAction()
})
</script>

<style scoped>
.notes-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* Modern Header */
.modern-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

.breadcrumb .current {
  color: #3b82f6;
  font-weight: 500;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.title-section {
  flex: 1;
  min-width: 200px;
}

.title-section h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.header-icon {
  color: #3b82f6;
}

.title-section p {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

.header-search {
  flex: 1;
  max-width: 400px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 36px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-search {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.clear-search:hover {
  color: #6b7280;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.view-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 2px;
}

.view-btn {
  padding: 8px 10px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.view-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Main Layout */
.main-layout {
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Sidebar */
.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
}

/* Mini Stats */
.stats-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mini-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mini-stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  transition: all 0.2s;
}

.mini-stat-card:hover {
  background: #f1f5f9;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.stat-icon.total { background: #3b82f6; }
.stat-icon.active { background: #10b981; }
.stat-icon.favorites { background: #f59e0b; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

/* Quick Filters */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-filters {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.filter-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.filter-btn.active {
  background: #eff6ff;
  color: #3b82f6;
}

/* Categories */
.categories-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.category-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.category-btn.active {
  background: #eff6ff;
  color: #3b82f6;
}

.category-btn .count {
  margin-left: auto;
  font-size: 12px;
  background: #f3f4f6;
  color: #6b7280;
  padding: 2px 6px;
  border-radius: 10px;
}

.category-btn.active .count {
  background: #dbeafe;
  color: #3b82f6;
}

/* Content Area */
.content-area {
  flex: 1;
  min-width: 0;
}

.content-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.notes-count {
  font-size: 14px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
}

.density-btn {
  padding: 8px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.density-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Notes Wrapper */
.notes-wrapper {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
  color: #9ca3af;
  font-size: 32px;
}

.empty-state h3 {
  font-size: 18px;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 24px 0;
}

/* Floating Bulk Actions */
.floating-bulk-actions {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.bulk-actions-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: #1f2937;
  color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.bulk-buttons {
  display: flex;
  gap: 8px;
}

.bulk-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.bulk-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.bulk-btn.danger:hover {
  background: #ef4444;
}

.bulk-btn.cancel:hover {
  background: #6b7280;
}

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from, .slide-up-leave-to {
  transform: translateX(-50%) translateY(100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-layout {
    flex-direction: column;
    padding: 16px;
  }
  
  .sidebar {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .modern-header {
    padding: 12px 16px;
  }
  
  .header-main {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .header-search {
    max-width: none;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .content-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .toolbar-left, .toolbar-right {
    justify-content: space-between;
  }
  
  .sidebar {
    grid-template-columns: 1fr;
  }
}
</style>
