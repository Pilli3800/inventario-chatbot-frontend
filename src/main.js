import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import Antd, { message } from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import { useAuthStore } from '@/stores/auth.store'

const app = createApp(App)

const pinia = createPinia()

app
  .use(pinia)
  .use(router)
  .use(Antd)
  .mount('#app')

// Inicializacion global
const authStore = useAuthStore(pinia)
authStore.loadFromStorage()

message.config({
  top: '80px',
  duration: 2,
  maxCount: 3
})

