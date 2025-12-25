import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from 'pinia'
import router from './router'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import { useAuthStore } from '@/stores/auth.store'

const app = createApp(App)

const pinia = createPinia()

app
  .use(pinia)
  .use(router)
  .use(Antd)
  .mount('#app')

// inicialización global
const authStore = useAuthStore(pinia)
authStore.loadFromStorage()
