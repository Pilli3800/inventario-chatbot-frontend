// chatbot.service.js
import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'
import { apiUrl } from '@/config/api.config'

const API_URL = apiUrl('/api/ia/chat')

export const chatbotService = {
  async sendMessage(message, contextoPantalla) {
    const authStore = useAuthStore()
    const sessionId = localStorage.getItem('sessionId')

    const response = await axios.post(API_URL, {
      sessionId: sessionId || null,
      message,
      contextoPantalla
    }, {
      headers: {
        Authorization: authStore.token,
        'Content-Type': 'application/json'
      }
    })

    if (response.data?.content?.sessionId) {
      localStorage.setItem('sessionId', response.data.content.sessionId)
    }

    return response
  },

  async getHistorial() {
    const authStore = useAuthStore()
    const sessionId = localStorage.getItem('sessionId')

    if (!sessionId) return null

    return axios.get(`${API_URL}/${sessionId}/historial`, {
      headers: {
        Authorization: authStore.token
      }
    })
  },

  async getDashboard(params) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/dashboard`, {
      params,
      headers: {
        Authorization: authStore.token
      }
    })
  },

  async deleteSession() {
    const authStore = useAuthStore()
    const sessionId = localStorage.getItem('sessionId')

    if (!sessionId) return null

    return axios.delete(`${API_URL}/${sessionId}`, {
      headers: {
        Authorization: authStore.token
      }
    })
  },

  clearSession() {
    localStorage.removeItem('sessionId')
  }
}
