<template>
  <header :style="{ left: headerLeft, width: headerWidth }" class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo section -->
        <div class="flex items-center">
          <Logo />
        </div>
        
        <!-- Search section -->
        <div class="flex-1 max-w-lg mx-8">
          <SearchBar />
        </div>
        <!-- Right section with notification and user menu -->
        <div class="flex items-center space-x-4">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Logo from '../components/Header/Logo.vue'
import SearchBar from '../components/Header/SearchBar.vue'
import NotificationBell from '../components/Header/NotificationBell.vue'
import UserMenu from '../components/Header/UserMenu.vue'

// Header positioning to avoid overlapping the sidebar when fixed
const SIDEBAR_WIDTH = 280 // keep in sync with sidebar width in layout
const headerLeft = ref('0px')
const headerWidth = ref('100%')

let _sidebarObserver = null

const updateHeaderPosition = () => {
  const mainWrapper = document.querySelector('.main-wrapper')
  const collapsed = mainWrapper ? mainWrapper.classList.contains('sidebar-collapsed') : false

  if (window.innerWidth <= 768) {
    // mobile: header spans full width
    headerLeft.value = '0px'
    headerWidth.value = '100%'
    return
  }

  if (collapsed) {
    // sidebar collapsed: header spans full viewport
    headerLeft.value = '0px'
    headerWidth.value = '100%'
  } else {
    // sidebar visible: shift header to the right and reduce width
    headerLeft.value = SIDEBAR_WIDTH + 'px'
    headerWidth.value = `calc(100% - ${SIDEBAR_WIDTH}px)`
  }
}

const initSidebarObserver = () => {
  const mainWrapper = document.querySelector('.main-wrapper')
  if (!mainWrapper) return
  _sidebarObserver = new MutationObserver(() => updateHeaderPosition())
  _sidebarObserver.observe(mainWrapper, { attributes: true, attributeFilter: ['class'] })
}

onMounted(() => {
  updateHeaderPosition()
  window.addEventListener('resize', updateHeaderPosition)
  initSidebarObserver()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHeaderPosition)
  if (_sidebarObserver) _sidebarObserver.disconnect()
})
</script>

<style scoped>
header {
  position: fixed;
  top: 0;
  z-index: 99999; /* raised so header dropdowns sit above other components */
  backdrop-filter: blur(8px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .max-w-lg {
    max-width: 300px;
  }
}

@media (max-width: 640px) {
  .mx-8 {
    margin-left: 1rem;
    margin-right: 1rem;
  }
  
  .max-w-lg {
    max-width: 200px;
  }
}
</style>
