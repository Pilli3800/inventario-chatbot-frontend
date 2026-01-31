// chatbot.service.js
import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'

const API_URL = 'http://localhost:8080/api/ia/chat'

export const chatbotService = {
  async sendMessage(message) {
    const authStore = useAuthStore()

    return axios.post(API_URL, null, {
      params: { message },
      headers: {
        Authorization: authStore.token
      }
    })
  }
}
