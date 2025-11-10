import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: 'vi',
  fallbackLocale: 'en'
})
const app = createApp(App)
app.use(pinia)
app.use(i18n)
app.use(router)
app.mount('#app')
