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
              placeholder="Tìm theo #thẻ (ví dụ: #todo) — tìm theo tiêu đề đã tắt"
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
              <span class="count">{{ stats.total }}</span>
            </button>
            <button 
              @click="setQuickFilter('favorites')" 
              :class="{ active: quickFilter === 'favorites' }"
              class="filter-btn"
            >
              <i class="fas fa-heart"></i>
              Yêu thích
              <span class="count">{{ stats.favorites }}</span>
            </button>
            <!-- Recent filter removed per request -->
            <button 
              @click="setQuickFilter('archived')" 
              :class="{ active: quickFilter === 'archived' }"
              class="filter-btn"
            >
              <i class="fas fa-archive"></i>
              Lưu trữ
              <span class="count">{{ stats.archived }}</span>
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
      @delete="confirmDeleteNote"
      @toggle-favorite="toggleFavorite"
      @toggle-archive="toggleArchive"
    />

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      v-model:show="showConfirmDelete"
      type="danger"
      title="Xác nhận xóa ghi chú"
      :message="`Bạn có chắc chắn muốn xóa ghi chú &quot;${noteToDelete?.title}&quot;?`"
      details="Hành động này không thể hoàn tác. Ghi chú sẽ bị xóa vĩnh viễn."
      confirmText="Xóa ghi chú"
      :loading="deletingNote"
      @confirm="executeDeleteNote"
      @cancel="cancelDeleteNote"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NotesList from '@/components/Notes/NotesList.vue'
import NoteModal from '@/components/Notes/NoteModal.vue'
import NoteViewModal from '@/components/Notes/NoteViewModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import { useNotes } from '@/hooks/useNotes'
import { formatRelativeTime } from '@/utils/formatters'
import { CATEGORY_MAP } from '@/types/note'

// Toast
const { success, error, info } = useToast()

// Notes hook
const {
  notes,
  totalCount,
  globalTotalCount,
  isLoading,
  currentPage,
  totalPages,
  fetchNotes,
  fetchNoteById,
  deleteNote: deleteNoteAPI,
  toggleFavorite: toggleFavoriteAPI,
  toggleArchive: toggleArchiveAPI,
  bulkDeleteNotes,
  search,
  filterByCategory,
  fetchGlobalCount,
  fetchCategoriesSummary,
  categoriesSummary,
  resetFilters
} = useNotes()

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

// Confirm delete
const showConfirmDelete = ref(false)
const noteToDelete = ref(null)
const deletingNote = ref(false)

// Categories data - khớp với database
const categories = [
  { value: '', label: 'Tất cả', icon: 'fas fa-sticky-note' },
  { value: 'study', label: 'Học tập', icon: 'fas fa-graduation-cap' },
  { value: 'project', label: 'Dự án', icon: 'fas fa-project-diagram' },
  { value: 'resource', label: 'Tài liệu', icon: 'fas fa-book' },
  { value: 'meeting', label: 'Họp', icon: 'fas fa-users' },
  { value: 'personal', label: 'Cá nhân', icon: 'fas fa-user' }
]

// Stats
const stats = computed(() => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  return {
    total: globalTotalCount.value || totalCount.value,
    active: notes.value.filter(n => n.status === 'active').length,
    completed: notes.value.filter(n => n.status === 'completed').length,
    favorites: notes.value.filter(n => n.isFavorite).length,
    archived: notes.value.filter(n => n.isArchived).length,
    // recent removed
  }
})

// Filtered notes - API đã filter rồi, chỉ cần trả về notes
const filteredNotes = computed(() => {
  // Sorting local (nếu cần)
  let sorted = [...notes.value]
  
  sorted.sort((a, b) => {
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

  return sorted
})

// Methods
const handleResetFilters = async () => {
  filters.value = {
    search: '',
    category: '',
    status: '',
    priority: '',
    dateRange: null
  }
  quickFilter.value = 'all'
  await resetFilters() // từ useNotes hook
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const toggleDensity = () => {
  density.value = density.value === 'comfortable' ? 'compact' : 'comfortable'
}

const setQuickFilter = async (filter) => {
  console.log('🔄 Setting quick filter to:', filter)
  quickFilter.value = filter
  
  // Reset category filter when switching quick filters
  filters.value.category = ''
  
  try {
    // Gọi API với filter tương ứng
    if (filter === 'favorites') {
      console.log('📱 Fetching favorite notes...')
      await fetchNotes({ isFavorite: true, isArchived: false })
      // Ensure client-side enforcement in case backend ignored the param
      notes.value = notes.value.filter(n => n.isFavorite)
      totalCount.value = notes.value.length
    } else if (filter === 'archived') {
      console.log('📦 Fetching archived notes...')
      await fetchNotes({ isArchived: true })
      // Client-side enforcement fallback
      notes.value = notes.value.filter(n => n.isArchived)
      totalCount.value = notes.value.length
    } else {
      console.log('📄 Fetching all notes...')
      // 'all' - non-archived notes
      await fetchNotes({ isArchived: false })
    }
    console.log('✅ Quick filter applied successfully:', filter)
  } catch (error) {
    console.error('❌ Error applying quick filter:', error)
  }
}

const toggleCategory = async (category) => {
  // Toggle local UI filter value (store the `value` like 'study')
  filters.value.category = filters.value.category === category ? '' : category
  quickFilter.value = 'all'

  // Map category value to backend category_id numeric (CATEGORY_MAP keys are numeric)
  const entry = Object.entries(CATEGORY_MAP).find(([id, obj]) => obj.value === category)
  const categoryId = entry ? Number(entry[0]) : null

  // Filter by category but DON'T reset categoriesSummary
  // Keep the global summary for accurate counts in sidebar
  await filterByCategory(categoryId)
}

const getCategoryCount = (category) => {
  // For "Tất cả" show global total (unfiltered)
  if (!category) return globalTotalCount.value || totalCount.value

  // Map UI category value (e.g., 'study') to categoryId (numeric) using CATEGORY_MAP
  const entry = Object.entries(CATEGORY_MAP).find(([id, obj]) => obj.value === category)
  const categoryId = entry ? Number(entry[0]) : null

  console.debug(`Getting count for category: ${category}, categoryId: ${categoryId}`)
  console.debug('categoriesSummary.value:', categoriesSummary?.value)

  // Always use categoriesSummary from backend if available (authoritative source)
  if (Array.isArray(categoriesSummary?.value) && categoriesSummary.value.length > 0 && categoryId !== null) {
    const found = categoriesSummary.value.find(c => Number(c.note_category_id) === categoryId)
    if (found) {
      return Number(found.count) || 0
    }
  }

  // Fallback: count from currently loaded notes only as last resort
  // Note: This may show 0 when filtering by category since loaded notes are filtered
  const label = entry ? entry[1].label : ''
  const fallbackCount = notes.value.filter(note => note.category === label).length
  return fallbackCount
}

const getContentTitle = () => {
  if (quickFilter.value === 'favorites') return 'Ghi chú yêu thích'
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

const confirmDeleteNote = (note) => {
  noteToDelete.value = note
  showConfirmDelete.value = true
}

const executeDeleteNote = async () => {
  if (!noteToDelete.value) return
  
  deletingNote.value = true
  
  try {
    // Call API to delete the note
    await deleteNoteAPI(noteToDelete.value.id)

    // Refresh lists and counts
    await fetchNotes()
    await fetchGlobalCount()
    
    // Refresh categories summary to update counts
    if (typeof fetchCategoriesSummary === 'function') {
      await fetchCategoriesSummary()
    }

    // Close view modal if open
    if (showViewModal.value) {
      closeViewModalWithRouter()
    }

    success(
      `Ghi chú "${noteToDelete.value.title}" đã được xóa thành công`,
      'Xóa thành công'
    )
  } catch (err) {
    console.error('Error deleting note:', err)
    error(
      'Đã xảy ra lỗi khi xóa ghi chú. Vui lòng thử lại.',
      'Lỗi xóa ghi chú'
    )
  } finally {
    deletingNote.value = false
    showConfirmDelete.value = false
    noteToDelete.value = null
  }
}

const cancelDeleteNote = () => {
  showConfirmDelete.value = false
  noteToDelete.value = null
  deletingNote.value = false
}

const deleteNote = (note) => {
  confirmDeleteNote(note)
}

const toggleFavorite = async (note) => {
  try {
    const result = await toggleFavoriteAPI(note.id)
    // Lấy state MỚI từ kết quả API
    const newState = result
    // Refresh để lấy data mới nhất và giữ bộ lọc hiện tại
    if (quickFilter.value === 'favorites') {
      await fetchNotes({ isFavorite: true, isArchived: false })
    } else if (quickFilter.value === 'archived') {
      await fetchNotes({ isArchived: true })
    } else {
      await fetchNotes({ isArchived: false })
    }
    info(
      newState 
        ? `Đã thêm ghi chú "${note.title}" vào danh sách yêu thích` 
        : `Đã xóa ghi chú "${note.title}" khỏi danh sách yêu thích`,
      newState ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích'
    )
  } catch (err) {
    error(err.message || 'Không thể cập nhật trạng thái yêu thích', 'Lỗi')
  }
}

const toggleArchive = async (note) => {
  try {
    const result = await toggleArchiveAPI(note.id)
    // Lấy state MỚI từ kết quả API
    const newState = result
    // Refresh và giữ bộ lọc hiện tại
    if (quickFilter.value === 'favorites') {
      await fetchNotes({ isFavorite: true, isArchived: false })
      notes.value = notes.value.filter(n => n.isFavorite)
      totalCount.value = notes.value.length
    } else if (quickFilter.value === 'archived') {
      await fetchNotes({ isArchived: true })
      notes.value = notes.value.filter(n => n.isArchived)
      totalCount.value = notes.value.length
    } else {
      await fetchNotes({ isArchived: false })
    }
    info(
      newState 
        ? `Ghi chú "${note.title}" đã được lưu trữ` 
        : `Ghi chú "${note.title}" đã được khôi phục`,
      newState ? 'Đã lưu trữ' : 'Đã khôi phục'
    )
  } catch (err) {
    error(err.message || 'Không thể cập nhật trạng thái lưu trữ', 'Lỗi')
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

const saveNote = async () => {
  // NoteModal đã gọi API và emit 'save'
  // Chỉ cần refresh data
  await fetchNotes()
  await fetchGlobalCount()
  
  // Refresh categories summary to update counts
  if (typeof fetchCategoriesSummary === 'function') {
    await fetchCategoriesSummary()
  }
  
  closeModalsWithRouter()
}

const handleNoteModalRefresh = async () => {
  await fetchNotes()
}

// Bulk Actions
const handleBulkDelete = async (noteIds) => {
  if (confirm(`Bạn có chắc chắn muốn xóa ${noteIds.length} ghi chú đã chọn?`)) {
    try {
      await bulkDeleteNotes(noteIds)
      selectedNotes.value = []
      success(
        `Đã xóa ${noteIds.length} ghi chú thành công`,
        'Xóa nhiều ghi chú thành công'
      )
    } catch (err) {
      error(err.message || 'Đã xảy ra lỗi khi xóa ghi chú', 'Lỗi')
    }
  }
}

const handleBulkArchive = async (noteIds) => {
  try {
    // Bulk archive - gọi API từng cái (backend chưa có bulk API)
    for (const id of noteIds) {
      const note = notes.value.find(n => n.id === id)
      if (note) {
        await toggleArchiveAPI(id)
      }
    }
    await fetchNotes()
    selectedNotes.value = []
    info(
      `Đã cập nhật trạng thái lưu trữ cho ${noteIds.length} ghi chú`,
      'Cập nhật thành công'
    )
  } catch (err) {
    error(err.message || 'Đã xảy ra lỗi', 'Lỗi')
  }
}

const handleBulkFavorite = async (noteIds) => {
  try {
    // Bulk favorite - gọi API từng cái
    for (const id of noteIds) {
      const note = notes.value.find(n => n.id === id)
      if (note) {
        await toggleFavoriteAPI(id)
      }
    }
    await fetchNotes()
    selectedNotes.value = []
    info(
      `Đã cập nhật trạng thái yêu thích cho ${noteIds.length} ghi chú`,
      'Cập nhật thành công'
    )
  } catch (err) {
    error(err.message || 'Đã xảy ra lỗi', 'Lỗi')
  }
}

const handleBulkCategory = async ({ notes: noteIds, category }) => {
  try {
    // Update category for each note via API
    for (const id of noteIds) {
      const note = notes.value.find(n => n.id === id)
      if (note) {
        // Get category ID from category label
        const categoryId = Object.entries(CATEGORY_MAP).find(
          ([_, label]) => label === category
        )?.[0]
        
        if (categoryId) {
          await updateNote(id, {
            ...note,
            categoryId: parseInt(categoryId)
          })
        }
      }
    }
    await fetchNotes()
    selectedNotes.value = []
    info(
      `Đã cập nhật danh mục cho ${noteIds.length} ghi chú`,
      'Cập nhật thành công'
    )
  } catch (err) {
    error(err.message || 'Đã xảy ra lỗi', 'Lỗi')
  }
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
const handleRouteAction = async () => {
  const action = route.meta?.action
  const noteId = route.params?.id
  
  if (action === 'create') {
    showCreateModal.value = true
  } else if (action === 'view' && noteId) {
    try {
      // Fetch note from API instead of finding in local array
      const note = await fetchNoteById(parseInt(noteId))
      if (note) {
        viewNote(note)
      } else {
        router.push({ name: 'notes' })
      }
    } catch (err) {
      error('Không tìm thấy ghi chú', 'Lỗi')
      router.push({ name: 'notes' })
    }
  } else if (action === 'edit' && noteId) {
    try {
      // Fetch note from API instead of finding in local array
      const note = await fetchNoteById(parseInt(noteId))
      if (note) {
        editNote(note)
      } else {
        router.push({ name: 'notes' })
      }
    } catch (err) {
      error('Không tìm thấy ghi chú', 'Lỗi')
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
// Watchers
watch(() => route.fullPath, () => {
  handleRouteAction()
}, { immediate: true })

// Watch search input for debounced API search
watch(() => filters.value.search, async (newVal) => {
  // Only search if 3+ characters or empty (to reset)
  if (newVal.length >= 3 || newVal === '') {
    await search(newVal)
  }
}, { debounce: 300 })

// Lifecycle
onMounted(async () => {
  // Fetch initial notes data
  try {
    await fetchNotes()
    // ensure global count is fetched too (may use categories-summary fallback)
    if (typeof fetchGlobalCount === 'function') await fetchGlobalCount()
    // Fetch categories summary from backend (for accurate per-category counts)
    if (typeof fetchCategoriesSummary === 'function') {
      // Use setTimeout to avoid conflicts with third-party scripts
      setTimeout(async () => {
        try {
          await fetchCategoriesSummary()
        } catch (e) {
          console.error('Failed to fetch categories summary:', e)
        }
      }, 1000)
    }
    handleRouteAction()
  } catch (err) {
    // Avoid uncaught exception in mounted hook when backend returns 400/SQL errors
    console.error('Initial notes load failed:', err)
    error('Không thể tải danh sách ghi chú. Vui lòng thử lại sau.', 'Lỗi tải ghi chú')
  }
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
