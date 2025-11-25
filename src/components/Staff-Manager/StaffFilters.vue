<template>
  <div class="teacher-filters">
    <div class="filters-header">
      <h3>
        <i class="fas fa-filter"></i>
        Bộ lọc & Tìm kiếm
      </h3>
      <button @click="resetFilters" class="btn-reset">
        <i class="fas fa-refresh"></i>
        Đặt lại
      </button>
    </div>
    
    <div class="filters-grid">
      <!-- Search -->
      <div class="filter-group">
        <label>Tìm kiếm</label>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            :value="filters.search"
            @input="updateFilter('search', $event.target.value)"
            placeholder="Tìm theo tên, mã GV, email..."
          />
        </div>
      </div>
      
      <!-- Department -->
      <div class="filter-group">
        <label>Khoa/Bộ môn</label>
        <select 
          :value="filters.department"
          @change="updateFilter('department', $event.target.value)"
        >
          <option value="">Tất cả khoa</option>
          <option value="cntt">Công nghệ thông tin</option>
          <option value="dtvt">Điện tử viễn thông</option>
          <option value="kt">Kinh tế</option>
          <option value="nn">Ngoại ngữ</option>
          <option value="co-khi">Cơ khí</option>
        </select>
      </div>
      
      <!-- Status -->
      <div class="filter-group">
        <label>Trạng thái</label>
        <select 
          :value="filters.status"
          @change="updateFilter('status', $event.target.value)"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang công tác</option>
          <option value="on-break">Tạm nghỉ</option>
          <option value="resigned">Nghỉ việc</option>
        </select>
      </div>
      
      <!-- Academic Rank -->
      <div class="filter-group">
        <label>Học hàm học vị</label>
        <select 
          :value="filters.academicRank"
          @change="updateFilter('academicRank', $event.target.value)"
        >
          <option value="">Tất cả học vị</option>
          <option value="gs">Giáo sư</option>
          <option value="pgs">Phó giáo sư</option>
          <option value="ts">Tiến sĩ</option>
          <option value="ths">Thạc sĩ</option>
          <option value="ksh">Kỹ sư</option>
          <option value="cn">Cử nhân</option>
        </select>
      </div>
      
      <!-- Subject Count Range -->
      <div class="filter-group">
        <label>Số môn phụ trách</label>
        <div class="range-inputs">
          <input 
            type="number" 
            :value="filters.subjectCountMin"
            @input="updateFilter('subjectCountMin', $event.target.value)"
            placeholder="Từ"
            min="0"
          />
          <span>-</span>
          <input 
            type="number" 
            :value="filters.subjectCountMax"
            @input="updateFilter('subjectCountMax', $event.target.value)"
            placeholder="Đến"
            min="0"
          />
        </div>
      </div>
      
      <!-- Sort By -->
      <div class="filter-group">
        <label>Sắp xếp theo</label>
        <div class="sort-controls">
          <select 
            :value="filters.sortBy"
            @change="updateFilter('sortBy', $event.target.value)"
          >
            <option value="name">Họ tên</option>
            <option value="code">Mã GV</option>
            <option value="department">Khoa/Bộ môn</option>
            <option value="subjectCount">Số môn phụ trách</option>
            <option value="classCount">Số lớp phụ trách</option>
            <option value="createdAt">Ngày tham gia</option>
          </select>
          <button 
            @click="toggleSortOrder"
            class="btn-sort-order"
            :class="{ 'desc': filters.sortOrder === 'desc' }"
          >
            <i class="fas fa-sort-amount-down" v-if="filters.sortOrder === 'desc'"></i>
            <i class="fas fa-sort-amount-up" v-else></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StaffFilters',
  props: {
    filters: {
      type: Object,
      required: true
    }
  },
  emits: ['update:filters', 'reset'],
  methods: {
    updateFilter(key, value) {
      this.$emit('update:filters', { ...this.filters, [key]: value })
    },
    
    toggleSortOrder() {
      const newOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc'
      this.updateFilter('sortOrder', newOrder)
    },
    
    resetFilters() {
      this.$emit('reset')
    }
  }
}
</script>

<style scoped>
/* reuse teacher filters styles */
</style>
