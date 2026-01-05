import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_URL = 'http://localhost:8080/api/sedes'

export const sedeService = {

  async getSedes() {
    const authStore = useAuthStore()

    return axios.get(API_URL, {
      headers: {
        Authorization: authStore.token
      }
    })
  },

  async getActivas() {
    const authStore = useAuthStore()
    return axios.get(`${API_URL}/activas`, {
      headers: { Authorization: authStore.token }
    })
  }

}
