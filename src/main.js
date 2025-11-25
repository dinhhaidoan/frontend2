import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router'
import authService from '@/services/authService'
import { useAuthStore } from '@/stores/auth'

const pinia = createPinia()
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: 'vi',
  fallbackLocale: 'en'
})

// Initialize auth state before mounting app
const initializeAuth = async () => {
  const app = createApp(App)
  app.use(pinia)
  app.use(i18n)
  
  const store = useAuthStore()
  
  try {
    // Check server session via HttpOnly cookie
    const data = await authService.me()
    const user = data?.user || data?.data?.user
    if (user) {
      store.user = user
      try { localStorage.setItem('auth_user', JSON.stringify(user)) } catch (e) { /* ignore */ }
    }
  } catch (err) {
    console.warn('Backend server not available, using offline mode:', err.message)
    // Fallback to localStorage if server session invalid or server down
    store.loadUserFromStorage()
  }
  
  // Setup router AFTER auth is initialized
  app.use(router)
  app.mount('#app')
}

// Initialize auth and mount app
initializeAuth()
