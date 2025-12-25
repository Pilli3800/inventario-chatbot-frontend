import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/auth'

export const authService = {
  async login({ identUsuario, password }) {
    const { data } = await axios.post(`${API_URL}/login`, {
      identUsuario,
      password
    })
    return data.content.token
  },

  async changePassword({ actualPassword, nuevaPassword }) {
    const authStore = useAuthStore()
    return axios.patch(`${API_URL}/cambiar-password`, { actualPassword, nuevaPassword }, {
      headers: { Authorization: authStore.token }
    })
  }
}
