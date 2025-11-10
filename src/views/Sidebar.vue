<template>
  <aside 
    class="app-sidebar"
    :class="{ 'collapsed': isCollapsed, 'mobile-open': isMobileOpen }"
    ref="sidebarRef"
  >
    <!-- Background Effects -->
    <div class="sidebar-background">
      <div class="gradient-overlay"></div>
      <div class="noise-overlay"></div>
      <div class="floating-particles">
        <div 
          v-for="n in 15" 
          :key="n" 
          class="particle" 
          :style="{ 
            '--delay': Math.random() * 15 + 's',
            '--duration': (Math.random() * 25 + 15) + 's',
            '--x': Math.random() * 100 + '%',
            '--y': Math.random() * 100 + '%'
          }"
        ></div>
      </div>
    </div>

    <!-- Sidebar Content -->
    <div class="sidebar-content">
      <!-- Logo Section -->
      <SidebarLogo />
      
      <!-- Navigation Menu -->
      <SidebarMenu />
      
      <!-- Footer -->
      <SidebarFooter />
    </div>

    <!-- Resize Handle -->
    <div class="resize-handle" @mousedown="startResize"></div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import SidebarLogo from '../components/Sidebar/SidebarLogo.vue'
import SidebarMenu from '../components/Sidebar/SidebarMenu.vue'
import SidebarFooter from '../components/Sidebar/SidebarFooter.vue'

const props = defineProps({
  collapsed: { type: Boolean, default: false },
  mobileOpen: { type: Boolean, default: false }
})

const sidebarRef = ref(null)
const isCollapsed = ref(props.collapsed)
const isMobileOpen = ref(props.mobileOpen)
// Keep internal state in sync with parent props
watch(() => props.collapsed, (v) => { isCollapsed.value = v }, { immediate: true })
watch(() => props.mobileOpen, (v) => { isMobileOpen.value = v }, { immediate: true })
const isResizing = ref(false)
const sidebarWidth = ref(280)

const startResize = (event) => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
}

const handleResize = (event) => {
  if (!isResizing.value) return
  
  const newWidth = event.clientX
  if (newWidth >= 240 && newWidth <= 400) {
    sidebarWidth.value = newWidth
    if (sidebarRef.value) {
      sidebarRef.value.style.width = `${newWidth}px`
    }
  }
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleMobile = () => {
  isMobileOpen.value = !isMobileOpen.value
}

// Handle window resize
const handleWindowResize = () => {
  if (window.innerWidth <= 768) {
    isMobileOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleWindowResize)
  
  // Set initial width
  if (sidebarRef.value) {
    sidebarRef.value.style.width = `${sidebarWidth.value}px`
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})

// Expose methods for parent components
defineExpose({
  toggleCollapse,
  toggleMobile
})
</script>

<style scoped>
/* Base Sidebar Styles */
.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  z-index: 50;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* Background Effects */
.sidebar-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.95) 50%,
    rgba(249, 250, 251, 0.98) 100%
  );
  backdrop-filter: blur(20px) saturate(1.2);
  border-right: 1px solid rgba(229, 231, 235, 0.5);
}

.noise-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.015;
  background-image: 
    radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0);
  background-size: 18px 18px;
  animation: noise 25s linear infinite;
}

@keyframes noise {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-3%, -3%); }
  20% { transform: translate(-6%, 3%); }
  30% { transform: translate(3%, -6%); }
  40% { transform: translate(-3%, 9%); }
  50% { transform: translate(-6%, 3%); }
  60% { transform: translate(9%, 0%); }
  70% { transform: translate(0%, 9%); }
  80% { transform: translate(-9%, 6%); }
  90% { transform: translate(6%, 3%); }
}

/* Floating Particles */
.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 1.5px;
  height: 1.5px;
  background: rgba(59, 130, 246, 0.25);
  border-radius: 50%;
  animation: float var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
  top: var(--y);
  left: var(--x);
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg);
    opacity: 0;
  }
  10% { opacity: 1; }
  90% { opacity: 1; }
  50% { 
    transform: translateY(-15px) rotate(180deg);
    opacity: 0.6;
  }
}

/* Sidebar Content */
.sidebar-content {
  position: relative;
  z-index: 10;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
}

/* Collapsed State */
.app-sidebar.collapsed {
  width: 80px;
}

.app-sidebar.collapsed .sidebar-content {
  overflow: hidden;
}

/* Resize Handle */
.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  cursor: ew-resize;
  background: transparent;
  transition: background-color 0.3s ease;
  z-index: 20;
}

.resize-handle:hover {
  background: rgba(59, 130, 246, 0.2);
}

.resize-handle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1px;
  height: 40px;
  background: rgba(156, 163, 175, 0.4);
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.resize-handle:hover::before {
  background: rgba(59, 130, 246, 0.6);
  height: 60px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .app-sidebar {
    transform: translateX(-100%);
    box-shadow: none;
  }
  
  .app-sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
  
  .resize-handle {
    display: none;
  }
}

/* Enhanced Shadow Effects */
.app-sidebar {
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 10px 15px -3px rgba(0, 0, 0, 0.08);
}

/* Scrollbar Styling */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(229, 231, 235, 0.2);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.6);
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .gradient-overlay {
    background: linear-gradient(
      135deg,
      rgba(17, 24, 39, 0.98) 0%,
      rgba(17, 24, 39, 0.95) 50%,
      rgba(31, 41, 55, 0.98) 100%
    );
    border-right-color: rgba(75, 85, 99, 0.5);
  }
  
  .particle {
    background: rgba(147, 51, 234, 0.25);
  }
  
  .resize-handle:hover {
    background: rgba(147, 51, 234, 0.2);
  }
  
  .resize-handle:hover::before {
    background: rgba(147, 51, 234, 0.6);
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .gradient-overlay {
    backdrop-filter: none;
    background: rgba(255, 255, 255, 1);
    border-right: 2px solid #000;
  }
  
  .floating-particles {
    display: none;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .app-sidebar,
  .particle,
  .resize-handle,
  .resize-handle::before {
    transition: none;
    animation: none;
  }
  
  .floating-particles {
    display: none;
  }
}

/* Print Styles */
@media print {
  .app-sidebar {
    position: static;
    width: auto;
    height: auto;
    background: white;
    box-shadow: none;
  }
  
  .floating-particles,
  .noise-overlay,
  .resize-handle {
    display: none;
  }
}

/* Focus Styles for Accessibility */
.app-sidebar:focus-within {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

/* Loading State */
.app-sidebar.loading {
  pointer-events: none;
}

.app-sidebar.loading .sidebar-content {
  opacity: 0.6;
}

/* Performance Optimizations */
.app-sidebar {
  contain: layout style paint;
  will-change: transform, width;
}

.floating-particles {
  contain: layout style paint;
}

/* Tablet Styles */
@media (max-width: 1024px) and (min-width: 769px) {
  .app-sidebar {
    width: 260px;
  }
}

/* Animation for sidebar entrance */
.app-sidebar {
  animation: slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Hover effect for entire sidebar */
.app-sidebar:hover .gradient-overlay {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.99) 0%,
    rgba(255, 255, 255, 0.97) 50%,
    rgba(249, 250, 251, 0.99) 100%
  );
  backdrop-filter: blur(25px) saturate(1.4);
}

.app-sidebar:hover .floating-particles .particle {
  background: rgba(59, 130, 246, 0.4);
  animation-duration: calc(var(--duration) * 0.7);
}
</style>