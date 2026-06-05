import axios from 'axios'
import { apiUrl } from '@/config/api.config'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = apiUrl('/api/users')

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
