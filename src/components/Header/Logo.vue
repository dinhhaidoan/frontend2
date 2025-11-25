<template>
  <div class="logo-container">
    <router-link to="/" class="logo-link group">
      <div class="logo-icon-wrapper">
        <div class="logo-icon">
          <i class="fas fa-graduation-cap"></i>
          <div class="icon-glow"></div>
        </div>
        <div class="logo-particles">
          <span class="particle" v-for="n in 6" :key="n" :style="{ '--delay': n * 0.1 + 's' }"></span>
        </div>
      </div>
      <div class="logo-text">
        <h1 class="brand-name">
          <span class="brand-study">Study</span><span class="brand-hub">Hub</span>
        </h1>
        <p class="welcome-text">
          <i class="fas fa-sparkles welcome-icon"></i>
          <span class="welcome-message">Chào mừng trở lại, {{ userName }}!</span>
        </p>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUsers } from '@/hooks/useUsers'

const authStore = useAuthStore()
const { accounts, fetchUsers } = useUsers()
const currentAccount = ref(null)

const user = computed(() => currentAccount.value || authStore.user)
const userName = computed(() => user.value?.name || user.value?.user_fullname || user.value?.user_name || user.value?.user_code || 'Người dùng')

onMounted(async () => {
  try {
    if (authStore.user) {
      await fetchUsers()
      const code = authStore.user?.user_code || authStore.user?.userId || authStore.user?.id
      const found = accounts.value.find(a => a.userId === code || String(a.id) === String(authStore.user?.id))
      if (found) currentAccount.value = found
    }
  } catch (err) {
    // ignore - keep fallback to authStore
    console.warn('Logo: could not fetch users to resolve name', err)
  }
})

watch(accounts, (newAccounts) => {
  if (!newAccounts || !Array.isArray(newAccounts)) return
  const code = authStore.user?.user_code || authStore.user?.userId || authStore.user?.id
  const found = newAccounts.find(a => a.userId === code || String(a.id) === String(authStore.user?.id))
  if (found) currentAccount.value = found
})
</script>

<style scoped>
.logo-container {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.logo-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.6s ease;
}

.logo-link:hover::before {
  left: 100%;
}

.logo-link:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05));
  box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.2);
}

/* Logo Icon with Advanced Effects */
.logo-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 15px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.logo-icon::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: conic-gradient(from 0deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6);
  border-radius: 14px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.logo-link:hover .logo-icon::before {
  opacity: 1;
  animation: rotate 2s linear infinite;
}

.logo-link:hover .logo-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 
    0 8px 25px rgba(59, 130, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.logo-icon i {
  font-size: 22px;
  color: white;
  transition: all 0.4s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.logo-link:hover .logo-icon i {
  transform: scale(1.1);
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

/* Icon Glow Effect */
.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.4s ease;
}

.logo-link:hover .icon-glow {
  transform: translate(-50%, -50%) scale(2);
}

/* Animated Particles */
.logo-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #3b82f6;
  border-radius: 50%;
  opacity: 0;
  animation: float 3s ease-in-out infinite;
  animation-delay: var(--delay);
}

.particle:nth-child(1) { top: 10%; left: 20%; }
.particle:nth-child(2) { top: 20%; right: 15%; }
.particle:nth-child(3) { bottom: 25%; left: 10%; }
.particle:nth-child(4) { bottom: 15%; right: 20%; }
.particle:nth-child(5) { top: 50%; left: -10%; }
.particle:nth-child(6) { top: 50%; right: -10%; }

.logo-link:hover .particle {
  opacity: 1;
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0px) scale(0.8);
    opacity: 0;
  }
  50% { 
    transform: translateY(-15px) scale(1);
    opacity: 1;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Logo Text */
.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-name {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  line-height: 1;
}

.brand-study {
  background: linear-gradient(135deg, #1f2937, #4b5563);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.4s ease;
}

.brand-hub {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.4s ease;
}

.logo-link:hover .brand-study {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transform: translateY(-1px);
}

.logo-link:hover .brand-hub {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transform: translateY(-1px);
}

/* Welcome Text */
.welcome-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
  margin: 0;
  transition: all 0.4s ease;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.welcome-icon {
  font-size: 10px;
  color: #fbbf24;
  animation: sparkle 2s ease-in-out infinite;
}

.welcome-message {
  transition: all 0.4s ease;
}

.logo-link:hover .welcome-text {
  color: #4b5563;
  transform: translateX(2px);
}

.logo-link:hover .welcome-icon {
  color: #f59e0b;
  animation: sparkle 1s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.7; 
    transform: scale(1.2);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .logo-text {
    display: none;
  }
  
  .logo-icon {
    width: 40px;
    height: 40px;
  }
  
  .logo-icon i {
    font-size: 18px;
  }
}

@media (max-width: 640px) {
  .logo-link {
    padding: 4px 8px;
  }
  
  .logo-icon {
    width: 36px;
    height: 36px;
  }
  
  .logo-icon i {
    font-size: 16px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .brand-study {
    background: linear-gradient(135deg, #f9fafb, #d1d5db);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .welcome-text {
    color: #9ca3af;
  }
  
  .logo-link:hover .welcome-text {
    color: #d1d5db;
  }
}

/* Loading shimmer effect */
.logo-link::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.logo-link:hover::after {
  left: 100%;
}
</style>