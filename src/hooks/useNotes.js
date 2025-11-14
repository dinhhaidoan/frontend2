/**
 * useNotes Hook - Quản lý state và logic cho Notes
 */

import { ref, computed } from 'vue'
import notesService from '@/services/notesService'
import { createEmptyNote } from '@/types/note'

export function useNotes() {
  // State
  const notes = ref([])
  const currentNote = ref(null)
  const totalCount = ref(0)
  // global total (unfiltered) for the current user
  const globalTotalCount = ref(0)
  // categories summary returned from backend: [{ note_category_id, note_category_name, count }, ...]
  const categoriesSummary = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  
  // Pagination
  const currentPage = ref(1)
  const pageSize = ref(20)
  
  // Filters
  const searchQuery = ref('')
  const selectedTag = ref('')
  const selectedCategory = ref(null)
  const selectedPriority = ref('')
  const showFavoritesOnly = ref(false)
  const showArchivedOnly = ref(false)

  // Computed
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))
  const hasNotes = computed(() => notes.value.length > 0)
  const isEmpty = computed(() => !isLoading.value && !hasNotes.value)

  /**
   * Lấy user code từ localStorage
   */
  const getUserCode = () => {
    try {
      const user = JSON.parse(localStorage.getItem('auth_user'))
      return user?.user_code || user?.code || null
    } catch (error) {
      console.error('Error getting user code:', error)
      return null
    }
  }

  /**
   * Lấy danh sách ghi chú
   */
  const fetchNotes = async (params = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const userCode = getUserCode()
      if (!userCode) {
        throw new Error('User code not found. Please login again.')
      }

      const requestParams = {
        userCode,
        page: Number(params.page || currentPage.value),
        limit: Number(params.limit || pageSize.value),
        search: params.search !== undefined ? params.search : searchQuery.value,
        tag: params.tag !== undefined ? params.tag : selectedTag.value,
        categoryId: params.categoryId !== undefined ? params.categoryId : selectedCategory.value,
        priority: params.priority !== undefined ? params.priority : selectedPriority.value,
        isFavorite: params.isFavorite !== undefined ? params.isFavorite : (showFavoritesOnly.value || undefined),
        isArchived: params.isArchived !== undefined ? params.isArchived : (showArchivedOnly.value || undefined)
      }

      const result = await notesService.getNotes(requestParams)
      
      notes.value = result.rows
      totalCount.value = result.count
      // don't overwrite globalTotalCount here (callers may fetch it separately)

      // Client-side fallback: if we requested a search but backend returned unfiltered rows
      // (e.g., backend doesn't support `search` param), apply a local filter by title/content.
      // This handles cases where title-search appears not to work server-side.
      const requestedSearch = String(requestParams.search || '').trim().toLowerCase()
      if (requestedSearch) {
        const anyMatch = (result.rows || []).some(n => {
          const t = String(n.title || '').toLowerCase()
          const c = String(n.content || '').toLowerCase()
          return t.includes(requestedSearch) || c.includes(requestedSearch)
        })

        if (!anyMatch) {
          // Backend didn't filter. Try a broader client-side fallback:
          // fetch a larger batch (one request with an increased limit) and filter locally.
          // This helps find matches that are not on the current page when backend search is unsupported.
          try {
            // If backend didn't filter, do a paginated scan (up to a cap) to find matches client-side.
            const pageSizeForScan = 100
            const maxItems = 2000 // safety cap
            const maxPages = Math.ceil(maxItems / pageSizeForScan)
            let candidates = []

            for (let p = 1; p <= maxPages; p++) {
              const batch = await notesService.getNotes({ ...requestParams, page: p, limit: pageSizeForScan, search: '' })
              const rows = batch.rows || []
              if (rows.length === 0) break
              candidates = candidates.concat(rows)
              // Stop early if we already have reached maxItems
              if (candidates.length >= maxItems) break
            }

            const filtered = candidates.filter(n => {
              const t = String(n.title || '').toLowerCase()
              const c = String(n.content || '').toLowerCase()
              return t.includes(requestedSearch) || c.includes(requestedSearch)
            })

            notes.value = filtered
            totalCount.value = filtered.length
          } catch (fallbackErr) {
            // If paginated scan fails, fall back to filtering the current page only
            const filtered = (result.rows || []).filter(n => {
              const t = String(n.title || '').toLowerCase()
              const c = String(n.content || '').toLowerCase()
              return t.includes(requestedSearch) || c.includes(requestedSearch)
            })
            notes.value = filtered
            totalCount.value = filtered.length
          }
        }
      }
      
      

      return result
    } catch (err) {
      error.value = err.message
      console.error('fetchNotes error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch global total count (no filters) for current user
   */
  const fetchGlobalCount = async () => {
    try {
      const userCode = getUserCode()
      if (!userCode) return

      // Prefer categories summary endpoint (less likely to double-count when joins exist)
      try {
        const summary = await notesService.getCategoriesSummary({ userCode })
        if (Array.isArray(summary) && summary.length > 0) {
          // Sum counts from categories-summary
          const total = summary.reduce((acc, cur) => acc + (Number(cur.count) || 0), 0)
          globalTotalCount.value = total
          return globalTotalCount.value
        }
      } catch (summaryErr) {
        // If categories-summary endpoint not available or failed, fall back to legacy method
        console.debug('fetchGlobalCount: categories-summary not available or failed, falling back', summaryErr)
      }

      // Fallback: Request just 1 item but read the count from response
      const result = await notesService.getNotes({ userCode, page: 1, limit: 1 })
      globalTotalCount.value = result.count || 0
      return globalTotalCount.value
    } catch (err) {
      console.error('fetchGlobalCount error:', err)
      return 0
    }
  }

  /**
   * Fetch categories summary (counts per category) for current user
   */
  const fetchCategoriesSummary = async () => {
    try {
      const userCode = getUserCode()
      if (!userCode) {
        return
      }
      const result = await notesService.getCategoriesSummary({ userCode })
      categoriesSummary.value = result || []
      return categoriesSummary.value
    } catch (err) {
      console.error('fetchCategoriesSummary error:', err)
      throw err
    }
  }

  /**
   * Lấy chi tiết một ghi chú
   */
  const fetchNoteById = async (noteId) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await notesService.getNoteById(noteId)
      currentNote.value = result.note
      return result.note
    } catch (err) {
      error.value = err.message
      console.error('fetchNoteById error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Tạo ghi chú mới
   */
  const createNote = async (noteData, tags = []) => {
    isLoading.value = true
    error.value = null

    try {
      const userCode = getUserCode()
      if (!userCode) {
        throw new Error('User code not found. Please login again.')
      }

      const result = await notesService.createNote(noteData, tags, userCode)
      
      // Thêm note mới vào đầu danh sách
  notes.value.unshift(result.note)
  totalCount.value++

      // Refresh categories summary so sidebar counts stay accurate
      try {
        await fetchCategoriesSummary()
      } catch (e) {
        // ignore - best-effort
      }

      return result.note
    } catch (err) {
      error.value = err.message
      console.error('createNote error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cập nhật ghi chú
   */
  const updateNote = async (noteId, noteData, tags = null) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await notesService.updateNote(noteId, noteData, tags)
      
      // Cập nhật trong danh sách
      const index = notes.value.findIndex(n => n.id === noteId)
      if (index > -1) {
        notes.value[index] = result.note
      }

      // Cập nhật currentNote nếu đang xem note này
      if (currentNote.value?.id === noteId) {
        currentNote.value = result.note
      }

      // Refresh categories summary in case category changed
      try {
        await fetchCategoriesSummary()
      } catch (e) {
        // ignore - best-effort
      }

      return result.note
    } catch (err) {
      error.value = err.message
      console.error('updateNote error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Xóa ghi chú
   */
  const deleteNote = async (noteId) => {
    isLoading.value = true
    error.value = null

    try {
      await notesService.deleteNote(noteId)
      
  // Xóa khỏi danh sách
  notes.value = notes.value.filter(n => n.id !== noteId)
  totalCount.value--

      // Clear currentNote nếu đang xem note này
      if (currentNote.value?.id === noteId) {
        currentNote.value = null
      }

      return true
    } catch (err) {
      error.value = err.message
      console.error('deleteNote error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle favorite
   */
  const toggleFavorite = async (noteId) => {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return

  // Toggle: gửi giá trị nghịch đảo để backend cập nhật đúng
  const newFavoriteState = !note.isFavorite

    try {
      const result = await notesService.toggleFavorite(noteId, newFavoriteState)
      
      // Cập nhật local state từ response của API
      const updatedNote = result.note
      note.isFavorite = updatedNote.isFavorite
      
      if (currentNote.value?.id === noteId) {
        currentNote.value.isFavorite = updatedNote.isFavorite
      }

      // Refresh categories summary (best-effort) in case counts depend on favorite state
      try {
        await fetchCategoriesSummary()
      } catch (e) {
        // ignore
      }

      return updatedNote.isFavorite
    } catch (err) {
      error.value = err.message
      console.error('toggleFavorite error:', err)
      throw err
    }
  }

  /**
   * Toggle archive
   */
  const toggleArchive = async (noteId) => {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return

  // Toggle: gửi giá trị nghịch đảo để backend cập nhật đúng
  const newArchivedState = !note.isArchived

    try {
      const result = await notesService.toggleArchive(noteId, newArchivedState)
      
      // Cập nhật local state từ response của API
      const updatedNote = result.note
      note.isArchived = updatedNote.isArchived
      
      if (currentNote.value?.id === noteId) {
        currentNote.value.isArchived = updatedNote.isArchived
      }

      // Refresh categories summary (best-effort) in case counts changed
      try {
        await fetchCategoriesSummary()
      } catch (e) {
        // ignore
      }

      return updatedNote.isArchived
    } catch (err) {
      error.value = err.message
      console.error('toggleArchive error:', err)
      throw err
    }
  }

  /**
   * Bulk delete notes
   */
  const bulkDeleteNotes = async (noteIds) => {
    isLoading.value = true
    error.value = null

    try {
      await notesService.bulkDeleteNotes(noteIds)
      
  // Xóa khỏi danh sách
  notes.value = notes.value.filter(n => !noteIds.includes(n.id))
  totalCount.value -= noteIds.length

      // Refresh categories summary after bulk delete
      try {
        await fetchCategoriesSummary()
      } catch (e) {
        // ignore
      }
      return true
    } catch (err) {
      error.value = err.message
      console.error('bulkDeleteNotes error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set search query và fetch
   */
  const search = async (query) => {
    // Only support searching by tag using `#tag` syntax. Title/content search is disabled.
    searchQuery.value = '' // clear any generic search - title search disabled
    currentPage.value = 1

    // parse for tag token(s)
    const trimmed = String(query || '').trim()
    const hashMatch = trimmed.match(/#([\w\-]+)/)
    if (hashMatch) {
      const tag = hashMatch[1]
      selectedTag.value = tag
      // When searching by tag we clear the generic search query sent to backend
      await fetchNotes({ tag, search: '' })
    } else {
      // No tag provided: clear tag filter and load notes without any title search
      selectedTag.value = ''
      await fetchNotes({ search: '' })
    }
  }

  /**
   * Filter by tag
   */
  const filterByTag = async (tag) => {
    selectedTag.value = tag
    currentPage.value = 1
    await fetchNotes()
  }

  /**
   * Filter by category
   */
  const filterByCategory = async (categoryId) => {
    selectedCategory.value = categoryId
    currentPage.value = 1
    await fetchNotes()
    // Note: categoriesSummary is preserved (not reset) to maintain accurate counts in sidebar
  }

  /**
   * Filter by priority
   */
  const filterByPriority = async (priority) => {
    selectedPriority.value = priority
    currentPage.value = 1
    await fetchNotes()
  }

  /**
   * Toggle favorites filter
   */
  const toggleFavoritesFilter = async () => {
    showFavoritesOnly.value = !showFavoritesOnly.value
    currentPage.value = 1
    await fetchNotes()
  }

  /**
   * Toggle archived filter
   */
  const toggleArchivedFilter = async () => {
    showArchivedOnly.value = !showArchivedOnly.value
    currentPage.value = 1
    await fetchNotes()
  }

  /**
   * Reset all filters
   */
  const resetFilters = async () => {
    searchQuery.value = ''
    selectedTag.value = ''
    selectedCategory.value = null
    selectedPriority.value = ''
    showFavoritesOnly.value = false
    showArchivedOnly.value = false
    currentPage.value = 1
    await fetchNotes()
  }

  /**
   * Go to page
   */
  const goToPage = async (page) => {
    currentPage.value = page
    await fetchNotes()
  }

  /**
   * Clear current note
   */
  const clearCurrentNote = () => {
    currentNote.value = null
  }

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    notes,
    currentNote,
    totalCount,
    globalTotalCount,
    categoriesSummary,
    isLoading,
    error,
    
    // Pagination
    currentPage,
    pageSize,
    totalPages,
    
    // Filters
    searchQuery,
    selectedTag,
    selectedCategory,
    selectedPriority,
    showFavoritesOnly,
    showArchivedOnly,
    
    // Computed
    hasNotes,
    isEmpty,
    
    // Methods
    fetchNotes,
  fetchGlobalCount,
    fetchCategoriesSummary,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    toggleArchive,
    bulkDeleteNotes,
    search,
    filterByTag,
    filterByCategory,
    filterByPriority,
    toggleFavoritesFilter,
    toggleArchivedFilter,
    resetFilters,
    goToPage,
    clearCurrentNote,
    clearError,
    getUserCode
  }
}
