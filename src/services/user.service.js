import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/users'

export const userService = {
  async search(params) {
    const authStore = useAuthStore()

    return axios.get(API_URL, {
      params,
      headers: {
        Authorization: authStore.token
      }
    })
  },

  async get(identUsuario) {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/${identUsuario}`, {
      headers: { Authorization: authStore.token }
    })
  }
}
